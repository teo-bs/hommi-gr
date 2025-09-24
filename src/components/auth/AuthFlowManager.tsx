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
    // Close auth modal and navigate to profile
    onAuthClose();
    onAuthSuccess?.();
    
    // Navigate to profile page - GlobalTermsHandler will handle T&C and role choice
    navigate('/me');
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