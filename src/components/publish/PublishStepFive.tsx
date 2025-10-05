import React, { useState, useMemo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Users, GraduationCap, Briefcase } from "lucide-react";

interface ListingDraft {
  preferred_gender?: string[];
  preferred_age_min?: number;
  preferred_age_max?: number;
  preferred_situation?: string[];
  [key: string]: any;
}

interface PublishStepFiveProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onPublish: () => void;
  onPrev: () => void;
  isPublishing?: boolean;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Άνδρας' },
  { value: 'female', label: 'Γυναίκα' },
  { value: 'non-binary', label: 'Μη-δυαδικό' },
  { value: 'any', label: 'Οποιοδήποτε' }
];

const SITUATION_OPTIONS = [
  { value: 'studies', label: 'Σπουδάζει', icon: GraduationCap },
  { value: 'works', label: 'Εργάζεται', icon: Briefcase },
  { value: 'studies_works', label: 'Σπουδάζει & Εργάζεται', icon: Users }
];

export default function PublishStepFive({ 
  draft, 
  onUpdate, 
  onPublish, 
  onPrev,
  isPublishing = false
}: PublishStepFiveProps) {
  // Local state for batching badge selections
  const [localGender, setLocalGender] = useState(draft.preferred_gender || []);
  const [localSituation, setLocalSituation] = useState(draft.preferred_situation || []);
  
  const toggleGender = (gender: string) => {
    let updated;
    
    if (gender === 'any') {
      updated = localGender.includes('any') ? [] : ['any'];
    } else {
      updated = localGender.includes(gender)
        ? localGender.filter(g => g !== gender)
        : [...localGender.filter(g => g !== 'any'), gender];
    }
    
    setLocalGender(updated);
  };

  const toggleSituation = (situation: string) => {
    const updated = localSituation.includes(situation)
      ? localSituation.filter(s => s !== situation)
      : [...localSituation, situation];
    setLocalSituation(updated);
  };

  // Debounced age slider update
  const debouncedAgeUpdate = useDebouncedCallback((values: number[]) => {
    onUpdate({ 
      preferred_age_min: values[0],
      preferred_age_max: values[1]
    });
  }, 300);

  const handleAgeChange = (values: number[]) => {
    debouncedAgeUpdate(values);
  };

  const handlePublish = () => {
    // Commit local badge selections before publishing
    onUpdate({
      preferred_gender: localGender,
      preferred_situation: localSituation
    });
    onPublish();
  };

  // Roommate preferences are optional - user can publish without them
  const isValid = true;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Προτιμήσεις συγκατοίκων</h2>
        <p className="text-muted-foreground">
          Καθορίστε τις προτιμήσεις σας για τους μελλοντικούς συγκατοίκους
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Φύλο</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {GENDER_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <Badge
                      variant={localGender.includes(option.value) ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => toggleGender(option.value)}
                    >
                      {option.label}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Επιλέξτε ένα ή περισσότερα. Το "Οποιοδήποτε" ακυρώνει τις άλλες επιλογές.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ηλικιακό εύρος</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="px-3">
                  <Slider
                    value={[draft.preferred_age_min || 18, draft.preferred_age_max || 35]}
                    onValueChange={handleAgeChange}
                    min={18}
                    max={65}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>18 ετών</span>
                  <span>65 ετών</span>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {draft.preferred_age_min || 18} - {draft.preferred_age_max || 35} ετών
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Κατάσταση</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {SITUATION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = localSituation.includes(option.value);
                  
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleSituation(option.value)}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={isSelected ? 'font-medium' : ''}>{option.label}</span>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Επιλέξτε μία ή περισσότερες καταστάσεις που προτιμάτε.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Σύνοψη προτιμήσεων</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Φύλο:</p>
                  <p className="text-sm text-muted-foreground">
                    {localGender.length > 0
                      ? GENDER_OPTIONS
                          .filter(opt => localGender.includes(opt.value))
                          .map(opt => opt.label)
                          .join(', ')
                      : 'Δεν έχει καθοριστεί'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Ηλικία:</p>
                  <p className="text-sm text-muted-foreground">
                    {draft.preferred_age_min || 18} - {draft.preferred_age_max || 35} ετών
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Κατάσταση:</p>
                  <p className="text-sm text-muted-foreground">
                    {localSituation.length > 0
                      ? SITUATION_OPTIONS
                          .filter(opt => localSituation.includes(opt.value))
                          .map(opt => opt.label)
                          .join(', ')
                      : 'Δεν έχει καθοριστεί'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="font-medium">🎉 Σχεδόν τελειώσατε!</p>
            <p className="text-sm text-muted-foreground">
              Η αγγελία σας είναι έτοιμη για δημοσίευση. Μετά τη δημοσίευση θα εμφανιστεί 
              στα αποτελέσματα αναζήτησης και θα μπορείτε να δέχεστε αιτήματα επικοινωνίας.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button 
          onClick={handlePublish} 
          disabled={isPublishing}
          size="lg"
        >
          {isPublishing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Δημοσίευση...
            </>
          ) : (
            <>🚀 Δημοσίευση αγγελίας</>
          )}
        </Button>
      </div>
    </div>
  );
}