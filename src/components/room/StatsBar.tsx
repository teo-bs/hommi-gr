import { Badge } from "@/components/ui/badge";
import { Users, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StatsBarProps {
  publishedDate: string;
  viewCount: number;
  requestCount: number;
}

export const StatsBar = ({ publishedDate, viewCount, requestCount }: StatsBarProps) => {
  const timeAgo = formatDistanceToNow(new Date(publishedDate), { addSuffix: true });
  
  return (
    <div className="flex items-center space-x-4 py-3 border-b">
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Published {timeAgo}
      </Badge>
      
      <div className="flex items-center space-x-1 text-small text-muted-foreground tracking-wide">
        <Users className="h-4 w-4" />
        <span className="font-medium text-foreground tabular-nums">{requestCount}</span>
        <span>candidates sent a request</span>
      </div>
      
      <div className="flex items-center space-x-1 text-small text-muted-foreground tracking-wide">
        <Eye className="h-4 w-4" />
        <span className="tabular-nums">{viewCount}</span>
        <span>views</span>
      </div>
    </div>
  );
};