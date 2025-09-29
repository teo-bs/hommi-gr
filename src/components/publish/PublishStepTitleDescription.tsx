import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface ListingDraft {
  title: string;
  description?: string;
  [key: string]: any;
}

interface PublishStepTitleDescriptionProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PublishStepTitleDescription({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev
}: PublishStepTitleDescriptionProps) {

  const isValid = draft.title && draft.title.length >= 10 && 
    draft.description && draft.description.length >= 90;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-2">Τώρα, δώστε στον χώρο σας έναν τίτλο</h2>
        <p className="text-muted-foreground">
          Και περιγράψτε τον με λεπτομέρεια
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Τίτλος αγγελίας
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Τίτλος (ελάχιστα 10 χαρακτήρες) *</Label>
            <Input
              id="title"
              placeholder="π.χ. Φωτεινό δωμάτιο στο κέντρο της Αθήνας με θέα"
              value={draft.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground">
              {draft.title?.length || 0}/80 χαρακτήρες (ελάχιστα 10)
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Συμβουλή:</strong> Ένας καλός τίτλος είναι σύντομος αλλά περιγραφικός. 
              Αναφέρετε τα κύρια πλεονεκτήματα όπως τοποθεσία, φωτισμό ή ανέσεις.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Περιγραφή</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              Περιγραφή (ελάχιστα 90 χαρακτήρες) *
            </Label>
            <Textarea
              id="description"
              placeholder="Περιγράψτε το χώρο σας, τη γειτονιά, τις ανέσεις και τι κάνει τη διαμονή ιδιαίτερη...&#10;&#10;Αναφέρετε:&#10;- Τα κύρια πλεονεκτήματα του χώρου&#10;- Τη γειτονιά και τις συγκοινωνίες&#10;- Τον τρόπο ζωής των συγκατοίκων&#10;- Τυχόν ειδικούς όρους"
              value={draft.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={12}
            />
            <p className="text-xs text-muted-foreground">
              {draft.description?.length || 0} χαρακτήρες (ελάχιστα 90)
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Συμβουλές για καλή περιγραφή:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Αναφέρετε τα κύρια πλεονεκτήματα πρώτα</li>
              <li>✓ Περιγράψτε τη γειτονιά και τις συγκοινωνίες</li>
              <li>✓ Μιλήστε για τον τρόπο ζωής στο σπίτι</li>
              <li>✓ Αναφέρετε τυχόν ειδικούς όρους</li>
              <li>✓ Γράψτε με φιλικό και προσιτό τρόπο</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {!isValid && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive mb-2">
              Συμπληρώστε τα παρακάτω για να συνεχίσετε:
            </p>
            <ul className="text-sm text-destructive space-y-1">
              {(!draft.title || draft.title.length < 10) && (
                <li>• Τίτλος τουλάχιστον 10 χαρακτήρες</li>
              )}
              {(!draft.description || draft.description.length < 90) && (
                <li>• Περιγραφή τουλάχιστον 90 χαρακτήρες</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}
