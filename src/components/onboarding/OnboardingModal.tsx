import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { OnboardingStepOne } from "./steps/OnboardingStepOne";
import { OnboardingStepTwo } from "./steps/OnboardingStepTwo";
import { OnboardingStepThree } from "./steps/OnboardingStepThree";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
}

export const OnboardingModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const role = searchParams.get('role');
  const currentStep = parseInt(searchParams.get('step') || '1');
  const isOpen = role === 'tenant' && currentStep >= 1 && currentStep <= 3;
  
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

  // Update onboarding progress
  const updateOnboardingProgress = async (step: number, completed: boolean = false) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('onboarding_progress')
      .upsert({
        user_id: user.id,
        role: 'tenant',
        current_step: completed ? 4 : step,
        completed_steps: completed ? [1, 2, 3] : Array.from({ length: step }, (_, i) => i + 1),
      });
    
    if (error) {
      console.error('Failed to update onboarding progress:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setSearchParams({ role: 'tenant', step: (currentStep + 1).toString() });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSearchParams({ role: 'tenant', step: (currentStep - 1).toString() });
    }
  };

  const handleClose = () => {
    navigate('/me');
  };

  const handleStepOneComplete = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    // Save Step 1 data immediately
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
    
    updateOnboardingProgress(1);
    handleNext();
  };

  const handleStepTwoComplete = async (data: Partial<OnboardingData>) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    
    // Save Step 2 data immediately
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
    
    updateOnboardingProgress(2);
    handleNext();
  };

  const handleStepThreeComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Store what_you_do in profile_extras for conditional modal later
      const profile_extras = {
        ...(profile?.profile_extras as any || {}),
        what_you_do: formData.what_you_do
      };

      // Update profile with all collected data
      const { error } = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        country: formData.country,
        languages: formData.languages,
        avatar_url: formData.avatar_url,
        profile_extras
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η αποθήκευση των στοιχείων",
          variant: "destructive",
        });
        return;
      }

      // Mark onboarding as completed for steps 1-3
      await updateOnboardingProgress(3, true);
      
      toast({
        title: "Επιτυχία!",
        description: "Τα βασικά στοιχεία του προφίλ σας αποθηκεύτηκαν",
      });
      
      // Navigate to profile with completion flag
      navigate('/me?completed_onboarding=true');
      
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
            onBack={handleClose}
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
          <OnboardingStepThree
            data={formData}
            onComplete={handleStepThreeComplete}
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
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {getStepTitle()}
          </DialogTitle>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Βήμα {currentStep} από 3</span>
              <span>{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <Progress value={(currentStep / 3) * 100} className="w-full" />
          </div>
        </DialogHeader>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};