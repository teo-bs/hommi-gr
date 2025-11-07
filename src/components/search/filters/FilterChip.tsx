import { Chip } from "@/components/ui/chip";
import { LucideIcon } from "lucide-react";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  onRemove?: () => void;
  icon?: LucideIcon;
}

/**
 * @deprecated Use Chip component directly instead
 * Kept for backward compatibility
 */
export const FilterChip = ({ label, isActive, onClick, onRemove, icon }: FilterChipProps) => {
  return (
    <Chip
      variant="filter"
      active={isActive}
      onClick={onClick}
      onRemove={onRemove}
      icon={icon}
    >
      {label}
    </Chip>
  );
};
