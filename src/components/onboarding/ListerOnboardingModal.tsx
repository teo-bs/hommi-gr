import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { OnboardingStepOne } from "./steps/OnboardingStepOne";
import { OnboardingStepTwo } from "./steps/OnboardingStepTwo";
import { ListerStepThree } from "./steps/ListerStepThree";
import { ListerStepFour } from "./steps/ListerStepFour";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface OnboardingData {
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  what_you_do: 'study' | 'work' | 'study_work' | null;
  country: string;
  languages: string[];
  avatar_url?: string;
  photos?: string[];
  profession?: string;
  study_level?: string;
  work_profession?: string;
  about_me?: string;
  social_instagram?: string;
  social_twitter_x?: string;
  social_linkedin?: string;
  personality?: string[];
  lifestyle?: string[];
  music?: string[];
  sports?: string[];
  movies?: string[];
}

interface ListerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ListerOnboardingModal = ({ isOpen, onClose, onComplete }: ListerOnboardingModalProps) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth || null,
    gender: (profile?.gender as OnboardingData['gender']) || null,
    what_you_do: ((profile?.profile_extras as any)?.what_you_do as OnboardingData['what_you_do']) || null,
    country: profile?.country || 'GR',
    languages: profile?.languages || ['el'],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepOneComplete = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    try {
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        avatar_url: data.avatar_url,
      });
      
      toast({
        title: "Αποθηκεύτηκε",
        description: "Τα στοιχεία σας αποθηκεύτηκαν",
      });
    } catch (error) {
      console.error('Error saving step 1:', error);
    }
    
    handleNext();
  };

  const handleStepTwoComplete = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    try {
      await updateProfile({
        country: data.country,
        languages: data.languages,
      });
      
      toast({
        title: "Αποθηκεύτηκε",
        description: "Τα στοιχεία σας αποθηκεύτηκαν",
      });
    } catch (error) {
      console.error('Error saving step 2:', error);
    }
    
    handleNext();
  };

  const handleStepThreeComplete = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    try {
      const profile_extras = {
        ...(profile?.profile_extras as any || {}),
        what_you_do: formData.what_you_do,
        personality: data.personality,
        lifestyle: data.lifestyle,
        music: data.music,
        sports: data.sports,
        movies: data.movies,
        study_level: data.study_level,
        work_profession: data.work_profession,
      };

      const display_name = `${formData.first_name || ''} ${formData.last_name || ''}`.trim();

      const updateData: any = {
        display_name,
        about_me: data.about_me,
        social_instagram: data.social_instagram || null,
        social_twitter_x: data.social_twitter_x || null,
        social_linkedin: data.social_linkedin || null,
        profile_extras
      };

      // Set profession based on what they do
      if (formData.what_you_do === 'study_work') {
        updateData.profession = `${data.work_profession} | Student (${data.study_level})`;
      } else if (formData.what_you_do === 'work') {
        updateData.profession = data.work_profession;
      } else if (formData.what_you_do === 'study') {
        updateData.profession = `Student (${data.study_level})`;
      }

      await updateProfile(updateData);
      
      toast({
        title: "Αποθηκεύτηκε",
        description: "Τα στοιχεία σας αποθηκεύτηκαν",
      });
    } catch (error) {
      console.error('Error saving step 3:', error);
    }
    
    handleNext();
  };

  const handleStepFourComplete = async () => {
    setIsSubmitting(true);
    
    try {
      toast({
        title: "Επιτυχία!",
        description: "Το προφίλ σας ολοκληρώθηκε",
      });
      
      onComplete();
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Βασικές πληροφορίες";
      case 2:
        return "Τοποθεσία και γλώσσες";
      case 3:
        return "Λεπτομέρειες προφίλ";
      case 4:
        return "Ολοκλήρωση";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStepOne
            data={formData}
            onComplete={handleStepOneComplete}
            onBack={onClose}
          />
        );
      case 2:
        return (
          <OnboardingStepTwo
            data={formData}
            onComplete={handleStepTwoComplete}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ListerStepThree
            data={formData}
            onComplete={handleStepThreeComplete}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ListerStepFour
            data={formData}
            onComplete={handleStepFourComplete}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {getStepTitle()}
          </DialogTitle>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Βήμα {currentStep} από 4</span>
              <span>{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="w-full" />
          </div>
        </DialogHeader>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
