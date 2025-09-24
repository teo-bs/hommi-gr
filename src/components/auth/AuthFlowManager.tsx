import { useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";
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
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    // Close auth modal and call success callback
    onAuthClose();
    onAuthSuccess?.();
    // Note: Navigation is now handled by the caller (e.g., useListingFlow)
  };

  const handleAuthClose = () => {
    onAuthClose();
  };

  return (
    <AuthModal
      isOpen={isAuthOpen}
      onClose={handleAuthClose}
      onSuccess={handleAuthSuccess}
    />
  );
};