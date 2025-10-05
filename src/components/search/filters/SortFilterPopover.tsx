import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { TrendingUp } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SortFilterPopoverProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'recent', label: 'Πιο πρόσφατα' },
  { value: 'price_low', label: 'Τιμή: Χαμηλή σε Υψηλή' },
  { value: 'price_high', label: 'Τιμή: Υψηλή σε Χαμηλή' },
];

export const SortFilterPopover = ({ value, onChange }: SortFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = SORT_OPTIONS.find(opt => opt.value === value) || SORT_OPTIONS[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <FilterChip
            label={selectedOption.label}
            isActive={value !== 'featured'}
            onClick={() => setOpen(!open)}
            onRemove={value !== 'featured' ? () => onChange('featured') : undefined}
            icon={TrendingUp}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-small">Ταξινόμηση κατά</h4>
          <RadioGroup value={value} onValueChange={onChange}>
            {SORT_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="text-small cursor-pointer">
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
