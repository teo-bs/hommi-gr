import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface LocationMiniMapProps {
  geo: {
    lat: number;
    lng: number;
  } | null;
  neighborhood: string;
  city: string;
  formatted_address?: string;
  street_address?: string;
  is_location_approx?: boolean;
}

export const LocationMiniMap = ({ 
  geo, 
  neighborhood, 
  city,
  formatted_address,
  street_address,
  is_location_approx = true
}: LocationMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  // Lazy load map using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadMap = async () => {
      if (!shouldLoadMap || !mapRef.current || mapInstanceRef.current) return;

      try {
        // Import Mapbox GL dynamically
        const mapboxgl = (await import('mapbox-gl')).default;
        
        // Default coordinates for Athens if no geo data
        const defaultCoords = { lat: 37.9838, lng: 23.7275 };
        const coords = geo || defaultCoords;

        const MAPBOX_TOKEN = 'pk.eyJ1IjoibXBvdWZpc3RoIiwiYSI6ImNtZzNsaW02NjE3OHQycXF3aGp2ZmcyaDkifQ.3uU3F5ayX9teACIm7C9fxQ';
        mapboxgl.accessToken = MAPBOX_TOKEN;

        mapInstanceRef.current = new mapboxgl.Map({
          container: mapRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [coords.lng, coords.lat],
          zoom: 15,
          interactive: false,
          attributionControl: false
        });

        mapInstanceRef.current.on('load', () => {
          // Add 500m radius circle
          const centerPoint: [number, number] = [coords.lng, coords.lat];
          
          // Create a circle using turf (approximate with polygon)
          const radiusInKm = 0.5; // 500 meters
          const points = 64;
          const coords500m = [];
          
          for (let i = 0; i < points; i++) {
            const angle = (i * 360) / points;
            const lat = coords.lat + (radiusInKm / 111) * Math.cos((angle * Math.PI) / 180);
            const lng = coords.lng + (radiusInKm / (111 * Math.cos((coords.lat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);
            coords500m.push([lng, lat]);
          }
          coords500m.push(coords500m[0]); // Close the polygon

          mapInstanceRef.current.addSource('radius', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [coords500m]
              }
            }
          });

          mapInstanceRef.current.addLayer({
            id: 'radius-fill',
            type: 'fill',
            source: 'radius',
            paint: {
              'fill-color': '#3b82f6',
              'fill-opacity': 0.1
            }
          });

          mapInstanceRef.current.addLayer({
            id: 'radius-outline',
            type: 'line',
            source: 'radius',
            paint: {
              'line-color': '#3b82f6',
              'line-width': 2,
              'line-opacity': 0.5
            }
          });

          // Add center marker
          new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat(centerPoint)
            .addTo(mapInstanceRef.current);
        });

      } catch (error) {
        console.error('Failed to load map:', error);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shouldLoadMap, geo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Location
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm space-y-1">
            <p className="font-medium">
              {formatted_address || street_address || `${neighborhood || city}, Greece`}
            </p>
            {is_location_approx && (
              <Badge variant="outline" className="text-xs">
                📍 Προσεγγιστική τοποθεσία (ακτίνα 500μ)
              </Badge>
            )}
          </div>
          
          <div 
            ref={mapRef}
            className="w-full h-48 rounded-lg bg-muted overflow-hidden"
          >
            {!shouldLoadMap && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm">Φόρτωση χάρτη...</p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {is_location_approx 
              ? 'Η ακριβής διεύθυνση θα εμφανιστεί μετά την επιβεβαίωση κράτησης'
              : 'Τοποθεσία ακινήτου'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};