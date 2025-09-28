import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationData {
  city: string;
  region: string;
  postcode: string;
  country: string;
  street: string;
  street_number: string;
  lat: number;
  lng: number;
  formatted_address: string;
}

interface PublishMapProps {
  location?: { lat: number; lng: number };
  onLocationChange: (location: LocationData) => void;
  className?: string;
}

export const PublishMap = ({ 
  location, 
  onLocationChange, 
  className = "h-64 w-full rounded-lg" 
}: PublishMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('VITE_MAPBOX_TOKEN is not configured');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // Default center on Athens, Greece
    const defaultCenter: [number, number] = [23.7275, 37.9838];
    const center: [number, number] = location ? [location.lng, location.lat] : defaultCenter;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: location ? 15 : 10,
      language: 'el'
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Create draggable marker
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: 'hsl(var(--primary))'
    })
      .setLngLat(center)
      .addTo(map.current);

    // Handle marker drag end
    marker.current.on('dragend', () => {
      if (!marker.current) return;
      
      const lngLat = marker.current.getLngLat();
      reverseGeocode(lngLat.lng, lngLat.lat);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update marker position when location prop changes
  useEffect(() => {
    if (location && marker.current && map.current) {
      const newCenter: [number, number] = [location.lng, location.lat];
      marker.current.setLngLat(newCenter);
      map.current.flyTo({
        center: newCenter,
        zoom: 15,
        duration: 1000
      });
    }
  }, [location]);

  const reverseGeocode = async (lng: number, lat: number) => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) return;

    setIsReverseGeocoding(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
        new URLSearchParams({
          access_token: mapboxToken,
          country: 'GR',
          language: 'el',
          types: 'place,locality,neighborhood,address,poi'
        })
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const feature = data.features?.[0];

      if (feature) {
        const context = feature.context || [];
        
        let city = '';
        let region = '';
        let postcode = '';
        let country = '';
        let street = '';
        let street_number = '';

        // Parse from context
        context.forEach((item: any) => {
          if (item.id.includes('place')) {
            city = item.text;
          } else if (item.id.includes('region')) {
            region = item.text;
          } else if (item.id.includes('postcode')) {
            postcode = item.text;
          } else if (item.id.includes('country')) {
            country = item.text;
          }
        });

        // Extract street info if available
        if (feature.properties?.address) {
          const addressParts = feature.properties.address.split(' ');
          if (addressParts.length > 0) {
            street_number = addressParts[0];
            street = addressParts.slice(1).join(' ');
          }
        }

        const locationData: LocationData = {
          city: city || '',
          region: region || '',
          postcode: postcode || '',
          country: country || 'Greece',
          street: street || '',
          street_number: street_number || '',
          lat,
          lng,
          formatted_address: feature.place_name || `${lat}, ${lng}`
        };

        onLocationChange(locationData);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  return (
    <div className="relative">
      <div ref={mapContainer} className={className} />
      {isReverseGeocoding && (
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm border border-border rounded px-2 py-1 text-xs text-muted-foreground">
          Updating location...
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm border border-border rounded px-2 py-1 text-xs text-muted-foreground">
        Drag the marker to adjust location
      </div>
    </div>
  );
};