import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    what_you_do: (profile?.profile_extras as any)?.what_you_do || 'study_work',
    study_level: (profile?.profile_extras as any)?.study_level || '',
    work_profession: (profile?.profile_extras as any)?.work_profession || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Επεξεργασία στοιχείων προφίλ
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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