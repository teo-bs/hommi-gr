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
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Basic Information Section */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Βασικές Πληροφορίες</CardTitle>
          <p className="text-sm text-muted-foreground">
            Οι πληροφορίες αυτές θα εμφανίζονται στο προφίλ σας
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* About Me / Bio */}
          <div className="space-y-2">
            <Label htmlFor="about_me" className="text-sm font-medium">
              Βιογραφικό Σημείωμα
            </Label>
            <Textarea
              id="about_me"
              value={formData.about_me}
              onChange={(e) => onFormDataChange({ about_me: e.target.value })}
              placeholder="Πείτε μας λίγα λόγια για εσάς..."
              rows={4}
              className="resize-none text-base"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Αυτό θα το βλέπουν άλλοι χρήστες στο προφίλ σας
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.about_me?.length || 0}/500
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profession */}
            <div className="space-y-2">
              <Label htmlFor="profession" className="text-sm font-medium">Επάγγελμα</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => onFormDataChange({ profession: e.target.value })}
                placeholder="π.χ. Φοιτητής, Μηχανικός"
                className="text-base"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">Φύλο</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => onFormDataChange({ gender: value as GenderType })}
              >
                <SelectTrigger id="gender" className="text-base">
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="country" className="text-sm font-medium">Χώρα</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => onFormDataChange({ country: value })}
              >
                <SelectTrigger id="country" className="text-base">
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
          </div>
        </CardContent>
      </Card>

      {/* Communication & Languages Section */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Επικοινωνία & Γλώσσες</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Languages */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Γλώσσες που μιλάτε</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.languages.map((lang) => {
                const langLabel = availableLanguages.find(l => l.value === lang)?.label || lang;
                return (
                  <Badge key={lang} variant="secondary" className="gap-1 text-sm">
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
                    className="text-sm"
                  >
                    + {lang.label}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links Section */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Κοινωνικά Δίκτυα</CardTitle>
          <p className="text-sm text-muted-foreground">Προαιρετικό - Προσθέστε τα social media σας</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2 text-sm font-medium">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Label>
              <Input
                id="instagram"
                value={formData.social_instagram}
                onChange={(e) => onFormDataChange({ social_instagram: e.target.value })}
                placeholder="username"
                className="text-base"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium">
                <Linkedin className="h-4 w-4 text-blue-600" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                value={formData.social_linkedin}
                onChange={(e) => onFormDataChange({ social_linkedin: e.target.value })}
                placeholder="username"
                className="text-base"
              />
            </div>

            {/* Twitter/X */}
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2 text-sm font-medium">
                <Twitter className="h-4 w-4 text-sky-600" />
                Twitter/X
              </Label>
              <Input
                id="twitter"
                value={formData.social_twitter_x}
                onChange={(e) => onFormDataChange({ social_twitter_x: e.target.value })}
                placeholder="@username"
                className="text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight">Λογαριασμός</CardTitle>
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
      <div className="sticky bottom-0 sm:relative bg-background/95 backdrop-blur-md pt-4 pb-safe border-t sm:border-t-0 -mx-4 px-4 sm:mx-0 sm:px-0 shadow-lg sm:shadow-none">
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            className="flex-1 sm:flex-initial min-h-[44px] active:scale-95 transition-transform"
            disabled={isSaving}
          >
            {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Αλλαγών'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 sm:flex-initial min-h-[44px] active:scale-95 transition-transform"
            disabled={isSaving}
          >
            Ακύρωση
          </Button>
        </div>
      </div>
    </div>
  );
};
