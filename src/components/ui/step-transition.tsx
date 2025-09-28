import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  direction?: 'forward' | 'backward' | 'none';
  className?: string;
}

export const StepTransition = ({ 
  children, 
  isVisible, 
  direction = 'none',
  className 
}: StepTransitionProps) => {
  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0 scale-95 translate-y-4';
    
    switch (direction) {
      case 'forward':
        return 'animate-slide-in-right opacity-100 scale-100 translate-y-0';
      case 'backward':
        return 'animate-slide-in-left opacity-100 scale-100 translate-y-0';
      default:
        return 'animate-fade-in opacity-100 scale-100 translate-y-0';
    }
  };

  return (
    <div className={cn(
      "transition-all duration-300 ease-out",
      getAnimationClass(),
      className
    )}>
      {children}
    </div>
  );
};