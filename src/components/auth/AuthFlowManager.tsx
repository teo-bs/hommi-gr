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
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const handleAuthSuccess = () => {
    // Store the callback for after role choice
    setPendingCallback(() => onAuthSuccess || (() => {}));
    
    // T&C handled globally by GlobalTermsHandler
    // Show role choice modal immediately after successful auth
    if (user && profile) {
      setShowChoiceModal(true);
    } else {
      // No user yet, proceed normally
      onAuthClose();
      onAuthSuccess?.();
    }
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
    if (!showChoiceModal) {
      onAuthClose();
      setPendingCallback(null);
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthOpen && !showChoiceModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />

      <OnboardingChoiceModal
        isOpen={showChoiceModal}
        onChoice={handleRoleChoice}
      />
    </>
  );
};