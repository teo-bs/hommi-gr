import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-background/50 before:to-transparent",
        "before:animate-[shimmer_2s_infinite]",
        className
      )} 
      {...props} 
    />
  );
}

export { Skeleton };
