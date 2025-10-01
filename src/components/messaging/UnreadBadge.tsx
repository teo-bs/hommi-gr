import { Badge } from "@/components/ui/badge";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export const UnreadBadge = ({ count, className = "" }: UnreadBadgeProps) => {
  if (count === 0) return null;
  
  return (
    <Badge 
      variant="destructive" 
      className={`h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 ${className}`}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};
