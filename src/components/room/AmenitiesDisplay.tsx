import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi, 
  Snowflake, 
  Flame, 
  ArrowUpCircle, 
  Sun, 
  WashingMachine, 
  Utensils, 
  Tv,
  Bed,
  Monitor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AmenitiesDisplayProps {
  listingId: string;
}

const iconMap: Record<string, any> = {
  'wifi': Wifi,
  'snowflake': Snowflake, 
  'flame': Flame,
  'arrow-up-circle': ArrowUpCircle,
  'sun': Sun,
  'washing-machine': WashingMachine,
  'utensils': Utensils,
  'tv': Tv,
  'bed': Bed,
  'desk': Monitor
};

export const AmenitiesDisplay = ({ listingId }: AmenitiesDisplayProps) => {
  const [roomAmenities, setRoomAmenities] = useState<any[]>([]);
  const [propertyAmenities, setPropertyAmenities] = useState<any[]>([]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        // Fetch room amenities via proper join
        const { data: roomData } = await supabase
          .from('room_amenities')
          .select(`
            amenities (name_en, name_el, icon, key),
            room_id,
            rooms!inner (listing_id)
          `)
          .eq('rooms.listing_id', listingId);

        if (roomData) {
          const amenities = roomData
            .map((ra: any) => ra.amenities)
            .filter(Boolean)
            .map((amenity: any) => ({
              name: amenity.name_en || amenity.name_el || 'Unknown',
              icon: amenity.key || amenity.icon || 'home'
            }));
          setRoomAmenities(amenities);
        }

        // Fetch property amenities from listing_amenities junction table
        const { data: listingAmenitiesData } = await supabase
          .from('listing_amenities')
          .select(`
            amenities (name_en, name_el, icon, key)
          `)
          .eq('listing_id', listingId);

        if (listingAmenitiesData) {
          const propertyData = listingAmenitiesData
            .map((la: any) => la.amenities)
            .filter(Boolean)
            .map((amenity: any) => ({
              name: amenity.name_en || amenity.name_el || 'Unknown',
              icon: amenity.key || amenity.icon || 'home'
            }));
          setPropertyAmenities(propertyData);
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
      }
    };

    fetchAmenities();
  }, [listingId]);

  const renderAmenityGrid = (amenities: any[], title: string) => {
    if (amenities.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity, index) => {
              const IconComponent = iconMap[amenity.icon] || Wifi;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{amenity.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderAmenityGrid(propertyAmenities, "Property Amenities")}
      {renderAmenityGrid(roomAmenities, "Room Amenities")}
    </div>
  );
};