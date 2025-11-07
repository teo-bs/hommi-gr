import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingMap = {
  sm: 'py-8',    // 64px (8 units)
  md: 'py-12',   // 96px (12 units)
  lg: 'py-16',   // 128px (16 units)
};

export const Section = ({ children, className, spacing = 'md' }: SectionProps) => {
  return (
    <section
      className={cn(
        "w-full flex flex-col",
        spacingMap[spacing],
        className
      )}
    >
      {children}
    </section>
  );
};
