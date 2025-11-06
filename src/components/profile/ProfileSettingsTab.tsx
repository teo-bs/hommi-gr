import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";

type GenderType = 'male' | 'female' | 'other' | '';

interface FormData {
  about_me: string;
  profession: string;
  gender: GenderType;
  country: string;
  languages: string[];
  social_instagram: string;
  social_linkedin: string;
  social_twitter_x: string;
  social_tiktok: string;
}

interface ProfileSettingsTabProps {
  profile: any;
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ProfileSettingsTab = ({ 
  profile,
  formData, 
  onFormDataChange, 
  onSave, 
  onCancel,
  isEditing 
}: ProfileSettingsTabProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
  };

  const availableLanguages = [
    { value: 'el', label: 'Ελληνικά' },
    { value: 'en', label: 'Αγγλικά' },
    { value: 'fr', label: 'Γαλλικά' },
    { value: 'de', label: 'Γερμανικά' },
    { value: 'it', label: 'Ιταλικά' },
    { value: 'es', label: 'Ισπανικά' },
  ];

  const toggleLanguage = (langCode: string) => {
    const current = formData.languages || [];
    if (current.includes(langCode)) {
      onFormDataChange({ languages: current.filter(l => l !== langCode) });
    } else {
      onFormDataChange({ languages: [...current, langCode] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Προσωπικές Πληροφορίες</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* About Me */}
          <div className="space-y-2">
            <Label htmlFor="about_me">Σχετικά με εμένα</Label>
            <Textarea
              id="about_me"
              value={formData.about_me}
              onChange={(e) => onFormDataChange({ about_me: e.target.value })}
              placeholder="Πείτε μας λίγα λόγια για εσάς..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.about_me?.length || 0}/500 χαρακτήρες
            </p>
          </div>

          {/* Profession */}
          <div className="space-y-2">
            <Label htmlFor="profession">Επάγγελμα</Label>
            <Input
              id="profession"
              value={formData.profession}
              onChange={(e) => onFormDataChange({ profession: e.target.value })}
              placeholder="π.χ. Φοιτητής, Μηχανικός, Δάσκαλος"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Φύλο</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => onFormDataChange({ gender: value as GenderType })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Επιλέξτε φύλο" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Άνδρας</SelectItem>
                <SelectItem value="female">Γυναίκα</SelectItem>
                <SelectItem value="other">Άλλο</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Χώρα</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => onFormDataChange({ country: value })}
            >
              <SelectTrigger id="country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GR">Ελλάδα</SelectItem>
                <SelectItem value="CY">Κύπρος</SelectItem>
                <SelectItem value="US">ΗΠΑ</SelectItem>
                <SelectItem value="GB">Ηνωμένο Βασίλειο</SelectItem>
                <SelectItem value="DE">Γερμανία</SelectItem>
                <SelectItem value="FR">Γαλλία</SelectItem>
                <SelectItem value="IT">Ιταλία</SelectItem>
                <SelectItem value="ES">Ισπανία</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <Label>Γλώσσες</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.languages.map((lang) => {
                const langLabel = availableLanguages.find(l => l.value === lang)?.label || lang;
                return (
                  <Badge key={lang} variant="secondary" className="gap-1">
                    {langLabel}
                    <button
                      onClick={() => toggleLanguage(lang)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableLanguages
                .filter(lang => !formData.languages.includes(lang.value))
                .map((lang) => (
                  <Button
                    key={lang.value}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLanguage(lang.value)}
                  >
                    + {lang.label}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Κοινωνικά Δίκτυα</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={formData.social_instagram}
              onChange={(e) => onFormDataChange({ social_instagram: e.target.value })}
              placeholder="username"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-600" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={formData.social_linkedin}
              onChange={(e) => onFormDataChange({ social_linkedin: e.target.value })}
              placeholder="username"
            />
          </div>

          {/* Twitter/X */}
          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-sky-600" />
              Twitter/X
            </Label>
            <Input
              id="twitter"
              value={formData.social_twitter_x}
              onChange={(e) => onFormDataChange({ social_twitter_x: e.target.value })}
              placeholder="@username"
            />
          </div>
        </CardContent>
      </Card>

      {/* Role Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Ρόλος Λογαριασμού</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {profile.role === 'tenant' ? 'Ενοικιαστής' : 'Ιδιοκτήτης'}
              </p>
              <p className="text-sm text-muted-foreground">
                Ο ρόλος σας καθορίζει τις δυνατότητες του λογαριασμού σας
              </p>
            </div>
            <Badge variant={profile.role === 'tenant' ? 'default' : 'secondary'}>
              {profile.role === 'tenant' ? 'Tenant' : 'Lister'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Save/Cancel Buttons - Sticky on Mobile */}
      <div className="sticky bottom-0 sm:relative bg-background pt-4 pb-safe border-t sm:border-t-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            className="flex-1 sm:flex-initial active:scale-95 transition-transform"
            disabled={isSaving}
          >
            {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 sm:flex-initial active:scale-95 transition-transform"
            disabled={isSaving}
          >
            Ακύρωση
          </Button>
        </div>
      </div>
    </div>
  );
};
