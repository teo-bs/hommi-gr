import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PERSONALITY_OPTIONS, LIFESTYLE_OPTIONS, MUSIC_OPTIONS, SPORTS_OPTIONS, MOVIES_OPTIONS } from "@/constants/profileExtras";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth ? new Date(profile.date_of_birth) : undefined,
    gender: profile?.gender || '',
    country: profile?.country || 'GR',
    languages: profile?.languages || ['el'],
    profession: profile?.profession || '',
    about_me: profile?.about_me || '',
    avatar_url: profile?.avatar_url || '',
    what_you_do: (profile?.profile_extras as any)?.what_you_do || 'study_work',
    study_level: (profile?.profile_extras as any)?.study_level || '',
    work_profession: (profile?.profile_extras as any)?.work_profession || '',
    personality: (profile?.profile_extras as any)?.personality || [],
    lifestyle: (profile?.profile_extras as any)?.lifestyle || [],
    music: (profile?.profile_extras as any)?.music || [],
    sports: (profile?.profile_extras as any)?.sports || [],
    movies: (profile?.profile_extras as any)?.movies || [],
    who_moving: (profile?.profile_extras as any)?.who_moving || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

    if (!formData.gender) {
      newErrors.gender = "Επιλέξτε φύλο";
    }

    if (formData.what_you_do === 'study' || formData.what_you_do === 'study_work') {
      if (!formData.study_level) {
        newErrors.study_level = "Επιλέξτε επίπεδο σπουδών";
      }
    }

    if (formData.what_you_do === 'work' || formData.what_you_do === 'study_work') {
      if (!formData.work_profession) {
        newErrors.work_profession = "Συμπληρώστε το επάγγελμά σας";
      }
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

  const addChip = (category: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: [...(prev[category as keyof typeof prev] as string[]), value]
    }));
  };

  const removeChip = (category: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: (prev[category as keyof typeof prev] as string[]).filter((item: string) => item !== value)
    }));
  };

  const renderChipSection = (title: string, category: string, options: string[]) => (
    <div>
      <Label className="text-base font-medium">{title}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = (formData[category as keyof typeof formData] as string[]).includes(option);
          return (
            <Badge
              key={option}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90"
              onClick={() => {
                if (isSelected) {
                  removeChip(category, option);
                } else {
                  addChip(category, option);
                }
              }}
            >
              {option}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const currentExtras = (profile?.profile_extras as any) || {};
      const profile_extras = {
        ...currentExtras,
        what_you_do: formData.what_you_do,
        study_level: (formData.what_you_do === 'study' || formData.what_you_do === 'study_work') ? formData.study_level : undefined,
        work_profession: (formData.what_you_do === 'work' || formData.what_you_do === 'study_work') ? formData.work_profession : undefined,
        personality: formData.personality,
        lifestyle: formData.lifestyle,
        music: formData.music,
        sports: formData.sports,
        movies: formData.movies,
        who_moving: formData.who_moving,
      };

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth?.toISOString().split('T')[0] || null,
        gender: formData.gender,
        country: formData.country,
        languages: formData.languages,
        about_me: formData.about_me,
        avatar_url: formData.avatar_url,
        profile_extras
      };

      // Set profession based on what they do
      if (formData.what_you_do === 'study_work') {
        updateData.profession = `${formData.work_profession} | Student (${formData.study_level})`;
      } else if (formData.what_you_do === 'work') {
        updateData.profession = formData.work_profession;
      } else if (formData.what_you_do === 'study') {
        updateData.profession = `Student (${formData.study_level})`;
      }

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

      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Επεξεργασία στοιχείων προφίλ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Profile Photo */}
            <div>
              <Label>Φωτογραφία προφίλ</Label>
              <FileUpload
                value={formData.avatar_url}
                onChange={handlePhotoUpload}
                placeholder="Προσθέστε φωτογραφία προφίλ"
                fallbackText={formData.first_name?.[0]?.toUpperCase() || 'U'}
              />
              {isUploading && (
                <p className="text-sm text-muted-foreground">
                  Φόρτωση φωτογραφίας...
                </p>
              )}
            </div>

            {/* First Name */}
            <div>
              <Label>Όνομα</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="π.χ. Μαρία"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label>Επώνυμο</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="π.χ. Παπαδοπούλου"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label>Ημερομηνία Γέννησης</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date_of_birth && "text-muted-foreground"
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
                    onSelect={(date) => setFormData({ ...formData, date_of_birth: date })}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1940}
                    toYear={2010}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div>
              <Label>Φύλο</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε φύλο" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Γυναίκα</SelectItem>
                  <SelectItem value="male">Άνδρας</SelectItem>
                  <SelectItem value="other">Non-binary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* About Me */}
            <div>
              <Label>Σχετικά με μένα</Label>
              <Input
                value={formData.about_me}
                onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
                placeholder="Πείτε μας λίγα πράγματα για εσάς..."
              />
            </div>

            {/* Personality Chips */}
            {renderChipSection("Προσωπικότητα", "personality", PERSONALITY_OPTIONS)}

            {/* Lifestyle Chips */}
            {renderChipSection("Στυλ ζωής", "lifestyle", LIFESTYLE_OPTIONS)}

            {/* Music Chips */}
            {renderChipSection("Μουσική", "music", MUSIC_OPTIONS)}

            {/* Sports Chips */}
            {renderChipSection("Σπορ", "sports", SPORTS_OPTIONS)}

            {/* Movies Chips */}
            {renderChipSection("Ταινίες", "movies", MOVIES_OPTIONS)}

            {/* Who's Moving */}
            <div>
              <Label>Ποιος μετακομίζει;</Label>
              <Select
                value={formData.who_moving}
                onValueChange={(value) => setFormData({ ...formData, who_moving: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="just_me">Μόνος μου</SelectItem>
                  <SelectItem value="with_someone">Με κάποιον</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Ακύρωση
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};