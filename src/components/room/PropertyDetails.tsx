import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Home, Maximize2 } from "lucide-react";
import { format } from "date-fns";

interface PropertyDetailsProps {
  room: {
    room_size_m2?: number;
  };
  listing: {
    availability_date?: string;
    flatmates_count: number;
  };
}

export const PropertyDetails = ({ room, listing }: PropertyDetailsProps) => {
  const availabilityDate = listing.availability_date 
    ? format(new Date(listing.availability_date), 'MMM dd, yyyy')
    : 'Available now';

  const details = [
    {
      icon: Home,
      label: 'Bathrooms',
      value: '2 bathrooms'
    },
    {
      icon: Home,
      label: 'Bedrooms',
      value: `${listing.flatmates_count + 1} bedrooms`
    },
    {
      icon: Maximize2,
      label: 'Size',
      value: room.room_size_m2 ? `${room.room_size_m2}m²` : '80m²'
    },
    {
      icon: Calendar,
      label: 'Availability',
      value: availabilityDate
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property details</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.map((detail, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-muted">
                <detail.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{detail.label}</p>
                <p className="font-medium">{detail.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};