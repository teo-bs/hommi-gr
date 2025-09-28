import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface FormFieldAnimationProps {
  children: ReactNode;
  isValid?: boolean;
  isInvalid?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export const FormFieldAnimation = ({
  children,
  isValid,
  isInvalid,
  isCompleted,
  className
}: FormFieldAnimationProps) => {
  return (
    <div className={cn(
      "relative transition-all duration-300 ease-out",
      isValid && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/20",
      isInvalid && "ring-2 ring-destructive/20 bg-destructive/5 animate-shake",
      "hover:scale-[1.02] focus-within:scale-[1.02]",
      className
    )}>
      {children}
      
      {/* Status indicators */}
      <div className="absolute -right-2 -top-2 flex gap-1">
        {isCompleted && (
          <div className="bg-green-600 text-white rounded-full p-1 animate-scale-in">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        )}
        {isInvalid && (
          <div className="bg-destructive text-destructive-foreground rounded-full p-1 animate-pulse">
            <AlertCircle className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};