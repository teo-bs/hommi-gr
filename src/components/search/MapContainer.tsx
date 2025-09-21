import { useEffect, useRef } from "react";

export const MapContainer = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // MapLibre GL + OpenStreetMap integration will be implemented here
    console.log('map_initialized', { timestamp: Date.now() });
  }, []);

  const handleMapMove = () => {
    console.log('map_move', { timestamp: Date.now() });
  };

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full bg-muted rounded-lg flex items-center justify-center"
      onMouseMove={handleMapMove}
    >
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-medium">Χάρτης Καταχωρήσεων</p>
        <p className="text-sm">MapLibre GL integration coming soon</p>
      </div>
    </div>
  );
};