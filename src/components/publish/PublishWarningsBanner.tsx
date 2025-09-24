import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface ValidationWarning {
  type: 'price_outlier' | 'age_outlier' | 'missing_field' | 'mandatory_field';
  field: string;
  message: string;
  value?: any;
  severity: 'warning' | 'error';
}

interface PublishWarningsBannerProps {
  warnings: ValidationWarning[];
  onFixField: (field: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export const PublishWarningsBanner: React.FC<PublishWarningsBannerProps> = ({
  warnings,
  onFixField,
  onDismiss,
  className = ""
}) => {
  if (warnings.length === 0) return null;

  const hasErrors = warnings.some(w => w.severity === 'error');
  const variant = hasErrors ? "destructive" : "default";

  return (
    <Alert variant={variant} className={`mb-4 ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-medium mb-2">
              {hasErrors 
                ? "Απαιτούνται διορθώσεις πριν τη δημοσίευση:" 
                : "Προτεινόμενες βελτιώσεις:"}
            </p>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-sm">{warning.message}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFixField(warning.field)}
                    className="ml-2 h-auto py-1 px-2 text-xs"
                  >
                    Διόρθωση
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          {onDismiss && !hasErrors && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="ml-2 h-auto p-1"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};