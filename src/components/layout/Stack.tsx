import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StackProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const spacingMap = {
  sm: 'gap-2',   // 16px
  md: 'gap-4',   // 32px
  lg: 'gap-6',   // 48px
  xl: 'gap-8',   // 64px
};

export const Stack = ({ children, className, spacing = 'md' }: StackProps) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col",
        spacingMap[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};
