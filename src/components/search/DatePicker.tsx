import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left font-normal border-0 bg-transparent hover:bg-muted/50 p-0 h-auto",
            !date && "text-muted-foreground",
            className
          )}
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-xs font-medium text-foreground mb-1">
              {placeholder}
            </span>
            <div className="flex items-center w-full">
              <span className="text-sm">
                {date ? format(date, "dd/MM/yyyy") : "Επιλέξτε ημερομηνία"}
              </span>
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}