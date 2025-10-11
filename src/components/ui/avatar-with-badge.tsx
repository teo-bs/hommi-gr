import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarWithBadgeProps {
  src?: string;
  alt?: string;
  fallback: string;
  showBadge?: boolean;
  className?: string;
  badgeClassName?: string;
}

export const AvatarWithBadge = ({ 
  src, 
  alt, 
  fallback, 
  showBadge = false,
  className,
  badgeClassName
}: AvatarWithBadgeProps) => {
  return (
    <div className="relative inline-block">
      <Avatar className={className}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {showBadge && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 bg-primary rounded-full p-0.5 border-2 border-background shadow-sm",
          badgeClassName
        )}>
          <ShieldCheck className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};
