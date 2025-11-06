import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResponseTimeBadgeProps {
  avgResponseTimeMinutes?: number | null;
}

export const ResponseTimeBadge = ({ avgResponseTimeMinutes }: ResponseTimeBadgeProps) => {
  if (!avgResponseTimeMinutes || avgResponseTimeMinutes === 0) return null;

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} λεπτά`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ώρα${hours > 1 ? 'ες' : ''}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} μέρα${days > 1 ? 'ες' : ''}`;
  };

  const getVariant = (minutes: number) => {
    if (minutes < 60) return 'default'; // < 1 hour - fast
    if (minutes < 360) return 'secondary'; // < 6 hours - moderate
    return 'outline'; // > 6 hours - slow
  };

  return (
    <Badge variant={getVariant(avgResponseTimeMinutes)} className="gap-1">
      <Clock className="h-3 w-3" />
      <span className="text-xs">
        Απαντά συνήθως σε {formatResponseTime(avgResponseTimeMinutes)}
      </span>
    </Badge>
  );
};
