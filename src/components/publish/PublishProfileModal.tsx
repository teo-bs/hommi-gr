import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PublishProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Chip options
const PERSONALITY_OPTIONS = [
  'Εξωστρεφής', 'Ήσυχος/η', 'Δημιουργικός/ή', 'Οργανωτικός/ή', 'Χιουμοριστικός/ή',
  'Περιπετειώδης', 'Αναλυτικός/ή', 'Φιλικός/ή', 'Υπομονετικός/ά', 'Ενεργητικός/ή'
];

const LIFESTYLE_OPTIONS = [
  'Πρωινός τύπος', 'Νυχτερινός τύπος', 'Fitness enthusiast', 'Foodie', 'Ταξιδιώτης',
  'Homebody', 'Social butterfly', 'Minimalist', 'Book lover', 'Nature lover'
];

const MUSIC_OPTIONS = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Indie',
  'Classical', 'Jazz', 'Folk', 'R&B', 'Alternative'
];

const SPORTS_OPTIONS = [
  'Ποδόσφαιρο', 'Μπάσκετ', 'Τένις', 'Κολύμβηση', 'Τρέξιμο',
  'Yoga', 'Γυμναστήριο', 'Ποδηλασία', 'Πεζοπορία', 'Χορός'
];

const MOVIES_OPTIONS = [
  'Κωμωδία', 'Δράμα', 'Action', 'Sci-Fi', 'Θρίλερ',
  'Ρομαντικές', 'Ντοκιμαντέρ', 'Horror', 'Animation', 'Fantasy'
];

export const PublishProfileModal = ({ isOpen, onClose, onSuccess }: PublishProfileModalProps) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth || '',
    profession: profile?.profession || '',
    country: profile?.country || 'GR',
    about_me: profile?.about_me || '',
    social_instagram: profile?.social_instagram || '',
    social_twitter_x: profile?.social_twitter_x || '',
    social_linkedin: profile?.social_linkedin || '',
    personality: (profile?.profile_extras as any)?.personality || [],
    lifestyle: (profile?.profile_extras as any)?.lifestyle || [],
    music: (profile?.profile_extras as any)?.music || [],
    sports: (profile?.profile_extras as any)?.sports || [],
    movies: (profile?.profile_extras as any)?.movies || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }

    if (!formData.profession.trim()) {
      newErrors.profession = "Το επάγγελμα είναι υποχρεωτικό";
    }

    if (!formData.country) {
      newErrors.country = "Η χώρα είναι υποχρεωτική";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const profile_extras = {
        ...(profile?.profile_extras as any) || {},
        personality: formData.personality,
        lifestyle: formData.lifestyle,
        music: formData.music,
        sports: formData.sports,
        movies: formData.movies,
      };

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        profession: formData.profession,
        country: formData.country,
        about_me: formData.about_me,
        social_instagram: formData.social_instagram || null,
        social_twitter_x: formData.social_twitter_x || null,
        social_linkedin: formData.social_linkedin || null,
        profile_extras
      };

      const { error } = await updateProfile(updateData);

      if (error) {
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η ενημέρωση του προφίλ",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία!",
        description: "Το προφίλ σας ενημερώθηκε επιτυχώς",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Παρουσιάστηκε απροσδόκητο σφάλμα",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addChip = (category: keyof typeof formData, value: string) => {
    const currentChips = formData[category] as string[];
    if (currentChips.length < 5 && !currentChips.includes(value)) {
      setFormData({
        ...formData,
        [category]: [...currentChips, value]
      });
    }
  };

  const removeChip = (category: keyof typeof formData, value: string) => {
    const currentChips = formData[category] as string[];
    setFormData({
      ...formData,
      [category]: currentChips.filter(chip => chip !== value)
    });
  };

  const renderChipSection = (
    title: string,
    category: keyof typeof formData,
    options: string[]
  ) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      
      {/* Selected chips */}
      {(formData[category] as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(formData[category] as string[]).map((chip) => (
            <Badge key={chip} variant="secondary" className="flex items-center gap-1">
              {chip}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeChip(category, chip)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Available options */}
      {(formData[category] as string[]).length < 3 && (
        <div className="flex flex-wrap gap-1">
          {options
            .filter(option => !(formData[category] as string[]).includes(option))
            .slice(0, 6)
            .map((option) => (
              <Button
                key={option}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => addChip(category, option)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {option}
              </Button>
            ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Επιλέξτε έως 3 ({(formData[category] as string[]).length}/3)
      </p>
    </div>
  );

  const currentCompletion = profile?.profile_completion_pct || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Ολοκληρώστε το προφίλ σας για δημοσίευση
          </DialogTitle>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Το προφίλ σας είναι {currentCompletion}% πλήρες. Χρειάζεστε τουλάχιστον 80% για να δημοσιεύσετε την αγγελία σας.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Βασικές πληροφορίες</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">
                  Όνομα <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={errors.first_name ? 'border-red-500' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name">
                  Επώνυμο <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={errors.last_name ? 'border-red-500' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date_of_birth">
                  Ημερομηνία γέννησης <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className={errors.date_of_birth ? 'border-red-500' : ''}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                )}
              </div>

              <div>
                <Label htmlFor="profession">
                  Επάγγελμα <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  className={errors.profession ? 'border-red-500' : ''}
                  placeholder="π.χ. Φοιτητής, Μηχανικός, κλπ."
                />
                {errors.profession && (
                  <p className="text-sm text-red-500">{errors.profession}</p>
                )}
              </div>

              <div>
                <Label>
                  Χώρα <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Επιλέξτε χώρα" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GR">Ελλάδα</SelectItem>
                    <SelectItem value="CY">Κύπρος</SelectItem>
                    <SelectItem value="US">ΗΠΑ</SelectItem>
                    <SelectItem value="UK">Ηνωμένο Βασίλειο</SelectItem>
                    <SelectItem value="DE">Γερμανία</SelectItem>
                    <SelectItem value="FR">Γαλλία</SelectItem>
                    <SelectItem value="IT">Ιταλία</SelectItem>
                    <SelectItem value="ES">Ισπανία</SelectItem>
                    <SelectItem value="OTHER">Άλλη</SelectItem>
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold">Ενδιαφέροντα (προαιρετικό)</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderChipSection("Προσωπικότητα", "personality", PERSONALITY_OPTIONS)}
              {renderChipSection("Στυλ ζωής", "lifestyle", LIFESTYLE_OPTIONS)}
              {renderChipSection("Μουσική", "music", MUSIC_OPTIONS)}
              {renderChipSection("Ταινίες", "movies", MOVIES_OPTIONS)}
            </div>
          </div>

          {/* Social & Bio */}
          <div className="space-y-4">
            <h3 className="font-semibold">Επιπλέον πληροφορίες (προαιρετικό)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Instagram</Label>
                <Input
                  value={formData.social_instagram}
                  onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input
                  value={formData.social_linkedin}
                  onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <Label>Παρουσιάστε τον εαυτό σας</Label>
              <Textarea
                value={formData.about_me}
                onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                placeholder="Πείτε μας λίγα λόγια για εσάς, τα χόμπι σας, τι αναζητάτε σε έναν συγκάτοικο..."
                className="min-h-[80px]"
                maxLength={300}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {formData.about_me.length}/300
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Ακύρωση
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση & Συνέχεια'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};