import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Calendar, Clock, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ListerCardProps {
  profile: {
    id?: string;
    display_name?: string;
    avatar_url?: string;
    member_since?: string;
    last_active?: string;
    profession?: string;
    languages?: string[];
  } | null;
  listingId?: string;
}

export const ListerCard = ({ profile, listingId }: ListerCardProps) => {
  if (!profile) return null;

  const memberSince = profile.member_since 
    ? new Date(profile.member_since).getFullYear()
    : new Date().getFullYear();
    
  const lastActive = profile.last_active 
    ? formatDistanceToNow(new Date(profile.last_active), { addSuffix: true })
    : 'recently active';

  const languages = profile.languages || ['el', 'en'];
  const languageLabels = languages.map(lang => {
    switch(lang) {
      case 'el': return 'Ελληνικά';
      case 'en': return 'English';
      default: return lang;
    }
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {profile.display_name || 'Hommi User'}
            </h3>
            
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium">4.8</span>
              <span className="text-sm text-muted-foreground">(24 reviews)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Verified ID
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Superhost
          </Badge>
        </div>

        {/* Member info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Member since</span>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{memberSince}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last active</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{lastActive}</span>
            </div>
          </div>
          
          {profile.profession && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profession</span>
              <span>{profile.profession}</span>
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Languages</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {languageLabels.map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};