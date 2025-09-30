import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MapPin, Briefcase, Globe } from "lucide-react";
import { TrustScoreWidget } from "./TrustScoreWidget";
import { DataProvenanceLabel } from "./DataProvenanceLabel";

interface ProfileOverviewProps {
  profile: any;
  onEdit: () => void;
}

export const ProfileOverview = ({ profile, onEdit }: ProfileOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Trust Score */}
      <TrustScoreWidget
        profileCompletion={profile.profile_completion_pct || 0}
        kycStatus={profile.kyc_status || 'none'}
        verificationsCount={Object.values(profile.verifications_json || {}).filter(Boolean).length}
        memberSince={profile.member_since}
      />

      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Βασικές Πληροφορίες</h3>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Επεξεργασία
          </Button>
        </div>

        <div className="space-y-4">
          {profile.profession && (
            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{profile.profession}</p>
                <DataProvenanceLabel source="onboarding" date={profile.created_at} />
              </div>
            </div>
          )}

          {profile.country && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{profile.country}</p>
                <DataProvenanceLabel source="manual" />
              </div>
            </div>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: string) => (
                    <Badge key={lang} variant="secondary">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                <DataProvenanceLabel source="onboarding" date={profile.created_at} />
              </div>
            </div>
          )}

          {profile.about_me && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {profile.about_me}
              </p>
              <div className="mt-2">
                <DataProvenanceLabel source="manual" date={profile.updated_at} />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
