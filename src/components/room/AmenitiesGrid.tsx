import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wifi, 
  Snowflake, 
  Flame, 
  ArrowUpCircle, 
  Sun, 
  Car,
  Tv,
  UtensilsCrossed,
  Bed,
  Laptop,
  Lock,
  Home
} from "lucide-react";

interface AmenitiesGridProps {
  propertyAmenities: Array<{
    name: string;
    icon: string;
  }>;
  roomAmenities: Array<{
    name: string;
    icon: string;
  }>;
}

const iconMap: Record<string, any> = {
  wifi: Wifi,
  snowflake: Snowflake,
  flame: Flame,
  'arrow-up-circle': ArrowUpCircle,
  sun: Sun,
  car: Car,
  tv: Tv,
  utensils: UtensilsCrossed,
  bed: Bed,
  desk: Laptop,
  lock: Lock,
  window: Home,
  'washing-machine': Home,
  cabinet: Home
};

export const AmenitiesGrid = ({ propertyAmenities, roomAmenities }: AmenitiesGridProps) => {
  const renderAmenityGrid = (amenities: typeof propertyAmenities) => (
    <div className="grid grid-cols-2 gap-4">
      {amenities.map((amenity, index) => {
        const IconComponent = iconMap[amenity.icon] || Home;
        return (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
            <IconComponent className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{amenity.name}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Property Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Property amenities</CardTitle>
        </CardHeader>
        <CardContent>
          {propertyAmenities.length > 0 ? (
            renderAmenityGrid(propertyAmenities)
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Mock data */}
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Wifi className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">WiFi</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Snowflake className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Κλιματισμός</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <ArrowUpCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Ασανσέρ</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Sun className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Μπαλκόνι</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Room amenities</CardTitle>
        </CardHeader>
        <CardContent>
          {roomAmenities.length > 0 ? (
            renderAmenityGrid(roomAmenities)
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Mock data */}
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Bed className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Κρεβάτι</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Laptop className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Γραφείο</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Κλειδαριά</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Παράθυρο</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};