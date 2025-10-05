import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { Building2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ListerTypeFilterPopoverProps {
  value: string;
  onChange: (value: string) => void;
}

const LISTER_OPTIONS = [
  { value: 'any', label: 'Όλοι' },
  { value: 'individual', label: 'Individuals' },
  { value: 'agency', label: 'Agencies' },
];

export const ListerTypeFilterPopover = ({ value, onChange }: ListerTypeFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = LISTER_OPTIONS.find(opt => opt.value === value);
  const label = value === 'any' ? 'Any Lister' : selectedOption?.label || 'Any Lister';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <FilterChip
            label={label}
            isActive={value !== 'any'}
            onClick={() => setOpen(!open)}
            onRemove={value !== 'any' ? () => onChange('any') : undefined}
            icon={Building2}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-small">Listed By</h4>
          <RadioGroup value={value} onValueChange={onChange}>
            {LISTER_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`lister-${option.value}`} />
                <Label htmlFor={`lister-${option.value}`} className="text-small cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </PopoverContent>
    </Popover>
  );
};
