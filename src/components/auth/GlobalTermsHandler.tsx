import { useEffect, useState } from "react";
import { TermsPrivacyModal } from "./TermsPrivacyModal";
import { useAuth } from "@/hooks/useAuth";

export const GlobalTermsHandler = () => {
  const { user, profile, needsTermsAcceptance, acceptTerms } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasShownForUser, setHasShownForUser] = useState<string | null>(null);

  // Check if we need to show terms modal when user or profile changes
  useEffect(() => {
    if (user && profile && needsTermsAcceptance()) {
      // Only show if we haven't already shown for this user in this session
      // This prevents conflicts with AuthFlowManager during signup flow
      if (hasShownForUser !== user.id) {
        setShowTermsModal(true);
        setHasShownForUser(user.id);
      }
    } else {
      setShowTermsModal(false);
      if (user) {
        setHasShownForUser(user.id);
      }
    }
  }, [user, profile, needsTermsAcceptance, hasShownForUser]);

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