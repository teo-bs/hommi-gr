import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Shield } from "lucide-react";

interface VerificationBadgesProps {
  verifications: any[];
  className?: string;
}

export const VerificationBadges = ({ verifications, className = "" }: VerificationBadgesProps) => {
  const emailVerified = verifications.find(v => v.kind === 'email' && v.status === 'verified');
  const phoneVerified = verifications.find(v => v.kind === 'phone' && v.status === 'verified');
  const idVerified = verifications.find(v => v.kind === 'govgr' && v.status === 'verified');

  if (!emailVerified && !phoneVerified && !idVerified) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {emailVerified && (
        <Badge variant="secondary" className="text-xs gap-1">
          <Mail className="h-3 w-3" />
          Email
        </Badge>
      )}
      {phoneVerified && (
        <Badge variant="secondary" className="text-xs gap-1">
          <Phone className="h-3 w-3" />
          Τηλέφωνο
        </Badge>
      )}
      {idVerified && (
        <Badge variant="default" className="text-xs gap-1">
          <Shield className="h-3 w-3" />
          Επαληθευμένος
        </Badge>
      )}
    </div>
  );
};

export const calculateTrustScore = (verifications: any[]): number => {
  let score = 0;
  verifications.forEach(v => {
    if (v.status === 'verified') {
      switch(v.kind) {
        case 'email': score += 10; break;
        case 'phone': score += 15; break;
        case 'govgr': score += 25; break;
      }
    }
  });
  return Math.min(score, 50);
};
