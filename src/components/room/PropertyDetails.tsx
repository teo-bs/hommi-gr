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
    bathrooms?: number;
    bedrooms_single?: number;
    bedrooms_double?: number;
    property_size_m2?: number;
  };
}

export const PropertyDetails = ({ room, listing }: PropertyDetailsProps) => {
  const availabilityDate = listing.availability_date 
    ? format(new Date(listing.availability_date), 'MMM dd, yyyy')
    : 'Available now';

  const totalBedrooms = (listing.bedrooms_single || 0) + (listing.bedrooms_double || 0);
  const bathroomCount = listing.bathrooms || 1;

  const details = [
    {
      icon: Home,
      label: 'Bathrooms',
      value: `${bathroomCount} bathroom${bathroomCount !== 1 ? 's' : ''}`
    },
    {
      icon: Home,
      label: 'Bedrooms',
      value: totalBedrooms > 0 ? `${totalBedrooms} bedroom${totalBedrooms !== 1 ? 's' : ''}` : 'Not specified'
    },
    {
      icon: Maximize2,
      label: 'Room Size',
      value: room.room_size_m2 ? `${room.room_size_m2}m²` : 'Not specified'
    },
    {
      icon: Maximize2,
      label: 'Property Size',
      value: listing.property_size_m2 ? `${listing.property_size_m2}m²` : 'Not specified'
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