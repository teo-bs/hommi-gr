import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EnhancedSearchFilters } from "./EnhancedSearchFilters";
import { FilterState } from "@/pages/Search";

interface SearchBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onRemoveFilter?: (key: string) => void;
  resultCount: number;
}

export const SearchBar = ({ filters, onFilterChange, onRemoveFilter, resultCount }: SearchBarProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const openFilters = () => setShowFilters(true);

  // Build active filter badges
  const activeFilterBadges = [];
  if (filters.budget[0] > 300 || filters.budget[1] < 800) {
    activeFilterBadges.push({ key: 'budget', label: `€${filters.budget[0]}-€${filters.budget[1]}` });
  }
  if (filters.verifiedLister) {
    activeFilterBadges.push({ key: 'verifiedLister', label: 'Επαληθευμένοι' });
  }
  if (filters.couplesAccepted) {
    activeFilterBadges.push({ key: 'couplesAccepted', label: 'Ζευγάρια' });
  }
  if (filters.petsAllowed) {
    activeFilterBadges.push({ key: 'petsAllowed', label: 'Κατοικίδια' });
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50 shadow-sm animate-fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search Pill */}
            <div className="flex-1 max-w-3xl">
              <div 
                className="flex items-center border rounded-full shadow-sm hover:shadow-md transition-all duration-200 bg-background cursor-pointer"
                onClick={openFilters}
                aria-label="Άνοιγμα φίλτρων"
              >
                <div className="flex-1 px-6 py-3 border-r">
                  <div className="text-xs font-semibold">Περιοχή</div>
                  <div className="text-sm text-muted-foreground">Όλη η Ελλάδα</div>
                </div>
                <div className="flex-1 px-6 py-3 border-r">
                  <div className="text-xs font-semibold">Ημερομηνία</div>
                  <div className="text-sm text-muted-foreground">{filters?.moveInDate ? new Date(filters.moveInDate).toLocaleDateString('el-GR') : 'Οποιαδήποτε'}</div>
                </div>
                <div className="flex-1 px-6 py-3 border-r">
                  <div className="text-xs font-semibold">Επισκέπτες</div>
                  <div className="text-sm text-muted-foreground">1+</div>
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
              <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto z-[60] bg-background">
                <SheetHeader>
                  <SheetTitle>Φίλτρα αναζήτησης</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <EnhancedSearchFilters 
                    filters={filters} 
                    onFilterChange={(f) => onFilterChange(f)}
                    resultCount={resultCount}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filter Chips */}
          {activeFilterBadges.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in">
              {activeFilterBadges.map((chip) => (
                <Badge 
                  key={chip.key} 
                  variant="secondary" 
                  className="px-3 py-1 rounded-full hover:bg-secondary/80 transition-colors cursor-pointer"
                  onClick={() => onRemoveFilter?.(chip.key)}
                >
                  {chip.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
