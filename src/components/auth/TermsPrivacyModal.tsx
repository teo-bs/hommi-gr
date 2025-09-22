import { useState } from "react";
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

  const handleContinue = () => {
    if (canContinue) {
      onAccept(marketingEmails);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Όροι & Απόρρητο
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-60 pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Για να συνεχίσετε, πρέπει να αποδεχτείτε τους όρους χρήσης και την πολιτική απορρήτου μας.
            </p>
            <p>
              Το Hommi διευκολύνει την εύρεση συγκατοίκων με ασφάλεια και εμπιστοσύνη. 
              Οι όροι μας διασφαλίζουν μια θετική εμπειρία για όλους.
            </p>
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
              Αποδέχομαι τους{" "}
              <a href="/terms" target="_blank" className="text-primary hover:underline">
                Όρους Χρήσης
              </a>{" "}
              του Hommi
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
              Αποδέχομαι την{" "}
              <a href="/privacy" target="_blank" className="text-primary hover:underline">
                Πολιτική Απορρήτου
              </a>{" "}
              του Hommi
            </Label>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={marketingEmails}
              onCheckedChange={(checked) => setMarketingEmails(checked as boolean)}
            />
            <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer text-muted-foreground">
              Θα θέλω να λαμβάνω emails με προτάσεις και νέα (προαιρετικό)
            </Label>
          </div>
        </div>

        <Button 
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full"
          variant="hero"
        >
          Συνέχεια
        </Button>
      </DialogContent>
    </Dialog>
  );
};