import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

/**
 * Standardized container component for consistent layout widths and padding
 */
export const Container = ({ className, size = "default", ...props }: ContainerProps) => {
  const sizeStyles = {
    narrow: "max-w-4xl",
    default: "max-w-7xl",
    wide: "max-w-[1440px]",
  };

  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 w-full",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
};
