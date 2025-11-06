import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ProfileCompletionBanner } from "@/components/onboarding/ProfileCompletionBanner";
import { ProfileCompletionModal } from "@/components/onboarding/ProfileCompletionModal";
import { ProfileEditModal } from "@/components/onboarding/ProfileEditModal";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileOverviewTab } from "@/components/profile/ProfileOverviewTab";
import { ProfileVerificationsTab } from "@/components/profile/ProfileVerificationsTab";
import { ProfileSettingsTab } from "@/components/profile/ProfileSettingsTab";
import { WelcomeTooltip } from "@/components/profile/WelcomeTooltip";
import { useVerifications } from '@/hooks/useVerifications';
import { supabase } from "@/integrations/supabase/client";

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

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { verifications } = useVerifications();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    about_me: profile?.about_me || '',
    profession: profile?.profession || '',
    gender: (profile?.gender as GenderType) || '',
    country: profile?.country || 'GR',
    languages: profile?.languages || ['el'],
    social_instagram: profile?.social_instagram || '',
    social_linkedin: profile?.social_linkedin || '',
    social_twitter_x: profile?.social_twitter_x || '',
    social_tiktok: profile?.social_tiktok || '',
  });

  // Fetch onboarding progress
  useEffect(() => {
    const fetchOnboardingProgress = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'tenant')
        .maybeSingle();
      
      setOnboardingProgress(data);
    };

    fetchOnboardingProgress();
  }, [user]);

  // Check if we should show completion banner
  const shouldShowCompletionBanner = () => {
    if (!profile) return false;
    return profile.role === 'tenant' && (profile.profile_completion_pct || 0) < 80;
  };

  // Calculate missing fields for the banner
  const getMissingFields = () => {
    if (!profile) return [];
    const missing = [];
    
    if (!profile.first_name) missing.push('Όνομα');
    if (!profile.last_name) missing.push('Επώνυμο');
    if (!profile.date_of_birth) missing.push('Ηλικία');
    if (!profile.profession) missing.push('Επάγγελμα');
    if (!profile.country) missing.push('Χώρα');
    
    const whatYouDo = (profile.profile_extras as any)?.what_you_do;
    if (whatYouDo === 'study' || whatYouDo === 'study_work') {
      if (!(profile.profile_extras as any)?.study_level) {
        missing.push('Επίπεδο σπουδών');
      }
    }
    if (whatYouDo === 'work' || whatYouDo === 'study_work') {
      if (!(profile.profile_extras as any)?.work_profession) {
        missing.push('Τομέας εργασίας');
      }
    }
    
    return missing;
  };

  // Auto-show completion modal after onboarding
  useEffect(() => {
    const completedOnboarding = searchParams.get('completed_onboarding');
    if (completedOnboarding === 'true' && profile) {
      setShowCompletionModal(true);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('completed_onboarding');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams, profile]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        about_me: profile.about_me || '',
        profession: profile.profession || '',
        gender: (profile.gender as GenderType) || '',
        country: profile.country || 'GR',
        languages: profile.languages || ['el'],
        social_instagram: profile.social_instagram || '',
        social_linkedin: profile.social_linkedin || '',
        social_twitter_x: profile.social_twitter_x || '',
        social_tiktok: profile.social_tiktok || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const updateData: any = {
      about_me: formData.about_me,
      profession: formData.profession,
      country: formData.country,
      languages: formData.languages,
      social_instagram: formData.social_instagram,
      social_linkedin: formData.social_linkedin,
      social_twitter_x: formData.social_twitter_x,
      social_tiktok: formData.social_tiktok,
    };
    
    if (formData.gender && ['male', 'female', 'other'].includes(formData.gender)) {
      updateData.gender = formData.gender;
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
      title: "Επιτυχία",
      description: "Το προφίλ σας ενημερώθηκε επιτυχώς",
    });
  };

  const handleCancel = () => {
    setFormData({
      about_me: profile?.about_me || '',
      profession: profile?.profession || '',
      gender: (profile?.gender as GenderType) || '',
      country: profile?.country || 'GR',
      languages: profile?.languages || ['el'],
      social_instagram: profile?.social_instagram || '',
      social_linkedin: profile?.social_linkedin || '',
      social_twitter_x: profile?.social_twitter_x || '',
      social_tiktok: profile?.social_tiktok || '',
    });
  };

  const handleFormDataChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Φόρτωση προφίλ...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Tooltip - Shows on first visit */}
      <WelcomeTooltip profileCompletionPct={profile?.profile_completion_pct || 0} />
      
      <div className="min-h-screen bg-muted/30 pb-safe">
        {/* Hero Section */}
        <ProfileHero profile={profile} onEdit={() => setShowEditModal(true)} />

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Completion Banner */}
          {shouldShowCompletionBanner() && (
            <div className="mb-6 animate-fade-in" data-testid="profile-completion-banner">
              <ProfileCompletionBanner
                completionPercent={profile.profile_completion_pct || 0}
                onComplete={() => setShowCompletionModal(true)}
                missingFields={getMissingFields()}
              />
            </div>
          )}

          {/* Tab Navigation */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            {/* Sticky Tab Bar - Enhanced */}
            <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-md border-b mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-lg sm:border animate-fade-in">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0 sm:gap-1">
                <TabsTrigger 
                  value="overview"
                  className="flex-1 sm:flex-initial min-h-[48px] sm:min-h-[44px] px-4 sm:px-6 data-[state=active]:bg-primary/5 data-[state=active]:shadow-sm rounded-none sm:rounded-md border-b-3 sm:border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 font-medium text-sm"
                >
                  Επισκόπηση
                </TabsTrigger>
                <TabsTrigger 
                  value="verifications"
                  className="flex-1 sm:flex-initial min-h-[48px] sm:min-h-[44px] px-4 sm:px-6 data-[state=active]:bg-primary/5 data-[state=active]:shadow-sm rounded-none sm:rounded-md border-b-3 sm:border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 font-medium text-sm"
                >
                  Επαληθεύσεις
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="flex-1 sm:flex-initial min-h-[48px] sm:min-h-[44px] px-4 sm:px-6 data-[state=active]:bg-primary/5 data-[state=active]:shadow-sm rounded-none sm:rounded-md border-b-3 sm:border-b-2 border-transparent data-[state=active]:border-primary transition-all duration-200 font-medium text-sm"
                >
                  Ρυθμίσεις
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <TabsContent value="overview" className="mt-0">
              <ProfileOverviewTab 
                profile={profile} 
                onEdit={() => setShowEditModal(true)}
              />
            </TabsContent>

            <TabsContent value="verifications" className="mt-0">
              <ProfileVerificationsTab 
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <ProfileSettingsTab
                profile={profile}
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isEditing={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <OnboardingModal />
      <ProfileCompletionModal 
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        data-testid="profile-completion-modal"
      />
      <ProfileEditModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        data-testid="profile-edit-modal"
      />
    </>
  );
}
