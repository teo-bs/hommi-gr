import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  completedSteps?: number[];
  className?: string;
}

export const AnimatedProgress = ({
  currentStep,
  totalSteps,
  stepTitles,
  completedSteps = [],
  className
}: AnimatedProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      <div className="relative">
        <Progress 
          value={progress} 
          className="h-2 transition-all duration-500 ease-out" 
        />
        <div className="absolute -top-1 left-0 w-full">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "absolute w-4 h-4 rounded-full border-2 transition-all duration-300",
                "flex items-center justify-center",
                index <= currentStep 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "bg-background border-muted-foreground/30",
                completedSteps.includes(index) && "bg-green-600 border-green-600"
              )}
              style={{ left: `${(index / (totalSteps - 1)) * 100}%`, transform: 'translateX(-50%)' }}
            >
              {completedSteps.includes(index) ? (
                <CheckCircle2 className="w-3 h-3 text-white animate-scale-in" />
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step info */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground animate-fade-in">
            {stepTitles[currentStep]}
          </h3>
          <p className="text-sm text-muted-foreground">
            Βήμα {currentStep + 1} από {totalSteps}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          {Math.round(progress)}% ολοκληρωμένο
        </div>
      </div>
    </div>
  );
};