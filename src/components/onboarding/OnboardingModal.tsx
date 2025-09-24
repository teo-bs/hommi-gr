import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingStepOne } from "./steps/OnboardingStepOne";
import { OnboardingStepTwo } from "./steps/OnboardingStepTwo";
import { OnboardingStepThree } from "./steps/OnboardingStepThree";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export interface OnboardingData {
  display_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
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
    display_name: profile?.display_name || '',
    date_of_birth: profile?.date_of_birth || null,
    gender: profile?.gender || null,
    what_you_do: null,
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

  const handleStepOneComplete = (data: Partial<OnboardingData>) => {
    setFormData({ ...formData, ...data });
    updateOnboardingProgress(1);
    handleNext();
  };

  const handleStepTwoComplete = (data: Partial<OnboardingData>) => {
    setFormData({ ...formData, ...data });
    updateOnboardingProgress(2);
    handleNext();
  };

  const handleStepThreeComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Update profile with all collected data
      const { error } = await updateProfile({
        display_name: formData.display_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        country: formData.country,
        languages: formData.languages,
        avatar_url: formData.avatar_url,
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
      
      // Close modal automatically
      navigate('/me');
      
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
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {getStepTitle()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
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