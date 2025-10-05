import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { el } from "date-fns/locale";

interface AvailabilityFilterPopoverProps {
  moveInDate?: Date;
  duration: string;
  onMoveInDateChange: (date?: Date) => void;
  onDurationChange: (duration: string) => void;
}

const DURATION_OPTIONS = [
  { value: 'short', label: 'Βραχυπρόθεσμη (1-5 μήνες)' },
  { value: 'medium', label: 'Μεσοπρόθεσμη (6-11 μήνες)' },
  { value: 'long', label: 'Μακροπρόθεσμη (12+ μήνες)' },
];

export const AvailabilityFilterPopover = ({
  moveInDate,
  duration,
  onMoveInDateChange,
  onDurationChange,
}: AvailabilityFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const isActive = moveInDate !== undefined || duration !== 'any';
  const label = moveInDate 
    ? format(moveInDate, 'dd MMM', { locale: el })
    : 'Availability';

  const handleNowClick = () => {
    onMoveInDateChange(new Date());
    setShowCalendar(false);
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
              onMoveInDateChange(undefined);
              onDurationChange('any');
            } : undefined}
            icon={CalendarIcon}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-small mb-3">Ημερομηνία μετακόμισης</h4>
            <div className="flex gap-2">
              <Button
                variant={!showCalendar && moveInDate ? "default" : "outline"}
                size="sm"
                onClick={handleNowClick}
                className="flex-1"
              >
                Τώρα
              </Button>
              <Button
                variant={showCalendar ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex-1"
              >
                Επιλογή ημερομηνίας
              </Button>
            </div>
          </div>

          {showCalendar && (
            <Calendar
              mode="single"
              selected={moveInDate}
              onSelect={onMoveInDateChange}
              className="pointer-events-auto"
              disabled={(date) => date < new Date()}
            />
          )}

          <div>
            <h4 className="font-semibold text-small mb-3">Διάρκεια μίσθωσης</h4>
            <div className="space-y-2">
              {DURATION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`duration-${option.value}`}
                    checked={duration === option.value}
                    onCheckedChange={(checked) => {
                      onDurationChange(checked ? option.value : 'any');
                    }}
                  />
                  <Label htmlFor={`duration-${option.value}`} className="text-small cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
