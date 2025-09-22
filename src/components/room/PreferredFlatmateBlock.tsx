import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users } from "lucide-react";

interface PreferredFlatmateBlockProps {
  listing: {
    couples_accepted?: boolean;
    smoking_allowed?: boolean;
    pets_allowed?: boolean;
  };
}

export const PreferredFlatmateBlock = ({ listing }: PreferredFlatmateBlockProps) => {
  const preferences = [
    {
      label: 'Age range',
      value: '22-35 years',
      type: 'info'
    },
    {
      label: 'Gender',
      value: 'Any gender welcome',
      type: 'success'
    },
    {
      label: 'Couples',
      value: listing.couples_accepted ? 'Couples welcome' : 'Singles only',
      type: listing.couples_accepted ? 'success' : 'secondary'
    },
    {
      label: 'Smoking',
      value: listing.smoking_allowed ? 'Smoking allowed' : 'No smoking',
      type: listing.smoking_allowed ? 'warning' : 'success'
    },
    {
      label: 'Pets',
      value: listing.pets_allowed ? 'Pets allowed' : 'No pets',
      type: listing.pets_allowed ? 'success' : 'secondary'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          Preferred flatmate
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {preferences.map((pref, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{pref.label}</span>
              <Badge 
                variant={pref.type as any}
                className="text-xs"
              >
                {pref.value}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};