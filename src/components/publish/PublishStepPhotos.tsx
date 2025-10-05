import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Camera, AlertCircle, AlertTriangle } from "lucide-react";
import { uploadListingPhoto } from "@/lib/photo-upload";
import { useAuth } from "@/hooks/useAuth";
import { validatePhotoUrl } from "@/lib/photo-validation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resolveBrokenPhoto } from "@/lib/resolve-broken-photo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [brokenPhotoUrls, setBrokenPhotoUrls] = useState<Set<string>>(new Set());

  // Fetch broken photos for this listing
  useEffect(() => {
    const fetchBrokenPhotos = async () => {
      if (!draft.id) return;

      const { data } = await supabase
        .from('broken_photos_log')
        .select('photo_url')
        .eq('room_id', draft.id)
        .is('resolved_at', null);

      if (data) {
        setBrokenPhotoUrls(new Set(data.map(row => row.photo_url)));
      }
    };

    fetchBrokenPhotos();
  }, [draft.id]);

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

  const removePhoto = async (index: number) => {
    const photoUrl = draft.photos?.[index];
    const updatedPhotos = (draft.photos || []).filter((_, i) => i !== index);
    onUpdate({ photos: updatedPhotos });

    // Mark as resolved if it was a broken photo
    if (photoUrl && brokenPhotoUrls.has(photoUrl)) {
      await resolveBrokenPhoto(photoUrl, 'deleted');
      setBrokenPhotoUrls(prev => {
        const next = new Set(prev);
        next.delete(photoUrl);
        return next;
      });
      toast.success('✅ Broken photo removed');
    }
  };

  const replacePhoto = async (index: number, files: FileList) => {
    if (!profile?.user_id || files.length === 0) return;

    const oldPhotoUrl = draft.photos?.[index];
    setIsUploading(true);

    try {
      const file = files[0];
      const result = await uploadListingPhoto(file, profile.user_id);
      
      if (result.success && result.url) {
        const isValid = await validatePhotoUrl(result.url, 8000);
        
        if (isValid) {
          const updatedPhotos = [...(draft.photos || [])];
          updatedPhotos[index] = result.url;
          onUpdate({ photos: updatedPhotos });

          // Mark old photo as resolved if it was broken
          if (oldPhotoUrl && brokenPhotoUrls.has(oldPhotoUrl)) {
            await resolveBrokenPhoto(oldPhotoUrl, 'replaced');
            setBrokenPhotoUrls(prev => {
              const next = new Set(prev);
              next.delete(oldPhotoUrl);
              return next;
            });
            toast.success('✅ Photo replaced successfully!');
          } else {
            toast.success('Photo replaced');
          }
        } else {
          toast.error('New photo failed to load. Please try another image.');
        }
      }
    } catch (error) {
      console.error('Photo replacement failed:', error);
      toast.error('Failed to replace photo');
    } finally {
      setIsUploading(false);
    }
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
              {draft.photos.map((photo, index) => {
                const isBroken = brokenPhotoUrls.has(photo);
                
                return (
                  <div 
                    key={index} 
                    className={`relative group ${isBroken ? 'ring-2 ring-destructive rounded-lg' : ''}`}
                  >
                    <img
                      src={photo}
                      alt={`Φωτογραφία ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.classList.add('border-2', 'border-destructive');
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Broken photo badge */}
                    {isBroken && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Broken
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This photo failed to load. Replace it for better results</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {/* Replace button for broken photos */}
                    {isBroken && (
                      <label 
                        htmlFor={`replace-${index}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="pointer-events-none"
                        >
                          Replace
                        </Button>
                        <input
                          id={`replace-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files && replacePhoto(index, e.target.files)}
                        />
                      </label>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {index === 0 && !isBroken && (
                      <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Κύρια φωτογραφία
                      </div>
                    )}
                  </div>
                );
              })}
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
