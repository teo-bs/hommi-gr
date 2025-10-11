import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Maximize2, ArrowUp, Bed, Building } from "lucide-react";

interface QuickFactsProps {
  room: {
    room_type: string;
    room_size_m2?: number;
    is_interior: boolean;
    has_bed: boolean;
  };
  listing: {
    amenities_property?: any[];
    floor?: number | null;
  };
}

export const QuickFacts = ({ room, listing }: QuickFactsProps) => {
  const hasLift = listing.amenities_property?.some(amenity => 
    amenity.name?.toLowerCase().includes('ασανσέρ') || 
    amenity.name?.toLowerCase().includes('lift')
  );

  const getFloorLabel = (floor: number | null | undefined) => {
    if (floor === null || floor === undefined) return null;
    if (floor === -1) return 'Υπόγειο';
    if (floor === 0) return 'Ισόγειο';
    if (floor === 0.5) return 'Ημιώροφος';
    return `${floor}ος Όροφος`;
  };

  const floorLabel = getFloorLabel(listing.floor);

  const facts = [
    {
      icon: Home,
      label: room.room_type === 'private' ? 'Private room' : 'Shared room',
      variant: 'default'
    },
    ...(room.room_size_m2 ? [{
      icon: Maximize2,
      label: `${room.room_size_m2}m²`,
      variant: 'secondary' as const
    }] : []),
    {
      icon: room.is_interior ? Home : Home,
      label: room.is_interior ? 'Interior' : 'Exterior',
      variant: room.is_interior ? 'secondary' : 'default'
    },
    ...(floorLabel ? [{
      icon: Building,
      label: floorLabel,
      variant: 'secondary' as const
    }] : []),
    {
      icon: ArrowUp,
      label: hasLift ? 'Lift' : 'No lift',
      variant: hasLift ? 'default' : 'outline'
    },
    {
      icon: Bed,
      label: room.has_bed ? 'Bed included' : 'No bed',
      variant: room.has_bed ? 'default' : 'outline'
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Quick facts</h3>
        <div className="flex flex-wrap gap-2">
          {facts.map((fact, index) => (
            <Badge key={index} variant={fact.variant as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
              <fact.icon className="h-3 w-3 mr-1" />
              {fact.label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};