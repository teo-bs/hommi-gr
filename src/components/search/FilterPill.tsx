import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  className?: string;
}

export const FilterPill = ({ 
  label, 
  active = false, 
  count, 
  onClick,
  className 
}: FilterPillProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full",
        "border transition-all duration-200",
        "min-h-[44px] touch-manipulation active:scale-95",
        "text-sm font-medium whitespace-nowrap",
        active 
          ? "bg-foreground text-background border-foreground shadow-sm" 
          : "bg-background text-foreground border-border hover:border-foreground/40",
        className
      )}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-0.5 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
        >
          {count}
        </Badge>
      )}
      <ChevronDown className="h-4 w-4 opacity-60" />
    </button>
  );
};
