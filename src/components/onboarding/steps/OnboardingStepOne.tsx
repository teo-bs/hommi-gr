import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CalendarIcon, Camera, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../OnboardingModal";

interface OnboardingStepOneProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export const OnboardingStepOne = ({ data, onComplete, onBack }: OnboardingStepOneProps) => {
  const [formData, setFormData] = useState({
    display_name: data.display_name,
    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
    gender: data.gender || '',
    what_you_do: data.what_you_do || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete({
        display_name: formData.display_name,
        date_of_birth: formData.date_of_birth?.toISOString().split('T')[0] || null,
        gender: formData.gender as OnboardingData['gender'],
        what_you_do: formData.what_you_do as OnboardingData['what_you_do'],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photo */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={data.avatar_url} />
            <AvatarFallback className="text-lg">
              {formData.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Προσθέστε 1-5 φωτογραφίες (προαιρετικό)
        </p>
      </div>

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
          <PopoverContent className="w-auto p-0" align="start">
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
              fromYear={1950}
              toYear={new Date().getFullYear()}
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
          <SelectContent>
            <SelectItem value="female">Γυναίκα</SelectItem>
            <SelectItem value="male">Άνδρας</SelectItem>
            <SelectItem value="other">Non-binary</SelectItem>
            <SelectItem value="prefer_not_to_say">Προτιμώ να μην απαντήσω</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender}</p>
        )}
      </div>

      {/* What you do */}
      <div className="space-y-2">
        <Label>
          Τι κάνετε; <span className="text-red-500">*</span>
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
          <SelectContent>
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