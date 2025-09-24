import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building2 } from "lucide-react";

interface IndividualAgencyModalProps {
  isOpen: boolean;
  onChoice: (choice: 'individual' | 'agency') => void;
}

export const IndividualAgencyModal = ({ isOpen, onChoice }: IndividualAgencyModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Τι είδους λογαριασμός;
            </h2>
            <p className="text-muted-foreground">
              Επέλεξε τον τύπο του λογαριασμού σου
            </p>
          </div>

          <div className="grid gap-4">
            <Card 
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onChoice('individual')}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">
                    Ιδιώτης
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Δημοσίευσε τη δική σου αγγελία
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onChoice('agency')}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">
                    Μεσιτικό γραφείο
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Επαγγελματικές υπηρεσίες
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};