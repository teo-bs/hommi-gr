import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterChip {
  key: string;
  label: string;
  value: any;
}

interface FilterChipsProps {
  activeFilters: FilterChip[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
}

export const FilterChips = ({ activeFilters, onRemoveFilter, onClearAll }: FilterChipsProps) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-3 px-4 bg-surface-elevated border-b border-border">
      <span className="text-sm text-muted-foreground">Φίλτρα:</span>
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.key)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs"
        >
          Καθαρισμός όλων
        </Button>
      )}
    </div>
  );
};
