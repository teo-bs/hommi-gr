import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileUpload } from "@/components/ui/file-upload";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../OnboardingModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useToast } from "@/hooks/use-toast";
import { StepTransition } from "@/components/ui/step-transition";

interface OnboardingStepOneProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const OnboardingStepOne = ({ data, onComplete, onBack }: OnboardingStepOneProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
    gender: data.gender || '',
    what_you_do: data.what_you_do || '',
    avatar_url: data.avatar_url || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Το όνομα είναι υποχρεωτικό";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Το επώνυμο είναι υποχρεωτικό";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Η ημερομηνία γέννησης είναι υποχρεωτική";
    } else {
      const age = new Date().getFullYear() - formData.date_of_birth.getFullYear();
      if (age < 16 || age > 100) {
        newErrors.date_of_birth = "Πρέπει να είστε μεταξύ 16-100 ετών";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "Επιλέξτε φύλο";
    }

    if (!formData.what_you_do) {
      newErrors.what_you_do = "Επιλέξτε τι κάνετε";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file || !user) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      setUploadProgress(30);
      const compressedBlob = await compressImage(file);
      
      setUploadProgress(50);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      setUploadProgress(70);
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedBlob, { upsert: true });

      if (uploadError) throw uploadError;

      setUploadProgress(90);
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setFormData({ ...formData, avatar_url: publicUrlData.publicUrl });
      setUploadProgress(100);
      
      toast({
        title: "Επιτυχία!",
        description: "Η φωτογραφία ανέβηκε με επιτυχία",
      });
      
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η μεταφόρτωση της φωτογραφίας",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth?.toISOString().split('T')[0] || null,
        gender: formData.gender as OnboardingData['gender'],
        what_you_do: formData.what_you_do as OnboardingData['what_you_do'],
        avatar_url: formData.avatar_url,
      });
    }
  };

  return (
    <StepTransition isVisible={true} direction="forward">
      <LoadingOverlay 
        isVisible={isUploading} 
        message="Μεταφόρτωση φωτογραφίας..." 
        progress={uploadProgress}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <FileUpload
        value={formData.avatar_url}
        onChange={handlePhotoUpload}
        placeholder="Προσθέστε φωτογραφία προφίλ (προαιρετικό)"
        fallbackText={formData.first_name?.[0]?.toUpperCase() || 'U'}
      />
      {isUploading && (
        <p className="text-sm text-muted-foreground text-center">
          Φόρτωση φωτογραφίας...
        </p>
      )}

      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="first_name">
          Όνομα <span className="text-red-500">*</span>
        </Label>
        <Input
          id="first_name"
          value={formData.first_name}
          onChange={(e) => {
            setFormData({ ...formData, first_name: e.target.value });
            if (errors.first_name) {
              setErrors({ ...errors, first_name: '' });
            }
          }}
          placeholder="π.χ. Μαρία"
          className={errors.first_name ? 'border-red-500' : ''}
        />
        {errors.first_name && (
          <p className="text-sm text-red-500">{errors.first_name}</p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="last_name">
          Επώνυμο <span className="text-red-500">*</span>
        </Label>
        <Input
          id="last_name"
          value={formData.last_name}
          onChange={(e) => {
            setFormData({ ...formData, last_name: e.target.value });
            if (errors.last_name) {
              setErrors({ ...errors, last_name: '' });
            }
          }}
          placeholder="π.χ. Παπαδοπούλου"
          className={errors.last_name ? 'border-red-500' : ''}
        />
        {errors.last_name && (
          <p className="text-sm text-red-500">{errors.last_name}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label>
          Ημερομηνία Γέννησης <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date_of_birth && "text-muted-foreground",
                errors.date_of_birth && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date_of_birth ? (
                format(formData.date_of_birth, "dd/MM/yyyy")
              ) : (
                <span>Επιλέξτε ημερομηνία</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={formData.date_of_birth}
              onSelect={(date) => {
                setFormData({ ...formData, date_of_birth: date });
                if (errors.date_of_birth) {
                  setErrors({ ...errors, date_of_birth: '' });
                }
              }}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="pointer-events-auto"
              captionLayout="dropdown-buttons"
              fromYear={1940}
              toYear={2010}
            />
          </PopoverContent>
        </Popover>
        {errors.date_of_birth && (
          <p className="text-sm text-red-500">{errors.date_of_birth}</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label>
          Φύλο <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => {
            setFormData({ ...formData, gender: value });
            if (errors.gender) {
              setErrors({ ...errors, gender: '' });
            }
          }}
        >
          <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
            <SelectValue placeholder="Επιλέξτε φύλο" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background border shadow-lg">
            <SelectItem value="female">Γυναίκα</SelectItem>
            <SelectItem value="male">Άνδρας</SelectItem>
            <SelectItem value="other">Non-binary</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender}</p>
        )}
      </div>

      {/* What you do */}
      <div className="space-y-2">
        <Label>
          Με τι ασχολείστε; <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.what_you_do}
          onValueChange={(value) => {
            setFormData({ ...formData, what_you_do: value });
            if (errors.what_you_do) {
              setErrors({ ...errors, what_you_do: '' });
            }
          }}
        >
          <SelectTrigger className={errors.what_you_do ? 'border-red-500' : ''}>
            <SelectValue placeholder="Επιλέξτε δραστηριότητα" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background border shadow-lg">
            <SelectItem value="study">Σπουδάζω</SelectItem>
            <SelectItem value="work">Εργάζομαι</SelectItem>
            <SelectItem value="study_work">Σπουδάζω & Εργάζομαι</SelectItem>
          </SelectContent>
        </Select>
        {errors.what_you_do && (
          <p className="text-sm text-red-500">{errors.what_you_do}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="h-11">
          Ακύρωση
        </Button>
        <Button type="submit" className="h-11">
          Επόμενο
        </Button>
      </div>
    </form>
    </StepTransition>
  );
};