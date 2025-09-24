import { useEffect, useState } from "react";
import { TermsPrivacyModal } from "./TermsPrivacyModal";
import { useAuth } from "@/hooks/useAuth";

export const GlobalTermsHandler = () => {
  const { user, profile, needsTermsAcceptance, acceptTerms } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Show T&C modal immediately after first signup, only once
  useEffect(() => {
    if (user && profile && needsTermsAcceptance()) {
      setShowTermsModal(true);
    } else {
      setShowTermsModal(false);
    }
  }, [user, profile, needsTermsAcceptance]);

  const handleTermsAccepted = async (marketingOptIn: boolean) => {
    const { error } = await acceptTerms(marketingOptIn);
    
    if (error) {
      console.error('Failed to accept terms:', error);
      return;
    }
    
    setShowTermsModal(false);
  };

  return (
    <TermsPrivacyModal
      isOpen={showTermsModal}
      onAccept={handleTermsAccepted}
    />
  );
};