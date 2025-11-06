import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuickInfoCard } from "./QuickInfoCard";
import { 
  Briefcase, 
  MapPin, 
  Globe, 
  Calendar, 
  Star, 
  MessageSquare,
  Plus,
  Edit,
  Instagram,
  Linkedin,
  Twitter
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileOverviewTabProps {
  profile: any;
  onEdit: () => void;
}

export const ProfileOverviewTab = ({ profile, onEdit }: ProfileOverviewTabProps) => {
  const [interestsOpen, setInterestsOpen] = useState(true);
  
  const getCountryLabel = (country: string): string => {
    const countries: Record<string, string> = {
      'GR': 'Ελλάδα',
      'CY': 'Κύπρος',
      'US': 'ΗΠΑ',
      'GB': 'Ηνωμένο Βασίλειο',
      'DE': 'Γερμανία',
      'FR': 'Γαλλία',
      'IT': 'Ιταλία',
      'ES': 'Ισπανία',
    };
    return countries[country] || country;
  };

  const getLanguageLabel = (code: string): string => {
    const languages: Record<string, string> = {
      'el': 'Ελληνικά',
      'en': 'Αγγλικά',
      'fr': 'Γαλλικά',
      'de': 'Γερμανικά',
      'it': 'Ιταλικά',
      'es': 'Ισπανία',
    };
    return languages[code] || code;
  };

  const formatMemberSince = () => {
    if (!profile?.member_since) return 'Πρόσφατα';
    const date = new Date(profile.member_since);
    return date.toLocaleDateString('el-GR', { year: 'numeric', month: 'long' });
  };

  const completion = profile.profile_completion_pct || 0;
  const showCompletionCard = completion < 80;

  const socialLinks = [
    { key: 'social_instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { key: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { key: 'social_twitter_x', label: 'Twitter/X', icon: Twitter, color: 'text-sky-600' },
  ].filter(social => profile[social.key]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Completion Card */}
      {showCompletionCard && (
        <Card className="border-primary/20 bg-primary/5 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Ολοκληρώστε το προφίλ σας</h3>
                <Progress value={completion} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {completion}% ολοκληρωμένο
                </p>
              </div>
              <Button size="sm" onClick={onEdit} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Συμπλήρωση
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Me */}
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Σχετικά με εμένα</CardTitle>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {profile.about_me ? (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.about_me}
            </p>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-3">
                Πείτε μας λίγα λόγια για εσάς
              </p>
              <Button variant="outline" size="sm" onClick={onEdit}>
                Προσθήκη βιογραφικού
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.profession && (
          <QuickInfoCard
            icon={Briefcase}
            label="Επάγγελμα"
            value={profile.profession}
            delay={0}
          />
        )}
        
        {profile.country && (
          <QuickInfoCard
            icon={MapPin}
            label="Χώρα"
            value={getCountryLabel(profile.country)}
            delay={100}
          />
        )}

        {profile.languages && profile.languages.length > 0 && (
          <QuickInfoCard
            icon={Globe}
            label="Γλώσσες"
            value={
              <div className="flex flex-wrap gap-1">
                {profile.languages.map((lang: string) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {getLanguageLabel(lang)}
                  </Badge>
                ))}
              </div>
            }
            delay={200}
          />
        )}

        <QuickInfoCard
          icon={Calendar}
          label="Μέλος από"
          value={formatMemberSince()}
          delay={300}
        />

        {socialLinks.length > 0 && (
          <QuickInfoCard
            icon={Star}
            label="Κοινωνικά Δίκτυα"
            value={
              <div className="flex gap-2">
                {socialLinks.map(({ icon: Icon, label, color }) => (
                  <Icon key={label} className={cn("h-5 w-5", color)} />
                ))}
              </div>
            }
            delay={400}
          />
        )}
      </div>

      {/* Interests & Lifestyle */}
      {profile.profile_extras && (
        <Collapsible open={interestsOpen} onOpenChange={setInterestsOpen}>
          <Card className="hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
                <CardTitle className="text-lg">Ενδιαφέροντα & Στυλ Ζωής</CardTitle>
                <div className={cn(
                  "transition-transform duration-200",
                  interestsOpen && "rotate-180"
                )}>
                  ▼
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4 animate-accordion-down">
                {/* Personality */}
                {(profile.profile_extras as any)?.personality?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Προσωπικότητα</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.profile_extras as any).personality.map((item: string) => (
                        <Badge 
                          key={item} 
                          variant="outline" 
                          className="hover:scale-105 hover:shadow-sm transition-all duration-200"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle */}
                {(profile.profile_extras as any)?.lifestyle?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Στυλ ζωής</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.profile_extras as any).lifestyle.map((item: string) => (
                        <Badge 
                          key={item} 
                          variant="outline"
                          className="hover:scale-105 hover:shadow-sm transition-all duration-200"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Music */}
                {(profile.profile_extras as any)?.music?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Μουσική</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.profile_extras as any).music.map((item: string) => (
                        <Badge 
                          key={item} 
                          variant="outline"
                          className="hover:scale-105 hover:shadow-sm transition-all duration-200"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sports */}
                {(profile.profile_extras as any)?.sports?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Σπορ</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.profile_extras as any).sports.map((item: string) => (
                        <Badge 
                          key={item} 
                          variant="outline"
                          className="hover:scale-105 hover:shadow-sm transition-all duration-200"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Movies */}
                {(profile.profile_extras as any)?.movies?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Ταινίες</h4>
                    <div className="flex flex-wrap gap-2">
                      {(profile.profile_extras as any).movies.map((item: string) => (
                        <Badge 
                          key={item} 
                          variant="outline"
                          className="hover:scale-105 hover:shadow-sm transition-all duration-200"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};
