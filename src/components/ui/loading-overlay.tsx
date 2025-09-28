import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
}

export const LoadingOverlay = ({ 
  isVisible, 
  message = "Φόρτωση...", 
  progress,
  className 
}: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      "animate-fade-in",
      className
    )}>
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg max-w-sm w-full mx-4 animate-scale-in">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="font-medium text-foreground">{message}</p>
            {progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};