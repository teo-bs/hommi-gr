import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface BudgetFilterPopoverProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const BudgetFilterPopover = ({ value, onChange }: BudgetFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [tempMin, setTempMin] = useState(value[0].toString());
  const [tempMax, setTempMax] = useState(value[1].toString());
  
  const isActive = value[0] !== 300 || value[1] !== 800;
  const label = isActive ? `€${value[0]}-€${value[1]}` : 'Monthly Budget';

  const handleApply = () => {
    const min = parseInt(tempMin) || 300;
    const max = parseInt(tempMax) || 800;
    onChange([Math.min(min, max), Math.max(min, max)]);
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
            onRemove={isActive ? () => onChange([300, 800]) : undefined}
            icon={Euro}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold text-small">Μηνιαίος Προϋπολογισμός</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-budget" className="text-small">Ελάχιστο</Label>
              <Input
                id="min-budget"
                type="number"
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                placeholder="€300"
                className="tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-budget" className="text-small">Μέγιστο</Label>
              <Input
                id="max-budget"
                type="number"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                placeholder="€800"
                className="tabular-nums"
              />
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
