import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapControls } from './MapControls';
import { useMapState } from '@/hooks/useMapState';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Listing {
  id: string;
  title: string;
  price_month: number;
  lat: number;
  lng: number;
  photos?: string[];
  city: string;
  neighborhood?: string;
  formatted_address?: string;
  lister_first_name?: string;
}

interface MapContainerProps {
  listings?: Listing[];
  onListingHover?: (listingId: string | null) => void;
  onListingClick?: (listingId: string) => void;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
  autoSearch?: boolean;
  onAutoSearchChange?: (checked: boolean) => void;
  onManualSearch?: () => void;
}

export const MapContainer = ({ 
  listings = [], 
  onListingHover,
  onListingClick,
  hoveredListingId,
  selectedListingId,
  autoSearch = false,
  onAutoSearchChange,
  onManualSearch
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const isMobile = useIsMobile();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const {
    mapState,
    setCenter,
    setZoom,
    setBounds,
    setSelectedPinId,
    setHoveredPinId,
    setIsMoving,
    setHasUserMoved,
    updateResultsForBounds,
    locateUser
  } = useMapState();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibXBvdWZpc3RoIiwiYSI6ImNtZzNsaW02NjE3OHQycXF3aGp2ZmcyaDkifQ.3uU3F5ayX9teACIm7C9fxQ';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: mapState.center,
      zoom: mapState.zoom,
      // Mobile optimizations
      touchZoomRotate: true,
      touchPitch: false, // Disable pitch on mobile for simpler interaction
      dragRotate: false, // Disable rotation for simpler UX
      pitchWithRotate: false,
      dragPan: {
        linearity: 0.3,
        easing: t => t,
        maxSpeed: 1400,
        deceleration: 2500
      },
      attributionControl: false
    });

    // Add navigation control - minimal on mobile
    if (!isMobile) {
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
          visualizePitch: false
        }),
        'bottom-right'
      );
    }
    
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    // Optimize scroll/zoom for mobile
    if (isMobile) {
      map.current.scrollZoom.disable(); // Prevent accidental zoom
      map.current.doubleClickZoom.enable(); // Allow double-tap zoom
    }

    // Map load event
    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Map event handlers with optimized debouncing for mobile
    map.current.on('movestart', () => {
      setIsMoving(true);
    });

    map.current.on('moveend', () => {
      if (!map.current) return;

      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      const bounds = map.current.getBounds();

      setCenter([center.lng, center.lat]);
      setZoom(zoom);
      setBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
      setIsMoving(false);

      // Trigger search automatically if enabled - longer debounce on mobile
      const searchDelay = isMobile ? 500 : 300;
      if (autoSearch) {
        setTimeout(() => {
          updateResultsForBounds();
        }, searchDelay);
      } else {
        setHasUserMoved(true);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Show user location marker
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    if (mapState.userLocation) {
      // Remove existing user location marker
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }

      // Create custom user location marker
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#4285F4';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      userLocationMarkerRef.current = new mapboxgl.Marker(el)
        .setLngLat(mapState.userLocation)
        .addTo(map.current);
    }
  }, [mapState.userLocation, isMapLoaded]);

  // Update markers when listings change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Limit markers on mobile for performance
    const displayListings = isMobile ? listings.slice(0, 100) : listings;

    // Create markers for each listing
    displayListings.forEach((listing) => {
      if (!listing.lat || !listing.lng) return;

      const isHovered = hoveredListingId === listing.id;
      const isSelected = selectedListingId === listing.id;

      // Create marker element
      const el = document.createElement('div');
      el.style.width = isMobile ? '36px' : '40px';
      el.style.height = isMobile ? '36px' : '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = isHovered || isSelected ? '#FF385C' : '#fff';
      el.style.border = '2px solid #FF385C';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = 'bold';
      el.style.fontSize = isMobile ? '11px' : '13px';
      el.style.color = isHovered || isSelected ? '#fff' : '#FF385C';
      el.style.boxShadow = isMobile ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.2)';
      el.style.transition = 'all 0.2s ease';
      el.style.touchAction = 'manipulation';
      el.textContent = `€${listing.price_month}`;

      // Touch-friendly interactions
      if (isMobile) {
        // On mobile, tap to select and show details
        el.addEventListener('touchstart', (e) => {
          e.preventDefault();
          el.style.transform = 'scale(1.1)';
        });

        el.addEventListener('touchend', () => {
          el.style.transform = 'scale(1)';
          onListingClick?.(listing.id);
          setSelectedPinId(listing.id);
        });
      } else {
        // Desktop hover behavior
        el.addEventListener('mouseenter', () => {
          onListingHover?.(listing.id);
        });

        el.addEventListener('mouseleave', () => {
          onListingHover?.(null);
        });

        el.addEventListener('click', () => {
          onListingClick?.(listing.id);
          setSelectedPinId(listing.id);
        });
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([listing.lng, listing.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [listings, hoveredListingId, selectedListingId, onListingHover, onListingClick, setSelectedPinId, isMapLoaded, isMobile]);

  return (
    <div className="relative w-full h-full bg-muted">
      {/* Loading skeleton */}
      {!isMapLoaded && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background rounded-lg shadow-lg px-6 py-4">
              <p className="text-sm text-muted-foreground">Φόρτωση χάρτη...</p>
            </div>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0" />
      
      <MapControls 
        autoSearch={autoSearch}
        onAutoSearchChange={onAutoSearchChange}
        onManualSearch={onManualSearch}
        hasUserMoved={mapState.hasUserMoved}
        onLocateUser={locateUser}
        isLocating={mapState.isLocating}
      />
    </div>
  );
};
