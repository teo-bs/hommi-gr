import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { OnboardingData } from "../OnboardingModal";

interface OnboardingStepTwoProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const AVAILABLE_LANGUAGES = [
  { value: 'el', label: 'Ελληνικά' },
  { value: 'en', label: 'Αγγλικά' },
  { value: 'fr', label: 'Γαλλικά' },
  { value: 'de', label: 'Γερμανικά' },
  { value: 'es', label: 'Ισπανικά' },
  { value: 'it', label: 'Ιταλικά' },
  { value: 'ru', label: 'Ρωσικά' },
  { value: 'ar', label: 'Αραβικά' },
  { value: 'zh', label: 'Κινεζικά' },
  { value: 'ja', label: 'Ιαπωνικά' },
];

const COUNTRIES = [
  { value: 'GR', label: 'Ελλάδα' },
  { value: 'CY', label: 'Κύπρος' },
  { value: 'US', label: 'Η.Π.Α.' },
  { value: 'GB', label: 'Ηνωμένο Βασίλειο' },
  { value: 'DE', label: 'Γερμανία' },
  { value: 'FR', label: 'Γαλλία' },
  { value: 'IT', label: 'Ιταλία' },
  { value: 'ES', label: 'Ισπανία' },
  { value: 'NL', label: 'Ολλανδία' },
  { value: 'BE', label: 'Βέλγιο' },
  { value: 'AT', label: 'Αυστρία' },
  { value: 'CH', label: 'Ελβετία' },
  { value: 'SE', label: 'Σουηδία' },
  { value: 'NO', label: 'Νορβηγία' },
  { value: 'DK', label: 'Δανία' },
  { value: 'FI', label: 'Φινλανδία' },
];

export const OnboardingStepTwo = ({ data, onComplete, onBack }: OnboardingStepTwoProps) => {
  const [formData, setFormData] = useState({
    country: data.country,
    languages: data.languages,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.country) {
      newErrors.country = "Επιλέξτε χώρα κατοικίας";
    }

    if (formData.languages.length === 0) {
      newErrors.languages = "Επιλέξτε τουλάχιστον μία γλώσσα";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete({
        country: formData.country,
        languages: formData.languages,
      });
    }
  };

  const addLanguage = (languageCode: string) => {
    if (!formData.languages.includes(languageCode)) {
      const newLanguages = [...formData.languages, languageCode];
      setFormData({ ...formData, languages: newLanguages });
      if (errors.languages) {
        setErrors({ ...errors, languages: '' });
      }
    }
  };

  const removeLanguage = (languageCode: string) => {
    const newLanguages = formData.languages.filter(lang => lang !== languageCode);
    setFormData({ ...formData, languages: newLanguages });
  };

  const getLanguageLabel = (code: string) => {
    const lang = AVAILABLE_LANGUAGES.find(l => l.value === code);
    return lang?.label || code;
  };

  const getCountryLabel = (code: string) => {
    const country = COUNTRIES.find(c => c.value === code);
    return country?.label || code;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Country of residence */}
      <div className="space-y-2">
        <Label>
          Χώρα κατοικίας <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.country}
          onValueChange={(value) => {
            setFormData({ ...formData, country: value });
            if (errors.country) {
              setErrors({ ...errors, country: '' });
            }
          }}
        >
          <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
            <SelectValue placeholder="Επιλέξτε χώρα" />
          </SelectTrigger>
          <SelectContent className="max-h-60 z-50 bg-background border shadow-lg">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-sm text-red-500">{errors.country}</p>
        )}
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label>
          Γλώσσες που μιλάτε <span className="text-red-500">*</span>
        </Label>
        
        {/* Selected languages */}
        {formData.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                {getLanguageLabel(lang)}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeLanguage(lang)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Add language dropdown */}
        <Select
          value=""
          onValueChange={addLanguage}
        >
          <SelectTrigger className={errors.languages ? 'border-red-500' : ''}>
            <SelectValue placeholder="Προσθέστε γλώσσα" />
          </SelectTrigger>
          <SelectContent className="max-h-60 z-50 bg-background border shadow-lg">
            {AVAILABLE_LANGUAGES
              .filter(lang => !formData.languages.includes(lang.value))
              .map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        
        {errors.languages && (
          <p className="text-sm text-red-500">{errors.languages}</p>
        )}
        
        <p className="text-xs text-muted-foreground">
          Επιλέξτε όλες τις γλώσσες που μπορείτε να χρησιμοποιήσετε για επικοινωνία
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Πίσω
        </Button>
        <Button type="submit">
          Επόμενο
        </Button>
      </div>
    </form>
  );
};