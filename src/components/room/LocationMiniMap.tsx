import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

interface LocationMiniMapProps {
  geo: {
    lat: number;
    lng: number;
  } | null;
  neighborhood: string;
  city: string;
}

export const LocationMiniMap = ({ geo, neighborhood, city }: LocationMiniMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Import MapLibre dynamically
        const maplibregl = (await import('maplibre-gl')).default;
        
        // Default coordinates for Athens if no geo data
        const defaultCoords = { lat: 37.9838, lng: 23.7275 };
        const coords = geo || defaultCoords;

        mapInstanceRef.current = new maplibregl.Map({
          container: mapRef.current,
          style: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
          center: [coords.lng, coords.lat],
          zoom: 15,
          interactive: false
        });

        // Add marker
        new maplibregl.Marker({
          color: '#1E90FF'
        })
          .setLngLat([coords.lng, coords.lat])
          .addTo(mapInstanceRef.current);

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
  }, [geo]);

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
          <div className="text-sm">
            <p className="font-medium">{neighborhood}</p>
            <p className="text-muted-foreground">{city}</p>
          </div>
          
          <div 
            ref={mapRef}
            className="w-full h-48 rounded-lg bg-muted overflow-hidden"
          >
            {!geo && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm">Map loading...</p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Exact location shown after booking confirmation
          </p>
        </div>
      </CardContent>
    </Card>
  );
};