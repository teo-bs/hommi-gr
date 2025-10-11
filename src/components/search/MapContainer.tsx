import { useEffect, useRef, useCallback } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapState } from "@/hooks/useMapState";
import { MapControls } from "./MapControls";

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
  const clustersSource = useRef<mapboxgl.GeoJSONSource | null>(null);
  const hoverPopup = useRef<mapboxgl.Popup | null>(null);
  
  const { 
    mapState, 
    setCenter, 
    setZoom, 
    setBounds, 
    setSelectedPinId, 
    setHoveredPinId, 
    setIsMoving, 
    setHasUserMoved,
    resetUserMoved 
  } = useMapState();

  // Store HTML markers
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Create popup content with carousel
  const createPopupContent = (props: any, photos: string[]) => {
    const container = document.createElement('div');
    container.className = 'map-popup-container';
    
    // Create carousel wrapper
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'relative';
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'relative w-full h-[180px] bg-muted';
    
    // Add images
    photos.forEach((photo, index) => {
      const img = document.createElement('img');
      img.src = photo;
      img.alt = props.title;
      img.className = `absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${index === 0 ? 'opacity-100' : 'opacity-0'}`;
      img.dataset.index = String(index);
      imageContainer.appendChild(img);
    });
    
    // Add navigation arrows if multiple photos
    if (photos.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '‹';
      prevBtn.className = 'absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-xl font-bold z-10 cursor-pointer';
      prevBtn.style.border = 'none';
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        cycleImages(imageContainer, -1);
      };
      
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '›';
      nextBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-xl font-bold z-10 cursor-pointer';
      nextBtn.style.border = 'none';
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        cycleImages(imageContainer, 1);
      };
      
      imageContainer.appendChild(prevBtn);
      imageContainer.appendChild(nextBtn);
      
      // Add photo counter
      const counter = document.createElement('div');
      counter.className = 'absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10';
      counter.textContent = `1/${photos.length}`;
      counter.dataset.counter = 'true';
      imageContainer.appendChild(counter);
    }
    
    carouselWrapper.appendChild(imageContainer);
    container.appendChild(carouselWrapper);
    
    // Add content section
    const content = document.createElement('div');
    content.style.padding = '12px';
    content.innerHTML = `
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: hsl(var(--foreground));">${props.title}</div>
      <div style="font-size: 14px; color: hsl(var(--foreground));"><span style="font-weight: 600;">€${props.price}</span> <span style="color: hsl(var(--muted-foreground)); font-size: 13px;">/μήνα</span></div>
    `;
    container.appendChild(content);
    
    return container;
  };

  // Image cycling function
  const cycleImages = (container: HTMLElement, direction: number) => {
    const images = Array.from(container.querySelectorAll('img[data-index]')) as HTMLImageElement[];
    const counter = container.querySelector('[data-counter]');
    
    let currentIndex = images.findIndex(img => img.classList.contains('opacity-100'));
    images[currentIndex].classList.remove('opacity-100');
    images[currentIndex].classList.add('opacity-0');
    
    currentIndex = (currentIndex + direction + images.length) % images.length;
    images[currentIndex].classList.remove('opacity-0');
    images[currentIndex].classList.add('opacity-100');
    
    if (counter) {
      counter.textContent = `${currentIndex + 1}/${images.length}`;
    }
  };

  // Convert listings to GeoJSON
  const createGeoJSONData = useCallback(() => {
    const features = listings
      .filter(listing => listing.lat && listing.lng)
      .map(listing => ({
        type: 'Feature' as const,
      properties: {
        id: listing.id,
        title: listing.title,
        price: listing.price_month,
        city: listing.city,
        neighborhood: listing.neighborhood,
        photo: listing.photos?.[0] || null,
        photos: JSON.stringify(listing.photos || [listing.photos?.[0]].filter(Boolean)),
        formatted_address: listing.formatted_address || `${listing.neighborhood || listing.city}, Greece`
      },
        geometry: {
          type: 'Point' as const,
          coordinates: [listing.lng, listing.lat]
        }
      }));

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [listings]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('Initializing Mapbox GL map');

    const MAPBOX_TOKEN = 'pk.eyJ1IjoibXBvdWZpc3RoIiwiYSI6ImNtZzNsaW02NjE3OHQycXF3aGp2ZmcyaDkifQ.3uU3F5ayX9teACIm7C9fxQ';
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: mapState.center,
      zoom: mapState.zoom,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    // Map event handlers
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
      
      // Trigger search automatically if enabled, otherwise just mark as moved
      if (autoSearch) {
        window.dispatchEvent(new CustomEvent('mapBoundsChanged', { 
          detail: { bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          } } 
        }));
      } else {
        setHasUserMoved(true);
      }
    });

    // Load complete handler
    map.current.on('load', () => {
      if (!map.current) return;

      // Add clusters source with price aggregations
      map.current.addSource('listings', {
        type: 'geojson',
        data: createGeoJSONData(),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
        clusterProperties: {
          avg_price: ['/', ['+', ['get', 'price']], ['get', 'point_count']],
          min_price: ['min', ['get', 'price']]
        }
      });

      clustersSource.current = map.current.getSource('listings') as mapboxgl.GeoJSONSource;

      // Cluster circles with price-based gradient
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'avg_price'],
            '#51bbd6',
            500,
            '#f1f075',
            700,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Cluster count labels
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': 'hsl(var(--primary-foreground))'
        }
      });

      // Create HTML markers for individual listings
      const updateMarkers = () => {
        if (!map.current) return;
        
        const features = map.current.querySourceFeatures('listings', {
          sourceLayer: undefined
        }).filter((feature: any) => !feature.properties.cluster);

        // Remove markers for listings no longer visible
        const currentIds = new Set(features.map((f: any) => f.properties.id));
        markersRef.current.forEach((marker, id) => {
          if (!currentIds.has(id)) {
            marker.remove();
            markersRef.current.delete(id);
          }
        });

        // Add/update markers for visible listings
        features.forEach((feature: any) => {
          const coords = (feature.geometry as any).coordinates;
          const props = feature.properties;
          const id = props.id;
          
          let marker = markersRef.current.get(id);
          
          if (!marker) {
            // Create new HTML marker
            const el = document.createElement('div');
            el.className = 'map-price-marker';
            el.innerHTML = `
              <div class="price-bubble" data-listing-id="${id}">
                €${props.price.toLocaleString()}
              </div>
            `;
            
            marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
              .setLngLat(coords)
              .addTo(map.current!);
            
            // Add click handler
            el.addEventListener('click', () => {
              setSelectedPinId(id);
              onListingClick?.(id);
              
              // Show popup
              new mapboxgl.Popup({ closeButton: true, closeOnClick: true })
                .setLngLat(coords)
                .setHTML(`
                  <div style="padding: 8px; max-width: 200px;">
                    <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${props.title}</strong>
                    <span style="font-size: 12px; color: #666;">${props.formatted_address}</span>
                  </div>
                `)
                .addTo(map.current!);
            });
            
            // Add hover handlers
            el.addEventListener('mouseenter', () => {
              if (!map.current) return;
              setHoveredPinId(id);
              onListingHover?.(id);
              
              // Show hover preview popup
              if (hoverPopup.current) {
                hoverPopup.current.remove();
              }
              
              const photos = JSON.parse(props.photos || '[]');
              const photoUrls = photos.length > 0 ? photos : ['/placeholder.svg'];
              
              hoverPopup.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 15,
                className: 'map-hover-popup',
                maxWidth: '300px'
              })
                .setLngLat(coords)
                .setDOMContent(createPopupContent(props, photoUrls))
                .addTo(map.current!);
            });
            
            el.addEventListener('mouseleave', () => {
              setHoveredPinId(null);
              onListingHover?.(null);
              
              if (hoverPopup.current) {
                hoverPopup.current.remove();
                hoverPopup.current = null;
              }
            });
            
            markersRef.current.set(id, marker);
          }
          
          // Update marker state based on hover/selected
          const bubble = marker.getElement().querySelector('.price-bubble') as HTMLElement;
          if (bubble) {
            bubble.classList.toggle('hovered', id === hoveredListingId);
            bubble.classList.toggle('selected', id === selectedListingId);
          }
        });
      };

      // Initial marker creation
      map.current.on('sourcedata', (e) => {
        if (e.sourceId === 'listings' && e.isSourceLoaded) {
          updateMarkers();
        }
      });

      map.current.on('moveend', updateMarkers);
      map.current.on('zoom', updateMarkers);

      // Click handlers
      map.current.on('click', 'clusters', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties?.cluster_id;
        if (clusterId) {
          (map.current.getSource('listings') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || !map.current) return;
              map.current.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom
              });
            }
          );
        }
      });


      map.current.on('mouseenter', 'clusters', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'clusters', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      map.current?.remove();
    };
  }, []);

  // Update map data when listings change
  useEffect(() => {
    if (clustersSource.current) {
      clustersSource.current.setData(createGeoJSONData());
    }
  }, [listings, createGeoJSONData]);

  // Handle external hover/selection changes
  useEffect(() => {
    // Update all marker states
    markersRef.current.forEach((marker, id) => {
      const bubble = marker.getElement().querySelector('.price-bubble') as HTMLElement;
      if (bubble) {
        bubble.classList.toggle('hovered', id === hoveredListingId);
        bubble.classList.toggle('selected', id === selectedListingId);
      }
    });
  }, [hoveredListingId, selectedListingId]);

  const handleUpdateResults = () => {
    console.log('Updating results for current map bounds');
    resetUserMoved();
    // Dispatch event for parent component to handle
    window.dispatchEvent(new CustomEvent('mapBoundsChanged', { 
      detail: { bounds: mapState.bounds } 
    }));
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Map Controls */}
      <MapControls
        autoSearch={autoSearch}
        onAutoSearchChange={onAutoSearchChange || (() => {})}
        onManualSearch={onManualSearch || handleUpdateResults}
        hasUserMoved={mapState.hasUserMoved}
      />
    </div>
  );
};