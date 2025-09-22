import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onAccept: (marketingEmails: boolean) => void;
}

export const TermsPrivacyModal = ({ isOpen, onAccept }: TermsPrivacyModalProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const canContinue = acceptedTerms && acceptedPrivacy;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); // Prevent ESC from closing
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (canContinue) {
      onAccept(marketingEmails);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="fixed inset-0 z-50 max-w-none w-screen h-screen p-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 [&>button]:hidden">
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
          <div className="w-full max-w-md mx-auto bg-card rounded-xl border border-border p-6 sm:p-8 shadow-elevated animate-in fade-in-0 zoom-in-95 duration-200">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-center text-xl sm:text-2xl font-semibold text-foreground">
                Όροι & Απόρρητο
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-48 sm:max-h-60 pr-4 mb-6">
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Για να συνεχίσετε, πρέπει να αποδεχτείτε τους όρους χρήσης και την πολιτική απορρήτου μας.
                </p>
                <p>
                  Το Hommi διευκολύνει την εύρεση συγκατοίκων με ασφάλεια και εμπιστοσύνη. 
                  Οι όροι μας διασφαλίζουν μια θετική εμπειρία για όλους.
                </p>
              </div>
            </ScrollArea>

            <div className="space-y-5 mb-8">
              <div className="flex items-start space-x-3 p-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-foreground">
                  Αποδέχομαι τους{" "}
                  <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">
                    Όρους & Προϋποθέσεις Χρήσης
                  </a>{" "}
                  του Hommi
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-1">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer text-foreground">
                  Αποδέχομαι την{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                    Πολιτική Απορρήτου
                  </a>{" "}
                  του Hommi
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-1 pt-2 border-t border-border">
                <Checkbox
                  id="marketing"
                  checked={marketingEmails}
                  onCheckedChange={(checked) => setMarketingEmails(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
                  Θα θέλω να λαμβάνω emails με προτάσεις και νέα (προαιρετικό)
                </Label>
              </div>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full h-12 text-base font-semibold"
              variant="hero"
            >
              Συνέχεια
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Μπορείτε να αλλάξετε αυτές τις επιλογές αργότερα στις Ρυθμίσεις.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};