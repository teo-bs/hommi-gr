import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarWithBadgeProps {
  src?: string;
  alt?: string;
  fallback: string;
  showBadge?: boolean;
  verificationsJson?: Record<string, any>;
  className?: string;
  badgeClassName?: string;
}

// Helper to determine verification level
const getVerificationLevel = (verifications?: Record<string, any>): 'none' | 'bronze' | 'silver' | 'gold' => {
  if (!verifications) return 'none';
  
  const emailVerified = verifications.email === 'verified';
  const phoneVerified = verifications.phone === 'verified';
  const govgrVerified = verifications.govgr === 'verified';
  
  // Gold: All three verified
  if (emailVerified && phoneVerified && govgrVerified) return 'gold';
  
  // Silver: Email + Phone
  if (emailVerified && phoneVerified) return 'silver';
  
  // Bronze: Any one verified
  if (emailVerified || phoneVerified || govgrVerified) return 'bronze';
  
  return 'none';
};

export const AvatarWithBadge = ({ 
  src, 
  alt, 
  fallback, 
  showBadge = false,
  verificationsJson,
  className,
  badgeClassName
}: AvatarWithBadgeProps) => {
  const level = getVerificationLevel(verificationsJson);
  const shouldShowBadge = showBadge || level !== 'none';
  
  // Badge colors based on verification level
  const badgeColors = {
    none: 'bg-muted',
    bronze: 'bg-orange-500',
    silver: 'bg-slate-400',
    gold: 'bg-yellow-500'
  };
  
  return (
    <div className="relative inline-block">
      <Avatar className={className}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {shouldShowBadge && level !== 'none' && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full p-0.5 border-2 border-background shadow-sm",
          badgeColors[level],
          badgeClassName
        )}>
          <ShieldCheck className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};
