import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";

interface FlatmatesBlockProps {
  flatmatesCount: number;
}

export const FlatmatesBlock = ({ flatmatesCount }: FlatmatesBlockProps) => {
  const displayCount = flatmatesCount ?? 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Συγκάτοικοι
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="font-medium">
              {displayCount === 0 ? 'Δεν έχει καθοριστεί' : `${displayCount} συγκάτοικο${displayCount !== 1 ? 'ι' : 'ς'}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};