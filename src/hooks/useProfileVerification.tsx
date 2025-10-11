import { useMemo } from 'react';

interface ProfileVerificationProps {
  profileCompletionPct?: number;
  verificationsJson?: Record<string, any>;
}

export const useProfileVerification = ({ 
  profileCompletionPct, 
  verificationsJson 
}: ProfileVerificationProps) => {
  const isVerified = useMemo(() => {
    // User is verified if:
    // 1. Profile is 100% complete
    // 2. Phone is verified
    const isProfileComplete = profileCompletionPct === 100;
    const isPhoneVerified = verificationsJson?.phone === 'verified' || verificationsJson?.phone === true;
    
    return isProfileComplete && isPhoneVerified;
  }, [profileCompletionPct, verificationsJson]);

  return { isVerified };
};
