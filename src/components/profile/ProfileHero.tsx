import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarWithBadge } from "@/components/ui/avatar-with-badge";
import { Edit, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeroProps {
  profile: any;
  onEdit: () => void;
}

export const ProfileHero = ({ profile, onEdit }: ProfileHeroProps) => {
  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const formatMemberSince = () => {
    if (!profile?.member_since) return '';
    const date = new Date(profile.member_since);
    return date.toLocaleDateString('el-GR', { year: 'numeric', month: 'long' });
  };

  const getTrustLevel = () => {
    const completion = profile.profile_completion_pct || 0;
    if (completion >= 80) return { label: 'Υψηλή', variant: 'default' as const };
    if (completion >= 50) return { label: 'Μέτρια', variant: 'secondary' as const };
    return { label: 'Χαμηλή', variant: 'outline' as const };
  };

  const trustLevel = getTrustLevel();

  return (
    <div className="relative mb-6 sm:mb-10">
      {/* Gradient Background Header - Reduced Height */}
      <div className="relative h-[100px] sm:h-[140px] md:h-[160px] overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 animate-fade-in">
        {/* Animated gradient overlay - More subtle */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Decorative blobs - More subtle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        
        {/* Edit Button - Top Right (Desktop) */}
        <div className="absolute top-4 right-4 hidden sm:block">
          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
            className="bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-105 transition-all duration-200 shadow-md"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating Avatar & Info */}
      <div className="relative px-4 sm:px-6 -mt-11 sm:-mt-14 md:-mt-16 animate-scale-in" style={{ animationDelay: '100ms' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center sm:flex-row sm:items-end gap-3 sm:gap-5">
            {/* Avatar - Smaller Size */}
            <div className="relative group">
              <AvatarWithBadge
                src={profile.avatar_url}
                fallback={profile.display_name?.charAt(0)?.toUpperCase() || profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                verificationsJson={profile.verifications_json}
                className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 ring-4 ring-background shadow-xl transition-transform duration-300 group-hover:scale-105"
                badgeClassName="h-4 w-4 sm:h-4 sm:w-4"
              />
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center sm:text-left mb-2 sm:mb-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Χρήστης'}
                  {getAge() && <span className="text-muted-foreground">, {getAge()}</span>}
                </h1>
                <Badge variant={trustLevel.variant === 'outline' ? 'secondary' : trustLevel.variant} className="w-fit mx-auto sm:mx-0 text-xs">
                  {trustLevel.label}
                </Badge>
              </div>
              
              {formatMemberSince() && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Μέλος από {formatMemberSince()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button - Mobile (Full Width) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="sm:hidden w-full mt-3 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Edit className="h-4 w-4" />
            Επεξεργασία Προφίλ
          </Button>
        </div>
      </div>
    </div>
  );
};
