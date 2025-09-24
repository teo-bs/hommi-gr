import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";
import { TermsPrivacyModal } from "./TermsPrivacyModal";
import { OnboardingChoiceModal } from "@/components/onboarding/OnboardingChoiceModal";
import { useAuth } from "@/hooks/useAuth";

interface AuthFlowManagerProps {
  isAuthOpen: boolean;
  onAuthClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthFlowManager = ({ 
  isAuthOpen, 
  onAuthClose, 
  onAuthSuccess 
}: AuthFlowManagerProps) => {
  const { user, profile, needsTermsAcceptance, acceptTerms } = useAuth();
  const navigate = useNavigate();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [redirectedToProfile, setRedirectedToProfile] = useState(false);

  // Check if we need to show terms modal after successful auth
  useEffect(() => {
    if (user && profile && needsTermsAcceptance()) {
      setShowTermsModal(true);
    }
  }, [user, profile, needsTermsAcceptance]);

  const handleAuthSuccess = () => {
    // Store the callback for after terms are accepted
    setPendingCallback(() => onAuthSuccess || (() => {}));
    
    // Don't close auth modal yet - let the terms flow handle it
    if (user && profile && needsTermsAcceptance()) {
      // Navigate to profile page to show in background during T&Cs
      if (!redirectedToProfile) {
        navigate('/me');
        setRedirectedToProfile(true);
      }
      setShowTermsModal(true);
    } else {
      // No terms needed, proceed normally
      onAuthClose();
      onAuthSuccess?.();
    }
  };

  const handleTermsAccepted = async (marketingOptIn: boolean) => {
    const { error } = await acceptTerms(marketingOptIn);
    
    if (error) {
      console.error('Failed to accept terms:', error);
      return;
    }
    
    // Terms accepted, now show role choice modal
    setShowTermsModal(false);
    setShowChoiceModal(true);
  };

  const handleRoleChoice = (role: 'tenant' | 'lister') => {
    setShowChoiceModal(false);
    onAuthClose();
    
    // Navigate to appropriate onboarding flow
    if (role === 'tenant') {
      navigate('/me?role=tenant&step=1');
    } else {
      // TODO: Implement lister flow in future
      navigate('/me');
    }
    
    // Execute pending callback
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const handleAuthClose = () => {
    // Only allow closing if no modals are pending
    if (!showTermsModal && !showChoiceModal) {
      onAuthClose();
      setPendingCallback(null);
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthOpen && !showTermsModal && !showChoiceModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
      
      <TermsPrivacyModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccepted}
      />

      <OnboardingChoiceModal
        isOpen={showChoiceModal}
        onChoice={handleRoleChoice}
      />
    </>
  );
};