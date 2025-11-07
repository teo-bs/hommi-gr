import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { ResponseTimeBadge } from "@/components/messaging/ResponseTimeBadge";
import { Star, Calendar, Clock, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useProfileVerification } from "@/hooks/useProfileVerification";

interface ListerCardProps {
  lister?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
    member_since?: string;
    last_active?: string;
    kyc_status?: string;
    profession?: string;
    languages?: string[];
    profile_completion_pct?: number;
    verifications_json?: Record<string, any>;
    avg_response_time_minutes?: number;
  };
  verificationBadge?: boolean;
  languages?: string[];
  memberSince?: string;
  lastActive?: string;
  profession?: string;
}

export const ListerCard = ({ 
  lister, 
  verificationBadge, 
  languages, 
  memberSince: propMemberSince, 
  lastActive: propLastActive,
  profession: propProfession 
}: ListerCardProps) => {
  if (!lister) return null;

  const memberSince = propMemberSince || lister.member_since
    ? new Date(propMemberSince || lister.member_since!).getFullYear()
    : new Date().getFullYear();
    
  const lastActive = propLastActive || lister.last_active
    ? formatDistanceToNow(new Date(propLastActive || lister.last_active!), { addSuffix: true })
    : 'recently active';

  const displayLanguages = languages || lister.languages || ['el', 'en'];
  const languageLabels = displayLanguages.map(lang => {
    switch(lang) {
      case 'el': return 'Ελληνικά';
      case 'en': return 'English';
      default: return lang;
    }
  });

  const getLanguageLabel = (code: string): string => {
    const languageMap: Record<string, string> = {
      'el': 'Ελληνικά',
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'es': 'Español',
    };
    return languageMap[code] || code;
  };

  const { isVerified } = useProfileVerification({
    profileCompletionPct: lister.profile_completion_pct,
    verificationsJson: lister.verifications_json,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          <AvatarWithBadge
            src={lister.avatar_url}
            fallback={lister.display_name?.charAt(0)?.toUpperCase() || 'U'}
            verificationsJson={lister.verifications_json}
            className="h-16 w-16"
          />
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {lister.display_name || 'Χρήστης Hommi'}
            </h3>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Badges */}
        <div className="flex flex-col gap-2">
          {verificationBadge && (
            <Badge variant="secondary" className="text-xs w-fit">
              <Star className="h-3 w-3 mr-1" />
              Επαληθευμένο Gov.gr
            </Badge>
          )}
          <ResponseTimeBadge avgResponseTimeMinutes={lister.avg_response_time_minutes} />
        </div>

        {/* Member info */}
        <div className="space-y-2 text-sm">
          {(propMemberSince || lister.member_since) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Μέλος από</span>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{memberSince}</span>
              </div>
            </div>
          )}
          
          {(propLastActive || lister.last_active) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Τελευταία δραστηριότητα</span>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{lastActive}</span>
              </div>
            </div>
          )}
          
          {(propProfession || lister.profession) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Επάγγελμα</span>
              <span>{propProfession || lister.profession}</span>
            </div>
          )}
        </div>

        {/* Languages */}
        {displayLanguages.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Γλώσσες</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {displayLanguages.slice(0, 3).map((lang, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {getLanguageLabel(lang)}
                </Badge>
              ))}
              {displayLanguages.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{displayLanguages.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};