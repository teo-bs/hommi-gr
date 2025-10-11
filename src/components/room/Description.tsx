import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface DescriptionProps {
  title: string;
  description: string;
}

export const Description = ({ title, description }: DescriptionProps) => {
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = () => {
    // No-op handler as requested
    setIsTranslated(!isTranslated);
    console.log('translate_clicked', { isTranslated: !isTranslated });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Description</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTranslate}
          >
            <Languages className="h-4 w-4 mr-2" />
            {isTranslated ? 'Show Greek' : 'Translate to English'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {isTranslated 
              ? "Η λειτουργία μετάφρασης έρχεται σύντομα..."
              : (description || "Δεν έχει καθοριστεί")
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};