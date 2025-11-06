import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptProps {
  delivered: boolean;
  read: boolean;
  timestamp: string;
}

export const ReadReceipt = ({ delivered, read, timestamp }: ReadReceiptProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground">
        {formatTime(timestamp)}
      </span>
      {delivered && (
        <div className={read ? "text-primary" : "text-muted-foreground"}>
          {read ? (
            <CheckCheck className="h-3 w-3" />
          ) : (
            <CheckCheck className="h-3 w-3" />
          )}
        </div>
      )}
    </div>
  );
};
