import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMessageSearch } from "@/hooks/useMessageSearch";

interface MessageSearchProps {
  threadId: string;
  onResultClick?: (messageId: string) => void;
}

export const MessageSearch = ({ threadId, onResultClick }: MessageSearchProps) => {
  const { searchQuery, results, isSearching, search, clearSearch } = useMessageSearch(threadId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Search className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => search(e.target.value)}
              placeholder="Αναζήτηση στη συνομιλία..."
              className="border-0 focus-visible:ring-0 p-0 h-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Αναζήτηση...
            </div>
          ) : results.length === 0 && searchQuery ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Δεν βρέθηκαν αποτελέσματα
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Πληκτρολογήστε για αναζήτηση
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    onResultClick?.(result.id);
                    clearSearch();
                  }}
                  className="w-full p-2 hover:bg-muted rounded-lg text-left transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={result.sender?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {result.sender?.display_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">
                        {result.sender?.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(result.created_at).toLocaleDateString('el-GR')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
