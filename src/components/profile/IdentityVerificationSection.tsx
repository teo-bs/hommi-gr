import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Phone, Shield, XCircle } from "lucide-react";

interface IdentityVerificationSectionProps {
  profile: any;
  verifications: any;
  onVerifyEmail: () => void;
  onVerifyPhone: () => void;
}

export const IdentityVerificationSection = ({ 
  profile, 
  verifications,
  onVerifyEmail,
  onVerifyPhone 
}: IdentityVerificationSectionProps) => {
  const getVerificationStatus = (type: 'email' | 'phone' | 'kyc') => {
    if (type === 'kyc') {
      return profile.kyc_status === 'verified' ? 'verified' : 'unverified';
    }
    return verifications?.[type] ? 'verified' : 'unverified';
  };

  const renderVerificationItem = (
    icon: React.ReactNode,
    title: string,
    status: string,
    description: string,
    onVerify?: () => void
  ) => {
    const isVerified = status === 'verified';
    
    return (
      <div className="flex items-start gap-4 p-4 rounded-lg border bg-surface-elevated">
        <div className="mt-1">{icon}</div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{title}</h4>
            {isVerified ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Επαληθευμένο
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3" />
                Μη επαληθευμένο
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
          {!isVerified && onVerify && (
            <Button variant="outline" size="sm" onClick={onVerify}>
              Επαλήθευση τώρα
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Ταυτότητα & Επαληθεύσεις
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Επαληθεύστε την ταυτότητά σας για να αυξήσετε την εμπιστοσύνη
        </p>
      </div>

      <div className="space-y-3">
        {renderVerificationItem(
          <Shield className="h-5 w-5 text-primary" />,
          'Gov.gr ID',
          getVerificationStatus('kyc'),
          'Επαλήθευση ταυτότητας μέσω Gov.gr Wallet'
        )}

        {renderVerificationItem(
          <Mail className="h-5 w-5 text-primary" />,
          'Email',
          getVerificationStatus('email'),
          profile.email || 'Δεν έχει οριστεί email',
          onVerifyEmail
        )}

        {renderVerificationItem(
          <Phone className="h-5 w-5 text-primary" />,
          'Τηλέφωνο',
          getVerificationStatus('phone'),
          'Επαλήθευση μέσω SMS',
          onVerifyPhone
        )}
      </div>
    </Card>
  );
};
