import { TrustScoreWidget } from "./TrustScoreWidget";
import { VerificationPanel } from "@/components/verification/VerificationPanel";

interface ProfileVerificationsTabProps {
  profile: any;
}

export const ProfileVerificationsTab = ({ 
  profile 
}: ProfileVerificationsTabProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Trust Score Hero */}
      <div className="animate-scale-in">
        <TrustScoreWidget
          profileCompletion={profile.profile_completion_pct || 0}
          kycStatus={profile.kyc_status || 'none'}
          verificationsCount={Object.values(profile.verifications_json || {}).filter(Boolean).length}
          memberSince={profile.member_since}
        />
      </div>

      {/* Verification Panel */}
      <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <VerificationPanel />
      </div>
    </div>
  );
};
