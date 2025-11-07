import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap = {
  sm: 'max-w-screen-sm',   // 640px
  md: 'max-w-screen-md',   // 768px
  lg: 'max-w-screen-lg',   // 1024px
  xl: 'max-w-screen-xl',   // 1280px
  full: 'max-w-full',
};

export const Container = ({ children, className, size = 'xl' }: ContainerProps) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col",
        "mx-auto",
        "px-4 sm:px-6 lg:px-8",
        sizeMap[size],
        className
      )}
    >
      {children}
    </div>
  );
};
