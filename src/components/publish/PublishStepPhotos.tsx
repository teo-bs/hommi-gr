import React, { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Camera, AlertCircle } from "lucide-react";
import { uploadListingPhoto } from "@/lib/photo-upload";
import { useAuth } from "@/hooks/useAuth";
import { validatePhotoUrl } from "@/lib/photo-validation";
import { toast } from "sonner";

interface ListingDraft {
  photos: string[];
  [key: string]: any;
}

interface PublishStepPhotosProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PublishStepPhotos({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev
}: PublishStepPhotosProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (files: FileList) => {
    if (!profile?.user_id) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => uploadListingPhoto(file, profile.user_id));

    try {
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results
        .filter(result => result.success && result.url)
        .map(result => result.url!);
      
      // Validate each uploaded photo URL
      const validatedPhotos: string[] = [];
      let failedCount = 0;
      
      for (const url of uploadedUrls) {
        const isValid = await validatePhotoUrl(url, 8000);
        if (isValid) {
          validatedPhotos.push(url);
        } else {
          failedCount++;
          console.error('Photo failed validation:', url);
        }
      }
      
      if (validatedPhotos.length > 0) {
        onUpdate({ photos: [...(draft.photos || []), ...validatedPhotos] });
        toast.success(`${validatedPhotos.length} ${validatedPhotos.length === 1 ? 'φωτογραφία προστέθηκε' : 'φωτογραφίες προστέθηκαν'}`);
      }
      
      if (failedCount > 0) {
        toast.error(`${failedCount} ${failedCount === 1 ? 'φωτογραφία δεν φορτώνει' : 'φωτογραφίες δεν φορτώνουν'} σωστά και δεν προστέθηκαν`);
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      toast.error('Αποτυχία μεταφόρτωσης φωτογραφιών');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = (draft.photos || []).filter((_, i) => i !== index);
    onUpdate({ photos: updatedPhotos });
  };

  const isValid = draft.photos && draft.photos.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Φωτογραφίες</h2>
        <p className="text-muted-foreground">
          Προσθέστε φωτογραφίες για να κάνετε την καταχώρησή σας πιο ελκυστική
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Φωτογραφίες χώρου
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-base text-muted-foreground mb-2">
              {isUploading ? 'Μεταφόρτωση...' : 'Κάντε κλικ για να επιλέξετε φωτογραφίες'}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG μέχρι 10MB ανά φωτογραφία
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
            />
          </div>

          {/* Photo Grid */}
          {draft.photos && draft.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {draft.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Φωτογραφία ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.classList.add('border-2', 'border-destructive');
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Κύρια φωτογραφία
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Συμβουλή:</strong> Η πρώτη φωτογραφία θα είναι η κύρια φωτογραφία της αγγελίας. 
              Βεβαιωθείτε ότι είναι φωτεινή και δείχνει το δωμάτιο στην καλύτερη του μορφή!
            </p>
          </div>
        </CardContent>
      </Card>

      {!isValid && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-destructive">
              ⚠️ Προσθέστε τουλάχιστον μία φωτογραφία για να συνεχίσετε
            </p>
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
