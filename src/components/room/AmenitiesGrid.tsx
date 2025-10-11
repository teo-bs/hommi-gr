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
  Home,
  Bath,
  Coffee,
  Wind,
  WashingMachine,
  Refrigerator,
  ChefHat,
  Sofa,
  TreePine,
  Shield,
  Camera,
  Dumbbell,
  Waves
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
  // Connectivity & Tech
  wifi: Wifi,
  internet: Wifi,
  
  // Climate & Comfort
  air_conditioning: Snowflake,
  heating: Flame,
  balcony: Sun,
  garden: TreePine,
  
  // Transportation & Access
  elevator: ArrowUpCircle,
  parking: Car,
  
  // Entertainment
  tv: Tv,
  television: Tv,
  
  // Kitchen & Dining
  kitchen: ChefHat,
  utensils: UtensilsCrossed,
  refrigerator: Refrigerator,
  coffee_machine: Coffee,
  
  // Bedroom & Sleep
  bed: Bed,
  bedroom: Bed,
  
  // Work & Study
  desk: Laptop,
  workspace: Laptop,
  
  // Security & Safety
  lock: Lock,
  security: Shield,
  cctv: Camera,
  
  // Bathroom & Hygiene  
  bathroom: Bath,
  shower: Bath,
  
  // Laundry & Cleaning
  washing_machine: WashingMachine,
  washer: WashingMachine,
  
  // Living Areas
  living_room: Sofa,
  lounge: Sofa,
  
  // Outdoor & Recreation
  window: Home,
  terrace: Sun,
  gym: Dumbbell,
  fitness: Dumbbell,
  pool: Waves,
  swimming_pool: Waves,
  
  // Ventilation
  ventilation: Wind,
  fan: Wind,
  
  // Fallbacks
  cabinet: Home,
  storage: Home,
  default: Home
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
            <p className="text-sm text-muted-foreground">
              No property amenities listed
            </p>
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
            <p className="text-sm text-muted-foreground">
              No room amenities listed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};