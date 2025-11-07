import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Filter chips - interactive, toggleable
        filter: "rounded-full px-4 py-2 min-h-[44px] border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary",
        
        // Badge - status indicators
        badge: "rounded-full px-3 py-1 text-micro border-transparent",
        
        // Tag - categories/labels
        tag: "rounded-md px-3 py-1.5 text-small border",
      },
      colorScheme: {
        default: "",
        primary: "bg-primary text-primary-foreground border-primary",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
        success: "bg-success text-success-foreground border-success",
        warning: "bg-warning text-warning-foreground border-warning",
        destructive: "bg-destructive text-destructive-foreground border-destructive",
        outline: "border-input bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "filter",
      colorScheme: "default",
    },
  }
);

export interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  icon?: LucideIcon;
  onRemove?: () => void;
  active?: boolean;
  removable?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, variant, colorScheme, icon: Icon, onRemove, active, removable, children, onClick, ...props }, ref) => {
    const isInteractive = variant === "filter" || onClick;
    const Comp = isInteractive ? "button" : "span";

    return (
      <Comp
        ref={isInteractive ? ref : undefined}
        className={cn(chipVariants({ variant, colorScheme, className }))}
        data-active={active}
        onClick={onClick}
        {...(isInteractive ? props : {})}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-small font-medium">{children}</span>
        {(removable || (active && onRemove)) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-1 hover:bg-background/20 rounded-full p-0.5 transition-colors"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </Comp>
    );
  }
);

Chip.displayName = "Chip";

export { Chip, chipVariants };
