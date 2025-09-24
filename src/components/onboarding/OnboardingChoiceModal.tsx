import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

interface OnboardingChoiceModalProps {
  isOpen: boolean;
  onChoice: (role: 'tenant' | 'lister') => void;
}

export const OnboardingChoiceModal = ({ isOpen, onChoice }: OnboardingChoiceModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Τι θα θέλες να κάνεις;
            </h2>
            <p className="text-muted-foreground">
              Επέλεξε τον ρόλο σου για να προχωρήσουμε
            </p>
          </div>

          <div className="grid gap-4">
            <Card 
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onChoice('tenant')}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">
                    Ψάχνω για χώρο
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Βρες το ιδανικό σπίτι ή δωμάτιο
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
              onClick={() => onChoice('lister')}
            >
              <CardContent className="flex items-center space-x-4 p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">
                    Δημοσίευσε αγγελία
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Βρες τον ιδανικό συγκάτοικο
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