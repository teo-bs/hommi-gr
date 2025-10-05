import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const durations = [
  { id: "short", label: "Σύντομη", subtitle: "1-5 μήνες" },
  { id: "medium", label: "Μέτρια", subtitle: "6-11 μήνες" },
  { id: "long", label: "Μεγάλη", subtitle: "12+ μήνες" },
];

interface DurationSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function DurationSelector({ value, onValueChange, className }: DurationSelectorProps) {
  const selectedDuration = durations.find(d => d.id === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal border-0 bg-transparent hover:bg-muted/50 p-0 h-auto",
            className
          )}
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-xs font-medium text-foreground mb-1">
              Διάρκεια παραμονής
            </span>
            <div className="flex items-center w-full">
              <div className="flex flex-col">
                <span className="text-sm">
                  {selectedDuration ? selectedDuration.label : "Επιλέξτε διάρκεια"}
                </span>
                {selectedDuration && (
                  <span className="text-xs text-muted-foreground">
                    {selectedDuration.subtitle}
                  </span>
                )}
              </div>
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0 bg-background border shadow-lg" align="start">
        <div className="py-2">
          {durations.map((duration) => (
            <button
              key={duration.id}
              onClick={() => onValueChange?.(duration.id)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{duration.label}</span>
                <span className="text-xs text-muted-foreground">
                  {duration.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}