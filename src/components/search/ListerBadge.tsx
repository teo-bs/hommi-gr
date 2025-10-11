import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { Badge } from "@/components/ui/badge";
import { useProfileVerification } from "@/hooks/useProfileVerification";
import { CheckCircle2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ListerBadgeProps {
  avatarUrl?: string;
  firstName?: string;
  score?: number;
  verifications?: Record<string, any>;
}

export const ListerBadge = ({ 
  avatarUrl, 
  firstName, 
  score = 0,
  verifications = {}
}: ListerBadgeProps) => {
  const initials = firstName?.charAt(0).toUpperCase() || '?';
  
  // Count verified items
  const verifiedItems = Object.entries(verifications).filter(
    ([_, status]) => status === 'verified' || status === 'approved'
  );

  const { isVerified } = useProfileVerification({
    profileCompletionPct: verifications?.profile_completion_pct,
    verificationsJson: verifications,
  });
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="absolute bottom-3 right-3 cursor-pointer z-10">
          <div className="relative">
            <AvatarWithBadge
              src={avatarUrl}
              alt={firstName}
              fallback={initials}
              showBadge={isVerified}
              className="h-12 w-12 border-2 border-background shadow-lg"
            />
            
            {score > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -bottom-1 -right-1 h-5 px-1.5 text-xs font-semibold bg-blue-500 text-white border-2 border-background"
              >
                <CheckCircle2 className="h-3 w-3 mr-0.5" />
                {score}
              </Badge>
            )}
          </div>
        </div>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-64" side="left">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{firstName || 'Lister'}</h4>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Verifications:</p>
            {verifiedItems.length > 0 ? (
              <ul className="space-y-1">
                {verifiedItems.map(([key, _]) => (
                  <li key={key} className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No verifications yet</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
