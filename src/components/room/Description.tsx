import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface DescriptionProps {
  title: string;
  description: string;
}

export const Description = ({ title, description }: DescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const text = description || "Δεν έχει καθοριστεί";
  const shouldTruncate = text.length > 300;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 300) + '...' : text;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Περιγραφή</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {displayText}
          </p>
          {shouldTruncate && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-primary hover:text-primary/80"
            >
              {isExpanded ? 'Λιγότερα' : 'Περισσότερα'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};