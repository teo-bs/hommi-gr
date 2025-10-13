import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2 } from "lucide-react";
import type { OnboardingData } from "../ListerOnboardingModal";
import { StepTransition } from "@/components/ui/step-transition";

interface ListerStepFourProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const getGenderLabel = (gender: string | null) => {
  switch (gender) {
    case 'male': return 'Άνδρας';
    case 'female': return 'Γυναίκα';
    case 'other': return 'Non-binary';
    default: return '';
  }
};

const getWhatYouDoLabel = (what_you_do: string | null) => {
  switch (what_you_do) {
    case 'study': return 'Σπουδάζω';
    case 'work': return 'Εργάζομαι';
    case 'study_work': return 'Σπουδάζω & Εργάζομαι';
    default: return '';
  }
};

const getCountryLabel = (code: string) => {
  const countries: Record<string, string> = {
    'GR': 'Ελλάδα',
    'CY': 'Κύπρος',
    'US': 'Η.Π.Α.',
    'GB': 'Ηνωμένο Βασίλειο',
    'DE': 'Γερμανία',
    'FR': 'Γαλλία',
    'IT': 'Ιταλία',
    'ES': 'Ισπανία',
  };
  return countries[code] || code;
};

const getLanguageLabel = (code: string) => {
  const languages: Record<string, string> = {
    'el': 'Ελληνικά',
    'en': 'Αγγλικά',
    'fr': 'Γαλλικά',
    'de': 'Γερμανικά',
    'es': 'Ισπανικά',
    'it': 'Ιταλικά',
    'ru': 'Ρωσικά',
    'ar': 'Αραβικά',
    'zh': 'Κινεζικά',
    'ja': 'Ιαπωνικά',
  };
  return languages[code] || code;
};

export const ListerStepFour = ({ data, onComplete, onBack, isSubmitting }: ListerStepFourProps) => {
  return (
    <StepTransition isVisible={true} direction="forward">
      <div className="space-y-6">
        {/* Success message */}
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="h-6 w-6" />
          <p className="text-lg font-medium">Το προφίλ σας είναι έτοιμο!</p>
        </div>

        {/* Profile preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Προεπισκόπηση προφίλ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={data.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {data.first_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">
                  {data.first_name} {data.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getWhatYouDoLabel(data.what_you_do)}
                </p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Φύλο</p>
                <p className="font-medium">{getGenderLabel(data.gender)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ημερομηνία γέννησης</p>
                <p className="font-medium">
                  {data.date_of_birth
                    ? new Date(data.date_of_birth).toLocaleDateString('el-GR')
                    : '-'}
                </p>
              </div>
            </div>

            {/* Details */}
            {(data.study_level || data.work_profession) && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Λεπτομέρειες</p>
                <div className="space-y-1 text-sm">
                  {data.study_level && (
                    <p>Σπουδές: {data.study_level}</p>
                  )}
                  {data.work_profession && (
                    <p>Επάγγελμα: {data.work_profession}</p>
                  )}
                </div>
              </div>
            )}

            {/* Country & Languages */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Τοποθεσία & Γλώσσες</p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Χώρα:</span> {getCountryLabel(data.country)}
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {getLanguageLabel(lang)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Interests */}
            {(data.personality?.length || data.lifestyle?.length || data.music?.length) && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Ενδιαφέροντα</p>
                <div className="space-y-2">
                  {data.personality?.length && (
                    <div className="flex flex-wrap gap-1">
                      {data.personality.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {data.lifestyle?.length && (
                    <div className="flex flex-wrap gap-1">
                      {data.lifestyle.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About me */}
            {data.about_me && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Για εμένα</p>
                <p className="text-sm">{data.about_me}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-11">
            Πίσω
          </Button>
          <Button onClick={onComplete} disabled={isSubmitting} className="h-11">
            {isSubmitting ? "Ολοκλήρωση..." : "Ολοκλήρωση & Συνέχεια"}
          </Button>
        </div>
      </div>
    </StepTransition>
  );
};
