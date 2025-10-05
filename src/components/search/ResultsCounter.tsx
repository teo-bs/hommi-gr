import { Loader2 } from "lucide-react";

interface ResultsCounterProps {
  count: number;
  isLoading: boolean;
  currentPage?: number;
  itemsPerPage?: number;
}

export const ResultsCounter = ({ 
  count, 
  isLoading, 
  currentPage = 1, 
  itemsPerPage = 30 
}: ResultsCounterProps) => {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, count);
  
  return (
    <div className="container mx-auto px-6 py-4">
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
            {count > itemsPerPage && (
              <span className="text-muted-foreground">
                ({startIndex}-{endIndex})
              </span>
            )}
          </>
        )}
      </p>
    </div>
  );
};
