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
          <p className="text-foreground leading-relaxed">
            {isTranslated 
              ? "Beautiful room in the heart of the city. Perfect for young professionals or students. The room is fully furnished and includes all necessary amenities. The apartment is located in a quiet neighborhood with excellent transport connections."
              : description || "Όμορφο δωμάτιο στην καρδιά της πόλης. Ιδανικό για νέους επαγγελματίες ή φοιτητές. Το δωμάτιο είναι πλήρως επιπλωμένο και περιλαμβάνει όλες τις απαραίτητες ανέσεις. Το διαμέρισμα βρίσκεται σε μια ήσυχη γειτονιά με εξαιρετικές συγκοινωνιακές συνδέσεις."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};