import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import type { OnboardingData } from "../OnboardingModal";
import { StepTransition } from "@/components/ui/step-transition";

interface OnboardingStepFourProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const OnboardingStepFour = ({ data, onComplete, onBack, isSubmitting }: OnboardingStepFourProps) => {
  const getGenderLabel = (gender: OnboardingData['gender']) => {
    switch (gender) {
      case 'male':
        return 'Άνδρας';
      case 'female':
        return 'Γυναίκα';
      case 'other':
        return 'Non-binary';
      default:
        return '-';
    }
  };

  const getWhatYouDoLabel = (whatYouDo: OnboardingData['what_you_do']) => {
    switch (whatYouDo) {
      case 'study':
        return 'Σπουδάζω';
      case 'work':
        return 'Εργάζομαι';
      case 'study_work':
        return 'Σπουδάζω & Εργάζομαι';
      default:
        return '-';
    }
  };

  const getCountryLabel = (country: string) => {
    const countries: Record<string, string> = {
      'GR': 'Ελλάδα',
      'CY': 'Κύπρος',
      'US': 'Η.Π.Α.',
      'GB': 'Ηνωμένο Βασίλειο',
      'DE': 'Γερμανία',
      'FR': 'Γαλλία',
    };
    return countries[country] || country;
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

  return (
    <StepTransition isVisible={true} direction="forward">
      <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Σχεδόν τελειώσαμε!</h2>
        <p className="text-muted-foreground">
          Ελέγξτε τα στοιχεία σας και πατήστε "Ολοκλήρωση" για να αποθηκευτούν
        </p>
      </div>

      {/* Profile Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Προεπισκόπηση προφίλ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Image and Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={data.avatar_url} />
              <AvatarFallback className="text-lg">
                {data.first_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{data.first_name} {data.last_name}</h3>
              <p className="text-muted-foreground">{getGenderLabel(data.gender)}</p>
              {data.date_of_birth && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(data.date_of_birth), 'dd MMMM yyyy', { locale: el })}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Τι κάνετε</p>
              <p className="text-sm">{getWhatYouDoLabel(data.what_you_do)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Χώρα κατοικίας</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <p className="text-sm">{getCountryLabel(data.country)}</p>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Γλώσσες</p>
            <div className="flex flex-wrap gap-1">
              {data.languages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {getLanguageLabel(lang)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Τι ακολουθεί;</h4>
              <p className="text-sm text-muted-foreground">
                Μετά την αποθήκευση, θα μπορείτε να προσθέσετε περισσότερες λεπτομέρειες στο προφίλ σας 
                για να βρείτε καλύτερα matches και να γίνετε πιο ελκυστικός σε άλλους χρήστες.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="h-11">
          Πίσω
        </Button>
        <Button onClick={onComplete} disabled={isSubmitting} className="h-11">
          {isSubmitting ? 'Αποθήκευση...' : 'Ολοκλήρωση'}
        </Button>
      </div>
    </div>
    </StepTransition>
  );
};
