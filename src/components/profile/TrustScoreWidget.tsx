import { CheckCircle2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface TrustScoreWidgetProps {
  profileCompletion: number;
  kycStatus: string;
  verificationsCount: number;
  memberSince?: string;
}

export const TrustScoreWidget = ({ 
  profileCompletion, 
  kycStatus, 
  verificationsCount,
  memberSince 
}: TrustScoreWidgetProps) => {
  // Calculate trust score (0-100)
  const trustScore = Math.round(
    (profileCompletion * 0.4) + 
    (kycStatus === 'verified' ? 30 : 0) +
    (Math.min(verificationsCount * 10, 30))
  );

  const getTrustLevel = (score: number) => {
    if (score >= 80) return { label: 'Υψηλή Εμπιστοσύνη', variant: 'default' as const };
    if (score >= 50) return { label: 'Μέτρια Εμπιστοσύνη', variant: 'secondary' as const };
    return { label: 'Χαμηλή Εμπιστοσύνη', variant: 'outline' as const };
  };

  const trustLevel = getTrustLevel(trustScore);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Βαθμός Εμπιστοσύνης
          </h3>
          {memberSince && (
            <p className="text-xs text-muted-foreground mt-1">
              Μέλος από {new Date(memberSince).toLocaleDateString('el-GR', { year: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
        <Badge variant={trustLevel.variant}>{trustLevel.label}</Badge>
      </div>

      <div className="space-y-4">
        {/* Trust Score Circle */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - trustScore / 100)}`}
                className="text-primary transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{trustScore}</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ολοκλήρωση προφίλ</span>
            <span className="font-medium">{profileCompletion}%</span>
          </div>
          <Progress value={profileCompletion} className="h-2" />

          <div className="flex items-center justify-between text-sm pt-2">
            <span className="text-muted-foreground">Επαληθεύσεις</span>
            <span className="flex items-center gap-1">
              {kycStatus === 'verified' && (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium">{verificationsCount} ενεργές</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
