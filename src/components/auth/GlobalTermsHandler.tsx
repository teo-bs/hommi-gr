import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TermsPrivacyModal } from "./TermsPrivacyModal";
import { OnboardingChoiceModal } from "@/components/onboarding/OnboardingChoiceModal";
import { IndividualAgencyModal } from "./IndividualAgencyModal";
import { useAuth } from "@/hooks/useAuth";

export const GlobalTermsHandler = () => {
  const { user, profile, needsTermsAcceptance, acceptTerms } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showIndividualAgencyModal, setShowIndividualAgencyModal] = useState(false);
  
  const hasListingIntent = searchParams.get('intent') === 'listing';

  // Show T&C modal immediately after first signup, only once
  useEffect(() => {
    console.log('GlobalTermsHandler: Checking terms acceptance', { 
      user: !!user, 
      profile: !!profile, 
      needsTerms: user && profile && needsTermsAcceptance() 
    });
    
    if (user && profile && needsTermsAcceptance()) {
      console.log('GlobalTermsHandler: Showing terms modal');
      setShowTermsModal(true);
    } else {
      setShowTermsModal(false);
    }
  }, [user, profile, needsTermsAcceptance]);

  const handleTermsAccepted = async (marketingOptIn: boolean) => {
    console.log('GlobalTermsHandler: Terms accepted', { marketingOptIn });
    const { error } = await acceptTerms(marketingOptIn);
    
    if (error) {
      console.error('Failed to accept terms:', error);
      return;
    }
    
    console.log('GlobalTermsHandler: Terms accepted successfully');
    setShowTermsModal(false);
    
    // Check if user has listing intent - skip generic choice and go to individual/agency
    if (hasListingIntent) {
      console.log('GlobalTermsHandler: Has listing intent, showing individual/agency modal');
      setShowIndividualAgencyModal(true);
    } else {
      console.log('GlobalTermsHandler: No listing intent, showing role choice modal');
      setShowChoiceModal(true);
    }
  };

  const handleRoleChoice = (role: 'tenant' | 'lister') => {
    setShowChoiceModal(false);
    
    if (role === 'tenant') {
      // Navigate to profile with onboarding parameters
      navigate('/me?role=tenant&step=1');
    } else {
      // Show individual vs agency choice for listers
      setShowIndividualAgencyModal(true);
    }
  };

  const handleIndividualAgencyChoice = (choice: 'individual' | 'agency') => {
    setShowIndividualAgencyModal(false);
    
    // Clear the intent parameter from URL
    if (hasListingIntent) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('intent');
        return newParams;
      });
    }
    
    if (choice === 'individual') {
      // Start listing wizard flow
      navigate('/publish');
    } else {
      // Navigate to agencies page
      navigate('/agencies');
    }
  };

  return (
    <>
      <TermsPrivacyModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccepted}
      />

      <OnboardingChoiceModal
        isOpen={showChoiceModal}
        onChoice={handleRoleChoice}
      />

      <IndividualAgencyModal
        isOpen={showIndividualAgencyModal}
        onChoice={handleIndividualAgencyChoice}
      />
    </>
  );
};