import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2 } from "lucide-react";

interface PublishStepZeroProps {
  onRoleSelected: (role: 'individual' | 'agency') => void;
}

export default function PublishStepZero({ onRoleSelected }: PublishStepZeroProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Ποιος περιγράφει καλύτερα εσάς;</h2>
        <p className="text-muted-foreground">
          Επιλέξτε τον τύπο λογαριασμού που ταιριάζει στις ανάγκες σας
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Είμαι ιδιώτης</CardTitle>
            <CardDescription>
              Ενοικιάζω το δικό μου δωμάτιο ή διαμέρισμα
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>• Γρήγορη και εύκολη διαδικασία</li>
              <li>• Επαληθευμένη ταυτότητα</li>
              <li>• Άμεση επικοινωνία με ενδιαφερόμενους</li>
              <li>• Δωρεάν δημοσίευση</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => onRoleSelected('individual')}
            >
              Συνέχεια ως ιδιώτης
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Είμαι πρακτορείο</CardTitle>
            <CardDescription>
              Διαχειρίζομαι πολλαπλά ακίνητα για λογαριασμό πελατών
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>• Διαχείριση πολλαπλών αγγελιών</li>
              <li>• Εργαλεία για επαγγελματίες</li>
              <li>• Προηγμένες επιλογές προώθησης</li>
              <li>• Αναλυτικά στοιχεία</li>
            </ul>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onRoleSelected('agency')}
            >
              Μάθετε περισσότερα
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}