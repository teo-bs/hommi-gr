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
    ? format(new Date(listing.availability_date), 'dd/MM/yyyy')
    : 'Δεν έχει καθοριστεί';

  const totalBedrooms = (listing.bedrooms_single || 0) + (listing.bedrooms_double || 0);
  const bathroomCount = listing.bathrooms;

  const details = [
    {
      icon: Home,
      label: 'Μπάνια',
      value: bathroomCount ? `${bathroomCount}` : 'Δεν έχει καθοριστεί'
    },
    {
      icon: Home,
      label: 'Υπνοδωμάτια',
      value: totalBedrooms > 0 ? `${totalBedrooms}` : 'Δεν έχει καθοριστεί'
    },
    {
      icon: Maximize2,
      label: 'Μέγεθος δωματίου',
      value: room.room_size_m2 ? `${room.room_size_m2}m²` : 'Δεν έχει καθοριστεί'
    },
    {
      icon: Maximize2,
      label: 'Μέγεθος ακινήτου',
      value: listing.property_size_m2 ? `${listing.property_size_m2}m²` : 'Δεν έχει καθοριστεί'
    },
    {
      icon: Calendar,
      label: 'Διαθεσιμότητα',
      value: availabilityDate
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Λεπτομέρειες ακινήτου</CardTitle>
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