import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Phone, Mail, CreditCard, Info } from "lucide-react";

interface ListingDraft {
  required_verifications: string[];
  [key: string]: any;
}

interface PublishStepVerificationsProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const VERIFICATIONS = [
  {
    key: 'phone',
    icon: Phone,
    title: 'Επαλήθευση Τηλεφώνου',
    description: 'Ο ενοικιαστής πρέπει να έχει επαληθεύσει το τηλέφωνό του'
  },
  {
    key: 'email',
    icon: Mail,
    title: 'Επαλήθευση Email',
    description: 'Ο ενοικιαστής πρέπει να έχει επαληθεύσει το email του'
  },
  {
    key: 'id',
    icon: CreditCard,
    title: 'Επαλήθευση Ταυτότητας (Gov.gr)',
    description: 'Ο ενοικιαστής πρέπει να έχει επαληθεύσει την ταυτότητά του με Gov.gr'
  }
];

export default function PublishStepVerifications({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev
}: PublishStepVerificationsProps) {
  
  const toggleVerification = (key: string) => {
    const current = draft.required_verifications || [];
    const updated = current.includes(key)
      ? current.filter(v => v !== key)
      : [...current, key];
    onUpdate({ required_verifications: updated });
  };

  const hasAnyVerification = (draft.required_verifications || []).length > 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Επαληθεύσεις</h2>
        <p className="text-muted-foreground">
          Επιλέξτε τι επαληθεύσεις χρειάζεται να έχει ο χρήστης για να δηλώσει ενδιαφέρον
        </p>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Γιατί είναι σημαντικές οι επαληθεύσεις;</p>
              <p className="text-sm text-muted-foreground">
                Οι επαληθεύσεις βοηθούν να δημιουργήσετε ένα ασφαλέστερο περιβάλλον 
                και να εξασφαλίσετε ότι οι ενδιαφερόμενοι είναι πραγματικά άτομα.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {VERIFICATIONS.map((verification) => {
          const Icon = verification.icon;
          const isSelected = (draft.required_verifications || []).includes(verification.key);

          return (
            <Card 
              key={verification.key}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => toggleVerification(verification.key)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id={verification.key}
                    checked={isSelected}
                    onCheckedChange={() => toggleVerification(verification.key)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Label 
                          htmlFor={verification.key} 
                          className="text-base font-semibold cursor-pointer"
                        >
                          {verification.title}
                        </Label>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground ml-[52px]">
                      {verification.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                <strong>Σημείωση:</strong> Μπορείτε να μην επιλέξετε καμία επαλήθευση, 
                αλλά θα λάβετε περισσότερα αιτήματα από επαληθευμένους χρήστες αν ορίσετε 
                τουλάχιστον μία επαλήθευση.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button onClick={onNext}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}
