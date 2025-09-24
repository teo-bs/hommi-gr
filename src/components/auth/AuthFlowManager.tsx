import { useEffect, useState } from "react";
import { AuthModal } from "./AuthModal";
import { TermsPrivacyModal } from "./TermsPrivacyModal";
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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

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
    
    // Terms accepted, close both modals and proceed
    setShowTermsModal(false);
    onAuthClose();
    
    // Execute pending callback
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const handleAuthClose = () => {
    // Only allow closing if no terms are pending
    if (!showTermsModal) {
      onAuthClose();
      setPendingCallback(null);
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthOpen && !showTermsModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
      
      <TermsPrivacyModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccepted}
      />
    </>
  );
};