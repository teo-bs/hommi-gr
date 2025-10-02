import { useEffect, useRef, useCallback } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapState } from "@/hooks/useMapState";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export interface Listing {
  id: string;
  title: string;
  price_month: number;
  geo?: {
    lat: number;
    lng: number;
  };
  photos?: string[];
  city: string;
  neighborhood?: string;
}

interface MapContainerProps {
  listings?: Listing[];
  onListingHover?: (listingId: string | null) => void;
  onListingClick?: (listingId: string) => void;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
}

export const MapContainer = ({ 
  listings = [], 
  onListingHover,
  onListingClick,
  hoveredListingId,
  selectedListingId
}: MapContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const clustersSource = useRef<mapboxgl.GeoJSONSource | null>(null);
  
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

  // Convert listings to GeoJSON
  const createGeoJSONData = useCallback(() => {
    const features = listings
      .filter(listing => listing.geo?.lat && listing.geo?.lng)
      .map(listing => ({
        type: 'Feature' as const,
        properties: {
          id: listing.id,
          title: listing.title,
          price: listing.price_month,
          city: listing.city,
          neighborhood: listing.neighborhood,
          photo: listing.photos?.[0] || null,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [listing.geo!.lng, listing.geo!.lat]
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
      setHasUserMoved(true);
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

      // Individual pins
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'id'], selectedListingId || ''],
            'hsl(var(--primary))',
            ['==', ['get', 'id'], hoveredListingId || ''],
            'hsl(var(--primary))',
            'hsl(var(--primary))'
          ],
          'circle-radius': [
            'case',
            ['==', ['get', 'id'], selectedListingId || ''],
            12,
            ['==', ['get', 'id'], hoveredListingId || ''],
            10,
            8
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'id'], selectedListingId || ''],
            3,
            ['==', ['get', 'id'], hoveredListingId || ''],
            2,
            1
          ],
          'circle-stroke-color': 'hsl(var(--background))',
          'circle-opacity': 0.9
        }
      });

      // Price labels for individual pins
      map.current.addLayer({
        id: 'unclustered-point-label',
        type: 'symbol',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': '€{price}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 0],
          'text-anchor': 'center'
        },
        paint: {
          'text-color': 'hsl(var(--primary-foreground))'
        }
      });

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

      map.current.on('click', 'unclustered-point', (e) => {
        const features = e.features;
        if (features && features[0]) {
          const listingId = features[0].properties?.id;
          if (listingId) {
            setSelectedPinId(listingId);
            onListingClick?.(listingId);
          }
        }
      });

      // Hover handlers
      map.current.on('mouseenter', 'unclustered-point', (e) => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = 'pointer';
        const features = e.features;
        if (features && features[0]) {
          const listingId = features[0].properties?.id;
          if (listingId) {
            setHoveredPinId(listingId);
            onListingHover?.(listingId);
          }
        }
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        if (!map.current) return;
        map.current.getCanvas().style.cursor = '';
        setHoveredPinId(null);
        onListingHover?.(null);
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
    if (!map.current) return;
    
    // Update pin styles when external hover/selection changes
    if (map.current.getLayer('unclustered-point')) {
      map.current.setPaintProperty('unclustered-point', 'circle-color', [
        'case',
        ['==', ['get', 'id'], selectedListingId || ''],
        'hsl(var(--primary))',
        ['==', ['get', 'id'], hoveredListingId || ''],
        'hsl(var(--primary))',
        'hsl(var(--primary))'
      ]);
      
      map.current.setPaintProperty('unclustered-point', 'circle-radius', [
        'case',
        ['==', ['get', 'id'], selectedListingId || ''],
        12,
        ['==', ['get', 'id'], hoveredListingId || ''],
        10,
        8
      ]);
    }
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
      
      {/* Update results button */}
      {mapState.hasUserMoved && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={handleUpdateResults}
            className="shadow-lg"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Ενημέρωση αποτελεσμάτων
          </Button>
        </div>
      )}
    </div>
  );
};