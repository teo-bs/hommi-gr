import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "default" | "compact" | "relaxed";
  as?: "section" | "div";
}

/**
 * Standardized section component for consistent vertical spacing
 */
export const Section = ({ 
  className, 
  spacing = "default", 
  as: Component = "section",
  ...props 
}: SectionProps) => {
  const spacingStyles = {
    compact: "py-8 sm:py-12",
    default: "py-12 sm:py-16 md:py-20",
    relaxed: "py-16 sm:py-20 md:py-24",
  };

  return (
    <Component
      className={cn(
        spacingStyles[spacing],
        className
      )}
      {...props}
    />
  );
};
