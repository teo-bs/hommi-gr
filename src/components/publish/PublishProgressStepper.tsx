import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  key: string;
}

interface PublishProgressStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
}

export default function PublishProgressStepper({ 
  steps, 
  currentStep,
  completedSteps = []
}: PublishProgressStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isFuture = step.id > currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                    isFuture && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{step.id + 1}</span>
                  )}
                </div>
                
                {/* Step Label - Hidden on mobile for space */}
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[80px] hidden md:block",
                    isCurrent && "text-primary",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-[2px] mx-2 transition-all",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Current Step Label on Mobile */}
      <div className="md:hidden text-center mt-4">
        <span className="text-sm font-medium text-primary">
          {steps[currentStep]?.title}
        </span>
      </div>
    </div>
  );
}
