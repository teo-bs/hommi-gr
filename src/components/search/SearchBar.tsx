import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EnhancedSearchFilters } from "./EnhancedSearchFilters";
import { FilterState } from "@/pages/Search";

interface SearchBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  resultCount: number;
}

export const SearchBar = ({ filters, onFilterChange, resultCount }: SearchBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="border-b bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search Pill */}
          <div className="flex-1 max-w-3xl">
            <div className="flex items-center border rounded-full shadow-sm hover:shadow-md transition-shadow bg-background">
              <div className="flex-1 px-6 py-3 border-r">
                <div className="text-xs font-semibold">Περιοχή</div>
                <div className="text-sm text-muted-foreground">Όλη η Ελλάδα</div>
              </div>
              <div className="flex-1 px-6 py-3 border-r">
                <div className="text-xs font-semibold">Ημερομηνία</div>
                <div className="text-sm text-muted-foreground">Οποιαδήποτε</div>
              </div>
              <div className="flex-1 px-6 py-3 border-r">
                <div className="text-xs font-semibold">Προσθέστε</div>
                <div className="text-sm text-muted-foreground">Επισκέπτες</div>
              </div>
              <Button size="icon" className="rounded-full m-2" variant="default">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters Button */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="rounded-full" size="default">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Φίλτρα
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Φίλτρα αναζήτησης</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <EnhancedSearchFilters 
                  filters={filters} 
                  onFilterChange={onFilterChange}
                  resultCount={resultCount}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};
