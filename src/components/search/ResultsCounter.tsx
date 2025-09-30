import { Loader2 } from "lucide-react";

interface ResultsCounterProps {
  count: number;
  isLoading: boolean;
}

export const ResultsCounter = ({ count, isLoading }: ResultsCounterProps) => {
  return (
    <div className="px-4 py-2 bg-background border-b border-border">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Αναζήτηση...
          </>
        ) : (
          <>
            <span className="font-semibold text-foreground">{count}</span>
            {count === 1 ? 'διαθέσιμο κατάλυμα' : 'διαθέσιμα καταλύματα'}
          </>
        )}
      </p>
    </div>
  );
};
