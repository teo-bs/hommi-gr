import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapState } from "@/hooks/useMapState";
import { MapControls } from "./MapControls";
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  slug: string;
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
  hasUserMoved?: boolean;
  onMapReady?: () => void;
}

export const MapContainer = ({ 
  listings = [], 
  onListingHover,
  onListingClick,
  hoveredListingId,
  selectedListingId,
  autoSearch = false,
  onAutoSearchChange,
  onManualSearch,
  hasUserMoved = false,
  onMapReady
}: MapContainerProps) => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const clustersSource = useRef<mapboxgl.GeoJSONSource | null>(null);
  const hoverPopup = useRef<mapboxgl.Popup | null>(null);
  const popupCloseTimer = useRef<NodeJS.Timeout | null>(null);
  
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
  const createPopupContent = (props: any, photos: string[], slug: string) => {
    const container = document.createElement('div');
    container.className = 'map-popup-container';
    container.style.cursor = 'pointer';
    
    // Make entire container clickable
    container.onclick = () => {
      navigate(`/listing/${slug}`);
    };
    
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
      prevBtn.className = 'absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl font-bold z-10 cursor-pointer transition-all hover:scale-110';
      prevBtn.style.border = 'none';
      prevBtn.style.display = 'flex';
      prevBtn.style.alignItems = 'center';
      prevBtn.style.justifyContent = 'center';
      prevBtn.style.color = '#000';
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        cycleImages(imageContainer, -1);
      };
      
      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '›';
      nextBtn.className = 'absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl font-bold z-10 cursor-pointer transition-all hover:scale-110';
      nextBtn.style.border = 'none';
      nextBtn.style.display = 'flex';
      nextBtn.style.alignItems = 'center';
      nextBtn.style.justifyContent = 'center';
      nextBtn.style.color = '#000';
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
    
    // Add Save button (heart icon)
    const saveButton = document.createElement('button');
    saveButton.className = 'absolute top-2 right-2 w-9 h-9 rounded-full bg-background/90 hover:bg-background shadow-sm flex items-center justify-center z-20 cursor-pointer transition-all hover:scale-110';
    saveButton.setAttribute('data-room-id', props.id);
    saveButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    `;

    // Check if room is already saved and update icon
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from('saved_rooms')
            .select('id')
            .eq('room_id', props.id)
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (data) {
            const svg = saveButton.querySelector('svg');
            if (svg) svg.setAttribute('fill', 'currentColor');
          }
        }
      } catch (err) {
        console.error('Error checking saved status:', err);
      }
    })();

    saveButton.onclick = async (e) => {
      e.stopPropagation();
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('Please login to save listings');
          return;
        }

        const { data: existingSave } = await supabase
          .from('saved_rooms')
          .select('id')
          .eq('room_id', props.id)
          .eq('user_id', session.user.id)
          .maybeSingle();

        const svg = saveButton.querySelector('svg');
        
        if (existingSave) {
          // Unsave
          await supabase
            .from('saved_rooms')
            .delete()
            .eq('id', existingSave.id);
          
          if (svg) svg.setAttribute('fill', 'none');
        } else {
          // Save
          await supabase
            .from('saved_rooms')
            .insert({ room_id: props.id, user_id: session.user.id });
          
          if (svg) svg.setAttribute('fill', 'currentColor');
        }
      } catch (err) {
        console.error('Error toggling save:', err);
      }
    };

    imageContainer.appendChild(saveButton);
    
    carouselWrapper.appendChild(imageContainer);
    container.appendChild(carouselWrapper);
    
  // Add content section - using textContent to prevent XSS
  const content = document.createElement('div');
  content.style.padding = '12px';
  
  const titleDiv = document.createElement('div');
  titleDiv.style.cssText = 'font-weight: 600; font-size: 14px; margin-bottom: 2px; color: hsl(var(--foreground));';
  titleDiv.textContent = props.title;
  
  const listerDiv = document.createElement('div');
  listerDiv.style.cssText = 'font-size: 13px; margin-bottom: 4px; color: hsl(var(--muted-foreground));';
  listerDiv.textContent = props.lister_name || 'Host';
  
  const priceDiv = document.createElement('div');
  priceDiv.style.cssText = 'font-size: 14px; color: hsl(var(--foreground));';
  const priceStrong = document.createElement('span');
  priceStrong.style.fontWeight = '600';
  priceStrong.textContent = props.price ? `€${props.price}` : 'N/A';
  const priceLabel = document.createElement('span');
  priceLabel.style.cssText = 'color: hsl(var(--muted-foreground)); font-size: 13px;';
  priceLabel.textContent = ' /μήνα';
  priceDiv.appendChild(priceStrong);
  priceDiv.appendChild(priceLabel);
  
  content.appendChild(titleDiv);
  content.appendChild(listerDiv);
  content.appendChild(priceDiv);
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
      .filter(listing => listing.lat && listing.lng && listing.price_month) // Ensure complete data
      .map(listing => ({
        type: 'Feature' as const,
      properties: {
        id: listing.id,
        slug: listing.slug, // Add slug for navigation
        title: listing.title,
        price: listing.price_month,
        lister_name: listing.lister_first_name || 'Host',
        city: listing.city,
        neighborhood: listing.neighborhood,
        photo: listing.photos?.[0] || '/placeholder.svg',
        photos: JSON.stringify(listing.photos || [listing.photos?.[0] || '/placeholder.svg'].filter(Boolean)),
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
      attributionControl: false,
      maxTileCacheSize: 50,
      refreshExpiredTiles: false,
      trackResize: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({
      showCompass: false, // Hide compass on mobile for cleaner UI
      showZoom: true
    }), 'top-right');
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    
    // Enhanced mobile optimizations
    if (window.innerWidth < 768) {
      map.current.scrollZoom.disable();
      map.current.touchZoomRotate.enable();
      map.current.touchPitch.disable();
      map.current.dragRotate.disable();
      
      // Set zoom limits to prevent users from zooming too far in/out
      map.current.setMaxZoom(18);
      map.current.setMinZoom(10);
      
      // Optimize drag pan with custom easing and speed for mobile
      map.current.dragPan.enable();
    }

    // Handle container resize (important for mobile view switching)
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.resize();
      }
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    // Map event handlers with debouncing for better mobile performance
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
      // On mobile, use longer debounce for better performance
      const searchDelay = window.innerWidth < 768 ? 500 : 300;
      if (autoSearch) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('mapBoundsChanged', { 
            detail: { bounds: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            } } 
          }));
        }, searchDelay);
      } else {
        setHasUserMoved(true);
      }
    });

    // Load complete handler
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Notify parent that map is ready
      onMapReady?.();

      // Add clusters source with price aggregations
      map.current.addSource('listings', {
        type: 'geojson',
        data: createGeoJSONData(),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: window.innerWidth < 768 ? 30 : 50, // Smaller radius on mobile
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
            // Create new HTML marker - using textContent to prevent XSS
            const el = document.createElement('div');
            el.className = 'map-price-marker';
            
            const priceBubble = document.createElement('div');
            priceBubble.className = 'price-bubble';
            priceBubble.setAttribute('data-listing-id', id);
            priceBubble.textContent = `€${props.price.toLocaleString()}`;
            
            el.appendChild(priceBubble);
            
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
            el.addEventListener('mouseenter', async () => {
              if (!map.current) return;
              
              // Cancel any pending close timer
              if (popupCloseTimer.current) {
                clearTimeout(popupCloseTimer.current);
                popupCloseTimer.current = null;
              }
              
              setHoveredPinId(id);
              onListingHover?.(id);
              
              // Show hover preview popup
              if (hoverPopup.current) {
                hoverPopup.current.remove();
              }
              
              // Fetch photos for this specific room
              let photoUrls: string[] = [];
              try {
                const { data: roomPhotosData, error } = await supabase
                  .from('room_photos')
                  .select('url, medium_url, thumbnail_url, sort_order')
                  .eq('room_id', id)
                  .is('deleted_at', null)
                  .order('sort_order', { ascending: true })
                  .limit(6);
                
                if (!error && roomPhotosData && roomPhotosData.length > 0) {
                  photoUrls = roomPhotosData.map(p => p.medium_url || p.url || p.thumbnail_url).filter(Boolean) as string[];
                }
              } catch (err) {
                console.error('Error fetching room photos:', err);
              }
              
              // Fallback to original photo if fetch failed
              if (photoUrls.length === 0) {
                const photos = JSON.parse(props.photos || '[]');
                photoUrls = photos.length > 0 ? photos : ['/placeholder.svg'];
              }
              
              // Extract slug from props or fallback to listing
              const slug = props.slug || (listings.find(l => l.id === id) as any)?.slug || id;
              
              hoverPopup.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 15,
                className: 'map-hover-popup',
                maxWidth: '300px'
              })
                .setLngLat(coords)
                .setDOMContent(createPopupContent(props, photoUrls, slug))
                .addTo(map.current!);
              
              // Keep popup open when hovering over it
              const popupElement = hoverPopup.current.getElement();
              
              popupElement.addEventListener('mouseenter', () => {
                // Cancel any pending close
                if (popupCloseTimer.current) {
                  clearTimeout(popupCloseTimer.current);
                  popupCloseTimer.current = null;
                }
              });

              popupElement.addEventListener('mouseleave', () => {
                // Close popup when leaving it
                setHoveredPinId(null);
                onListingHover?.(null);
                
                if (hoverPopup.current) {
                  hoverPopup.current.remove();
                  hoverPopup.current = null;
                }
              });
            });
            
            el.addEventListener('mouseleave', () => {
              // Delay closing to allow mouse to move to popup
              popupCloseTimer.current = setTimeout(() => {
                setHoveredPinId(null);
                onListingHover?.(null);
                
                if (hoverPopup.current) {
                  hoverPopup.current.remove();
                  hoverPopup.current = null;
                }
              }, 150); // 150ms delay
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
      resizeObserver.disconnect();
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

  // Smooth flyTo when selectedListingId changes (mobile carousel sync)
  useEffect(() => {
    if (!selectedListingId || !map.current) return;
    
    const listing = listings.find(l => l.id === selectedListingId);
    if (!listing) return;
    
    // Only center, don't change zoom - respect user's preference
    map.current.easeTo({
      center: [listing.lng, listing.lat],
      duration: 400,
      essential: true,
      easing: (t) => 1 - Math.pow(1 - t, 3) // Ease-out cubic
    });
    
    // Subtle highlight (no pulse animation)
    const marker = markersRef.current.get(selectedListingId);
    if (marker) {
      const bubble = marker.getElement().querySelector('.price-bubble');
      if (bubble) {
        bubble.classList.add('active');
        setTimeout(() => bubble.classList.remove('active'), 300);
      }
    }
  }, [selectedListingId, listings]);

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