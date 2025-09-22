import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, MapPin, Euro } from "lucide-react";
import { ListingDraft } from "../ListingWizard";

interface StepOneProps {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
  role: 'individual' | 'agency';
}

export const StepOne = ({ draft, onChange, role }: StepOneProps) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO: Implement actual photo upload to Supabase Storage
    const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    onChange({ photos: [...draft.photos, ...newPhotos] });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = draft.photos.filter((_, i) => i !== index);
    onChange({ photos: updatedPhotos });
  };

  const errors = {
    title: !draft.title,
    city: !draft.city,
    neighborhood: !draft.neighborhood,
    price_month: !draft.price_month || draft.price_month <= 0,
    photos: draft.photos.length === 0
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <Label htmlFor="title">
              Listing Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder={role === 'individual' 
                ? "e.g., Cozy room in central Athens apartment" 
                : "e.g., Modern 2BR apartment near metro"
              }
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">Please add a title for your listing</p>
            )}
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                placeholder="e.g., Athens"
                value={draft.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className={`pl-10 ${errors.city ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.city && (
              <p className="text-sm text-destructive mt-1">Please specify the city</p>
            )}
          </div>

          {/* Neighborhood */}
          <div>
            <Label htmlFor="neighborhood">
              Neighborhood <span className="text-destructive">*</span>
            </Label>
            <Input
              id="neighborhood"
              placeholder="e.g., Kolonaki, Exarchia"
              value={draft.neighborhood}
              onChange={(e) => onChange({ neighborhood: e.target.value })}
              className={errors.neighborhood ? 'border-destructive' : ''}
            />
            {errors.neighborhood && (
              <p className="text-sm text-destructive mt-1">Please specify the neighborhood</p>
            )}
          </div>

          {/* Monthly Price */}
          <div className="md:col-span-2">
            <Label htmlFor="price">
              Monthly Price <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                placeholder="600"
                value={draft.price_month || ''}
                onChange={(e) => onChange({ price_month: e.target.value ? parseInt(e.target.value) : null })}
                className={`pl-10 ${errors.price_month ? 'border-destructive' : ''}`}
              />
              <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                per month
              </div>
            </div>
            {errors.price_month && (
              <p className="text-sm text-destructive mt-1">Please enter a valid monthly price</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Photos <span className="text-destructive">*</span>
        </h2>
        <p className="text-muted-foreground mb-4">
          Add at least one photo to showcase your {role === 'individual' ? 'room' : 'property'}
        </p>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-lg font-medium mb-2">
              Click to upload photos
            </div>
            <div className="text-sm text-muted-foreground">
              PNG, JPG up to 10MB each
            </div>
          </label>
        </div>

        {/* Photo Grid */}
        {draft.photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {draft.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.photos && (
          <p className="text-sm text-destructive mt-2">Please add at least one photo</p>
        )}
      </Card>
    </div>
  );
};