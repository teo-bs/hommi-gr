import { Button } from "@/components/ui/button";
import { X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  onRemove?: () => void;
  icon?: LucideIcon;
}

export const FilterChip = ({ label, isActive, onClick, onRemove, icon: Icon }: FilterChipProps) => {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 gap-2 whitespace-nowrap transition-all",
        isActive && "pr-2"
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-small font-medium">{label}</span>
      {isActive && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-background/20 rounded-full p-0.5 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Button>
  );
};
