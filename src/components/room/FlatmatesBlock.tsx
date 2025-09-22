import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User } from "lucide-react";

interface FlatmatesBlockProps {
  flatmatesCount: number;
}

export const FlatmatesBlock = ({ flatmatesCount }: FlatmatesBlockProps) => {
  // Mock flatmate data
  const mockFlatmates = [
    { gender: 'female', age: 25 },
    { gender: 'male', age: 28 }
  ].slice(0, flatmatesCount);

  const genderCounts = mockFlatmates.reduce((acc, flatmate) => {
    acc[flatmate.gender] = (acc[flatmate.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Flatmates ({flatmatesCount})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {Object.entries(genderCounts).map(([gender, count]) => (
            <div key={gender} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium capitalize">
                  {count} {gender}{count > 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {gender === 'female' ? '♀' : '♂'} {count}
              </span>
            </div>
          ))}
          
          {flatmatesCount === 0 && (
            <p className="text-sm text-muted-foreground">
              No current flatmates - you'll be the first!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};