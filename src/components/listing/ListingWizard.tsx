import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { StepOne } from "./wizard/StepOne";
import { StepTwo } from "./wizard/StepTwo";
import { StepThree } from "./wizard/StepThree";
import PublishStepZero from "@/components/publish/PublishStepZero";
import { useToast } from "@/hooks/use-toast";

export interface ListingDraft {
  // Step 1 - Required
  title: string;
  city: string;
  neighborhood: string;
  price_month: number | null;
  photos: string[];
  
  // Step 2 - Optional
  description?: string;
  room_type?: string;
  room_size_m2?: number | null;
  has_bed?: boolean;
  is_interior?: boolean;
  flatmates_count?: number | null;
  couples_accepted?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  availability_date?: string;
  amenities_property?: string[];
  amenities_room?: string[];
  bills_note?: string;
  
  // Meta
  role?: 'individual' | 'agency';
  step?: number;
  completed?: boolean;
}

interface ListingWizardProps {
  role: 'individual' | 'agency';
  initialDraft?: ListingDraft;
  onSave: (draft: ListingDraft) => void;
  onPublish: (listing: ListingDraft) => void;
  onRoleChange: () => void;
  onBack: () => void;
}

export const ListingWizard = ({ role, initialDraft, onSave, onPublish, onRoleChange, onBack }: ListingWizardProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(initialDraft?.step || 0); // Start from step 0 for role selection
  const [selectedRole, setSelectedRole] = useState<'individual' | 'agency'>(role);
  const [draft, setDraft] = useState<ListingDraft>({
    title: '',
    city: '',
    neighborhood: '',
    price_month: null,
    photos: [],
    role: selectedRole,
    step: 0,
    ...initialDraft
  });

  const steps = [
    { id: 0, title: 'Role', description: 'Individual or Agency' },
    { id: 1, title: 'Basics', description: 'Title, location & price' },
    { id: 2, title: 'Details', description: 'Property & amenities' },
    { id: 3, title: 'Review', description: 'Preview & publish' }
  ];

  // Auto-save draft whenever it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedDraft = { ...draft, step: currentStep };
      onSave(updatedDraft);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [draft, currentStep, onSave]);

  const validateStep1 = (): boolean => {
    return !!(
      draft.title &&
      draft.city &&
      draft.neighborhood &&
      draft.price_month &&
      draft.price_month > 0 &&
      draft.photos.length > 0
    );
  };

  const canProceedFromStep1 = validateStep1();
  const canPublish = validateStep1(); // Only Step 1 is required

  const updateDraft = (updates: Partial<ListingDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const handleRoleSelection = (newRole: 'individual' | 'agency') => {
    setSelectedRole(newRole);
    setDraft(prev => ({ ...prev, role: newRole }));
    setCurrentStep(1); // Move to basics after role selection
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedFromStep1) {
      toast({
        title: "Πληροφορίες απαιτούνται",
        description: "Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = () => {
    if (!canPublish) {
      toast({
        title: "Δεν μπορεί να δημοσιευτεί",
        description: "Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία από το Βήμα 1",
        variant: "destructive",
      });
      return;
    }

    onPublish({ ...draft, completed: true });
  };

  const handleSkipToReview = () => {
    if (canProceedFromStep1) {
      setCurrentStep(3);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="max-w-2xl mx-auto">
            <PublishStepZero onRoleSelected={handleRoleSelection} />
          </div>
        );
      case 1:
        return (
          <StepOne
            draft={draft}
            onChange={updateDraft}
            role={selectedRole}
          />
        );
      case 2:
        return (
          <StepTwo
            draft={draft}
            onChange={updateDraft}
            role={selectedRole}
          />
        );
      case 3:
        return (
          <StepThree
            draft={draft}
            role={selectedRole}
            canPublish={canPublish}
            onPublish={handlePublish}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Create {currentStep === 0 ? 'Listing' : (selectedRole === 'individual' ? 'Individual' : 'Agency') + ' Listing'}
          </h1>
          <p className="text-muted-foreground">
            Step {currentStep} of {steps.length - 1}: {steps[currentStep].title}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {currentStep > 0 ? (
            <Button variant="ghost" size="sm" onClick={onRoleChange}>
              Change Role
            </Button>
          ) : null}
        </div>
      </div>

      {/* Progress */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step.id 
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="hidden sm:block">
                <div className={`font-medium text-sm ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-border mx-2" />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Step Content */}
      <div className="mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 1 && canProceedFromStep1 && (
              <Button variant="outline" onClick={handleSkipToReview}>
                Skip to Review
              </Button>
            )}
            
            {currentStep === 2 && (
              <Button variant="outline" onClick={handleSkipToReview}>
                Skip Details
              </Button>
            )}

            {currentStep === 0 ? (
              <div className="text-sm text-muted-foreground">
                Please select your role to continue
              </div>
            ) : currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={currentStep === 1 && !canProceedFromStep1}
                variant="hero"
              >
                Save & Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handlePublish}
                disabled={!canPublish}
                variant="hero"
                size="lg"
              >
                Publish Listing
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};