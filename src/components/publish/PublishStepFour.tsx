import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Camera } from "lucide-react";

interface ListingDraft {
  photos: string[];
  title: string;
  description?: string;
  [key: string]: any;
}

interface PublishStepFourProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLastStep?: boolean;
}

export default function PublishStepFour({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev,
  isLastStep = false
}: PublishStepFourProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (files: FileList) => {
    const newPhotos: string[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            newPhotos.push(result);
            if (newPhotos.length === files.length) {
              onUpdate({ photos: [...(draft.photos || []), ...newPhotos] });
            }
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = (draft.photos || []).filter((_, i) => i !== index);
    onUpdate({ photos: updatedPhotos });
  };

  const isValid = draft.photos && draft.photos.length > 0 && 
    draft.title && draft.title.length >= 10 && 
    draft.description && draft.description.length >= 90;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Φωτογραφίες και περιγραφή</h2>
        <p className="text-muted-foreground">
          Προσθέστε φωτογραφίες και περιγράψτε το χώρο σας
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Φωτογραφίες
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Κάντε κλικ για να επιλέξετε φωτογραφίες
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG μέχρι 10MB ανά φωτογραφία
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
              />
            </div>

            {/* Photo Grid */}
            {draft.photos && draft.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {draft.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Φωτογραφία ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Κύρια
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Η πρώτη φωτογραφία θα είναι η κύρια φωτογραφία της αγγελίας
            </p>
          </CardContent>
        </Card>

        {/* Right Column - Text Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Τίτλος αγγελίας</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Τίτλος (ελάχιστα 10 χαρακτήρες) *</Label>
                <Input
                  id="title"
                  placeholder="π.χ. Φωτεινό δωμάτιο στο κέντρο της Αθήνας"
                  value={draft.title || ''}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  {draft.title?.length || 0}/10 χαρακτήρες
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
                  placeholder="Περιγράψτε το χώρο σας, τη γειτονιά, τις ανέσεις και τι κάνει τη διαμονή ιδιαίτερη..."
                  value={draft.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  {draft.description?.length || 0}/90 χαρακτήρες
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Συμβουλές για καλή περιγραφή:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Αναφέρετε τα κύρια πλεονεκτήματα</li>
                  <li>• Περιγράψτε τη γειτονιά και τις συγκοινωνίες</li>
                  <li>• Αναφέρετε τυχόν ειδικούς όρους</li>
                  <li>• Γράψτε με φιλικό και προσιτό τρόπο</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Validation Messages */}
      {!isValid && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive mb-2">
              Συμπληρώστε τα παρακάτω για να συνεχίσετε:
            </p>
            <ul className="text-sm text-destructive space-y-1">
              {(!draft.photos || draft.photos.length === 0) && (
                <li>• Προσθέστε τουλάχιστον μία φωτογραφία</li>
              )}
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
          {isLastStep ? 'Δημοσίευση αγγελίας' : 'Συνέχεια'}
        </Button>
      </div>
    </div>
  );
}