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

interface OnboardingStepOneProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const OnboardingStepOne = ({ data, onComplete, onBack }: OnboardingStepOneProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    display_name: data.display_name,
    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
    gender: data.gender || '',
    what_you_do: data.what_you_do || '',
    avatar_url: data.avatar_url || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = "Το όνομα είναι υποχρεωτικό";
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

  const handlePhotoUpload = async (file: File | null) => {
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      setFormData({ ...formData, avatar_url: publicUrlData.publicUrl });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete({
        display_name: formData.display_name,
        date_of_birth: formData.date_of_birth?.toISOString().split('T')[0] || null,
        gender: formData.gender as OnboardingData['gender'],
        what_you_do: formData.what_you_do as OnboardingData['what_you_do'],
        avatar_url: formData.avatar_url,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <FileUpload
        value={formData.avatar_url}
        onChange={handlePhotoUpload}
        placeholder="Προσθέστε φωτογραφία προφίλ (προαιρετικό)"
        fallbackText={formData.display_name?.[0]?.toUpperCase() || 'U'}
      />
      {isUploading && (
        <p className="text-sm text-muted-foreground text-center">
          Φόρτωση φωτογραφίας...
        </p>
      )}

      {/* Name & Surname */}
      <div className="space-y-2">
        <Label htmlFor="display_name">
          Όνομα και Επώνυμο <span className="text-red-500">*</span>
        </Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => {
            setFormData({ ...formData, display_name: e.target.value });
            if (errors.display_name) {
              setErrors({ ...errors, display_name: '' });
            }
          }}
          placeholder="π.χ. Μαρία Παπαδοπούλου"
          className={errors.display_name ? 'border-red-500' : ''}
        />
        {errors.display_name && (
          <p className="text-sm text-red-500">{errors.display_name}</p>
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
        <Button type="button" variant="outline" onClick={onBack}>
          Ακύρωση
        </Button>
        <Button type="submit">
          Επόμενο
        </Button>
      </div>
    </form>
  );
};