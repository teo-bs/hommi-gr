import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight } from "lucide-react";

interface ProfileCompletionBannerProps {
  completionPercent: number;
  onComplete: () => void;
  missingFields?: string[];
}

export const ProfileCompletionBanner = ({ completionPercent, onComplete, missingFields }: ProfileCompletionBannerProps) => {
  // Don't show banner if profile is already highly complete
  if (completionPercent >= 80) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Πρόσθεσε τις τελευταίες πινελιές στο προφίλ σου…
              </h3>
              {missingFields && missingFields.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  Λείπουν: {missingFields.join(', ')}
                </p>
              )}
              <div className="flex items-center space-x-3">
                <Progress value={completionPercent} className="flex-1 max-w-[200px]" />
                <span className="text-sm text-muted-foreground">
                  {completionPercent}% ολοκληρωμένο
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onComplete}
            size="sm"
            className="ml-4"
          >
            Ολοκλήρωσε το προφίλ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};