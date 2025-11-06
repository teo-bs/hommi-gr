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
    <div className="relative mb-8 sm:mb-12">
      {/* Gradient Background Header */}
      <div className="relative h-[120px] sm:h-[140px] md:h-[180px] overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 animate-fade-in">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-accent/30 animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
      </div>

      {/* Floating Avatar & Info */}
      <div className="relative px-4 sm:px-6 -mt-12 sm:-mt-16 md:-mt-20 animate-scale-in" style={{ animationDelay: '100ms' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <AvatarWithBadge
                src={profile.avatar_url}
                fallback={profile.display_name?.charAt(0)?.toUpperCase() || profile.first_name?.charAt(0)?.toUpperCase() || 'U'}
                verificationsJson={profile.verifications_json}
                className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 ring-4 ring-background shadow-xl transition-transform duration-300 group-hover:scale-105"
                badgeClassName="h-4 w-4 sm:h-5 sm:w-5"
              />
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center sm:text-left mb-2 sm:mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Χρήστης'}
                  {getAge() && <span className="text-muted-foreground">, {getAge()}</span>}
                </h1>
                <Badge variant={trustLevel.variant} className="w-fit mx-auto sm:mx-0">
                  Εμπιστοσύνη: {trustLevel.label}
                </Badge>
              </div>
              
              {formatMemberSince() && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Μέλος από {formatMemberSince()}</span>
                </div>
              )}
            </div>

            {/* Edit Button - Desktop */}
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="hidden sm:flex items-center gap-2 mb-4 hover:scale-105 transition-transform duration-200"
            >
              <Edit className="h-4 w-4" />
              Επεξεργασία
            </Button>
          </div>

          {/* Edit Button - Mobile (Full Width) */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="sm:hidden w-full mt-4 flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Επεξεργασία Προφίλ
          </Button>
        </div>
      </div>
    </div>
  );
};
