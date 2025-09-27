import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
              <Label>
                Όνομα <span className="text-red-500">*</span>
              </Label>
              <Input
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
            <div>
              <Label>
                Επώνυμο <span className="text-red-500">*</span>
              </Label>
              <Input
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
            <div>
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
            <div>
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
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <Label>Χώρα</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GR">Ελλάδα</SelectItem>
                  <SelectItem value="CY">Κύπρος</SelectItem>
                  <SelectItem value="other">Άλλη</SelectItem>
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

            <div>
              <Label>
                Με τι ασχολείστε; <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.what_you_do}
                onValueChange={(value) => setFormData({ ...formData, what_you_do: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε δραστηριότητα" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Σπουδάζω</SelectItem>
                  <SelectItem value="work">Εργάζομαι</SelectItem>
                  <SelectItem value="study_work">Σπουδάζω & Εργάζομαι</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.what_you_do === 'study' || formData.what_you_do === 'study_work') && (
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
                  <SelectContent>
                    <SelectItem value="pre-uni">Προ-πανεπιστημιακές σπουδές</SelectItem>
                    <SelectItem value="bachelors">Πτυχίο (Bachelor)</SelectItem>
                    <SelectItem value="masters">Μεταπτυχιακό (Masters)</SelectItem>
                    <SelectItem value="phd">Διδακτορικό (PhD)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.study_level && (
                  <p className="text-sm text-red-500">{errors.study_level}</p>
                )}
              </div>
            )}

            {(formData.what_you_do === 'work' || formData.what_you_do === 'study_work') && (
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
                  <SelectContent>
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
                  <p className="text-sm text-red-500">{errors.work_profession}</p>
                )}
              </div>
            )}
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