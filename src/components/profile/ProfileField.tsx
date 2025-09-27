import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label: string;
  value: string | string[];
  isEditing: boolean;
  isRequired?: boolean;
  error?: string;
  onValidationChange?: (isValid: boolean) => void;
}

interface TextFieldProps extends BaseFieldProps {
  type: "text" | "textarea";
  placeholder?: string;
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

interface MultiSelectFieldProps extends BaseFieldProps {
  type: "multiselect";
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
}

type ProfileFieldProps = TextFieldProps | SelectFieldProps | MultiSelectFieldProps;

export const ProfileField = (props: ProfileFieldProps) => {
  const [isValid, setIsValid] = useState(false);

  // Validation logic
  useEffect(() => {
    let valid = false;
    
    if (props.type === "multiselect") {
      valid = props.value.length > 0;
    } else {
      const stringValue = props.value as string;
      valid = props.isRequired ? stringValue.trim().length > 0 : true;
    }
    
    setIsValid(valid);
    props.onValidationChange?.(valid);
  }, [props.value, props.isRequired, props.onValidationChange]);

  const showCheckmark = !props.isEditing && isValid && (
    (props.type !== "multiselect" && (props.value as string).trim().length > 0) ||
    (props.type === "multiselect" && (props.value as string[]).length > 0)
  );

  const renderField = () => {
    if (props.type === "text") {
      return (
        <div className="relative">
          <Input
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            className={cn(
              props.error ? 'border-destructive' : '',
              !props.isEditing ? 'border-none bg-transparent p-0' : ''
            )}
            readOnly={!props.isEditing}
          />
          {showCheckmark && (
            <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-success" />
          )}
        </div>
      );
    }

    if (props.type === "textarea") {
      return (
        <div className="relative">
          <Textarea
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            className={cn(
              "min-h-[100px] resize-none",
              props.error ? 'border-destructive' : '',
              !props.isEditing ? 'border-none bg-transparent p-0 break-words' : ''
            )}
            readOnly={!props.isEditing}
          />
          {showCheckmark && (
            <Check className="absolute right-2 top-2 h-4 w-4 text-success" />
          )}
        </div>
      );
    }

    if (props.type === "select") {
      if (!props.isEditing) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{props.options.find(opt => opt.value === props.value)?.label || props.value}</span>
          {showCheckmark && <Check className="h-4 w-4 text-success" data-testid="validation-checkmark" />}
          </div>
        );
      }

      return (
        <Select value={props.value} onValueChange={props.onChange}>
          <SelectTrigger className={props.error ? 'border-destructive' : ''}>
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (props.type === "multiselect") {
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {props.value.map((val) => {
              const option = props.options.find(opt => opt.value === val);
              return option ? (
                <span key={val} className="text-sm bg-secondary px-2 py-1 rounded-md">
                  {option.label}
                </span>
              ) : null;
            })}
          </div>
          {showCheckmark && <Check className="h-4 w-4 text-success" />}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {props.label}
        {props.isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      {renderField()}
      {props.type === "textarea" && props.maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {(props.value as string).length}/{props.maxLength}
        </div>
      )}
      {props.error && (
        <p className="text-sm text-destructive">{props.error}</p>
      )}
    </div>
  );
};