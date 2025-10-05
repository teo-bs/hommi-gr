import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FlatmatesFilterPopoverProps {
  flatmatesCount?: number;
  flatmatesGender: string[];
  onFlatmatesCountChange: (count?: number) => void;
  onFlatmatesGenderChange: (genders: string[]) => void;
}

const GENDER_OPTIONS = [
  { value: 'female', label: 'Γυναίκα' },
  { value: 'male', label: 'Άνδρας' },
  { value: 'non_binary', label: 'Μη δυαδικό' },
];

export const FlatmatesFilterPopover = ({
  flatmatesCount,
  flatmatesGender,
  onFlatmatesCountChange,
  onFlatmatesGenderChange,
}: FlatmatesFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [tempCount, setTempCount] = useState(flatmatesCount || 0);
  
  const isActive = flatmatesCount !== undefined || flatmatesGender.length > 0;
  const label = flatmatesCount !== undefined 
    ? `${flatmatesCount} συγκάτοικος${flatmatesCount !== 1 ? 'οι' : ''}`
    : 'Flatmates';

  const handleGenderToggle = (gender: string) => {
    if (flatmatesGender.includes(gender)) {
      onFlatmatesGenderChange(flatmatesGender.filter(g => g !== gender));
    } else {
      onFlatmatesGenderChange([...flatmatesGender, gender]);
    }
  };

  const handleApply = () => {
    onFlatmatesCountChange(tempCount > 0 ? tempCount : undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <FilterChip
            label={label}
            isActive={isActive}
            onClick={() => setOpen(!open)}
            onRemove={isActive ? () => {
              onFlatmatesCountChange(undefined);
              onFlatmatesGenderChange([]);
            } : undefined}
            icon={Users}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-small mb-3">Αριθμός συγκατοίκων</h4>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTempCount(Math.max(0, tempCount - 1))}
                disabled={tempCount === 0}
              >
                -
              </Button>
              <span className="text-h4 font-semibold tabular-nums w-12 text-center">
                {tempCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTempCount(Math.min(10, tempCount + 1))}
                disabled={tempCount === 10}
              >
                +
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-small mb-3">Φύλο</h4>
            <div className="space-y-2">
              {GENDER_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`gender-${option.value}`}
                    checked={flatmatesGender.includes(option.value)}
                    onCheckedChange={() => handleGenderToggle(option.value)}
                  />
                  <Label htmlFor={`gender-${option.value}`} className="text-small cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleApply} className="w-full">
            Εφαρμογή
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
