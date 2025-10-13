import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import type { OnboardingData } from "../OnboardingModal";
import { StepTransition } from "@/components/ui/step-transition";

interface OnboardingStepThreeProps {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
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

export const OnboardingStepThree = ({ data, onComplete, onBack }: OnboardingStepThreeProps) => {
  const [formData, setFormData] = useState({
    study_level: '',
    work_profession: '',
    who_moving: '',
    about_me: '',
    social_instagram: '',
    social_twitter_x: '',
    social_linkedin: '',
    personality: [] as string[],
    lifestyle: [] as string[],
    music: [] as string[],
    sports: [] as string[],
    movies: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (data.what_you_do === 'study' || data.what_you_do === 'study_work') {
      if (!formData.study_level) {
        newErrors.study_level = "Επιλέξτε επίπεδο σπουδών";
      }
    }

    if (data.what_you_do === 'work' || data.what_you_do === 'study_work') {
      if (!formData.work_profession) {
        newErrors.work_profession = "Συμπληρώστε το επάγγελμά σας";
      }
    }

    if (!formData.who_moving) {
      newErrors.who_moving = "Επιλέξτε ποιος μετακομίζει";
    }

    if (formData.about_me.length > 500) {
      newErrors.about_me = "Η περιγραφή δεν μπορεί να υπερβαίνει τους 500 χαρακτήρες";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onComplete(formData);
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
      {(formData[category] as string[]).length < 5 && (
        <div className="flex flex-wrap gap-1">
          {options
            .filter(option => !(formData[category] as string[]).includes(option))
            .slice(0, 10)
            .map((option) => (
              <Button
                key={option}
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-xs touch-manipulation"
                onClick={() => addChip(category, option)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {option}
              </Button>
            ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Επιλέξτε έως 5 ({(formData[category] as string[]).length}/5)
      </p>
    </div>
  );

  return (
    <StepTransition isVisible={true} direction="forward">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branching questions */}
        <div className="space-y-4">
          <h3 className="font-medium">Λεπτομέρειες δραστηριοτήτων</h3>
          
          {(data.what_you_do === 'study' || data.what_you_do === 'study_work') && (
            <div>
              <Label>
                Τι σπουδάζεις; <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.study_level}
                onValueChange={(value) => setFormData({ ...formData, study_level: value })}
              >
                <SelectTrigger className={errors.study_level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Επιλέξτε επίπεδο" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="pre-uni">Προ-πανεπιστημιακές σπουδές</SelectItem>
                  <SelectItem value="bachelors">Πτυχίο (Bachelor)</SelectItem>
                  <SelectItem value="masters">Μεταπτυχιακό (Masters)</SelectItem>
                  <SelectItem value="phd">Διδακτορικό (PhD)</SelectItem>
                </SelectContent>
              </Select>
              {errors.study_level && (
                <p className="text-sm text-red-500 mt-1">{errors.study_level}</p>
              )}
            </div>
          )}

          {(data.what_you_do === 'work' || data.what_you_do === 'study_work') && (
            <div>
              <Label>
                Με τι ασχολείσαι; <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.work_profession}
                onValueChange={(value) => setFormData({ ...formData, work_profession: value })}
              >
                <SelectTrigger className={errors.work_profession ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Επιλέξτε επάγγελμα" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="software-engineer">Μηχανικός Λογισμικού</SelectItem>
                  <SelectItem value="teacher">Εκπαιδευτικός</SelectItem>
                  <SelectItem value="doctor">Γιατρός</SelectItem>
                  <SelectItem value="lawyer">Δικηγόρος</SelectItem>
                  <SelectItem value="accountant">Λογιστής</SelectItem>
                  <SelectItem value="designer">Σχεδιαστής</SelectItem>
                  <SelectItem value="sales">Πωλήσεις</SelectItem>
                  <SelectItem value="marketing">Μάρκετινγκ</SelectItem>
                  <SelectItem value="consultant">Σύμβουλος</SelectItem>
                  <SelectItem value="entrepreneur">Επιχειρηματίας</SelectItem>
                  <SelectItem value="other">Άλλο</SelectItem>
                </SelectContent>
              </Select>
              {errors.work_profession && (
                <p className="text-sm text-red-500 mt-1">{errors.work_profession}</p>
              )}
            </div>
          )}

          {/* Who's moving */}
          <div>
            <Label>
              Ποιος μετακομίζει; <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.who_moving}
              onValueChange={(value) => setFormData({ ...formData, who_moving: value })}
            >
              <SelectTrigger className={errors.who_moving ? 'border-red-500' : ''}>
                <SelectValue placeholder="Επιλέξτε" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="just_me">Μόνο εγώ</SelectItem>
                <SelectItem value="with_someone">Εγώ και κάποιος άλλος</SelectItem>
              </SelectContent>
            </Select>
            {errors.who_moving && (
              <p className="text-sm text-red-500 mt-1">{errors.who_moving}</p>
            )}
          </div>
        </div>

        {/* Chip sections */}
        <div className="space-y-4">
          <h3 className="font-medium">Ενδιαφέροντα και στυλ ζωής</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {renderChipSection("Προσωπικότητα", "personality", PERSONALITY_OPTIONS)}
            {renderChipSection("Στυλ ζωής", "lifestyle", LIFESTYLE_OPTIONS)}
            {renderChipSection("Μουσική", "music", MUSIC_OPTIONS)}
            {renderChipSection("Σπορ", "sports", SPORTS_OPTIONS)}
            {renderChipSection("Ταινίες", "movies", MOVIES_OPTIONS)}
          </div>
        </div>

        {/* Social profiles */}
        <div className="space-y-4">
          <h3 className="font-medium">Κοινωνικά δίκτυα</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Instagram</Label>
              <Input
                value={formData.social_instagram}
                onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                placeholder="username"
              />
            </div>
            <div>
              <Label>Twitter/X</Label>
              <Input
                value={formData.social_twitter_x}
                onChange={(e) => setFormData({ ...formData, social_twitter_x: e.target.value })}
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
        </div>

        {/* About me */}
        <div>
          <Label>
            Παρουσιάστε τον εαυτό σας
          </Label>
          <Textarea
            value={formData.about_me}
            onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
            placeholder="Πείτε μας λίγα λόγια για εσάς, τα χόμπι σας, τι αναζητάτε σε έναν συγκάτοικο..."
            className={`min-h-[100px] ${errors.about_me ? 'border-red-500' : ''}`}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Προαιρετικό - βοηθά να σας γνωρίσουν καλύτερα</span>
            <span>{formData.about_me.length}/500</span>
          </div>
          {errors.about_me && (
            <p className="text-sm text-red-500">{errors.about_me}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="h-11">
            Πίσω
          </Button>
          <Button type="submit" className="h-11">
            Επόμενο
          </Button>
        </div>
      </form>
    </StepTransition>
  );
};
