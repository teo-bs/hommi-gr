import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { MapContainer } from "@/components/search/MapContainer";
import { EnhancedSearchFilters } from "@/components/search/EnhancedSearchFilters";
import { FilterChips } from "@/components/search/FilterChips";
import { ResultsCounter } from "@/components/search/ResultsCounter";
import { ListingGrid } from "@/components/search/ListingGrid";
import { Button } from "@/components/ui/button";
import { Map, List, SlidersHorizontal } from "lucide-react";
import { useSearchStateCache } from "@/hooks/useSearchStateCache";
import { useDebouncedCallback } from 'use-debounce';

export interface FilterState {
  budget: [number, number];
  flatmates: string;
  space: string;
  roomType: string;
  couplesAccepted: boolean;
  petsAllowed: boolean;
  billsIncluded: boolean;
  verifiedLister: boolean;
  listerType: string;
  amenities: string[];
  moveInDate?: Date;
  duration: string;
  sort: string;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { saveState, restoreState } = useSearchStateCache();
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);

  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    budget: [300, 800],
    flatmates: "any",
    space: "any",
    roomType: "any",
    couplesAccepted: false,
    petsAllowed: false,
    billsIncluded: false,
    verifiedLister: false,
    listerType: "any",
    amenities: [],
    duration: "any",
    sort: searchParams.get('sort') || 'featured'
  });

  // Build active filter chips
  const activeFilters = useMemo(() => {
    const chips: Array<{ key: string; label: string; value: any }> = [];
    
    if (filters.budget[0] > 300 || filters.budget[1] < 800) {
      chips.push({ key: 'budget', label: `€${filters.budget[0]}-€${filters.budget[1]}`, value: filters.budget });
    }
    if (filters.roomType !== 'any') {
      const typeLabels: Record<string, string> = {
        private: 'Ιδιωτικό',
        shared: 'Κοινόχρηστο',
        entire_place: 'Ολόκληρο'
      };
      chips.push({ key: 'roomType', label: typeLabels[filters.roomType] || filters.roomType, value: filters.roomType });
    }
    if (filters.couplesAccepted) {
      chips.push({ key: 'couplesAccepted', label: 'Ζευγάρια', value: true });
    }
    if (filters.petsAllowed) {
      chips.push({ key: 'petsAllowed', label: 'Κατοικίδια', value: true });
    }
    if (filters.billsIncluded) {
      chips.push({ key: 'billsIncluded', label: 'Λογαριασμοί εντός', value: true });
    }
    if (filters.verifiedLister) {
      chips.push({ key: 'verifiedLister', label: 'Επαληθευμένοι', value: true });
    }
    if (filters.listerType !== 'any') {
      const listerLabels: Record<string, string> = {
        individual: 'Ιδιώτες',
        agency: 'Μεσιτικά'
      };
      chips.push({ key: 'listerType', label: listerLabels[filters.listerType] || filters.listerType, value: filters.listerType });
    }
    if (filters.amenities.length > 0) {
      chips.push({ key: 'amenities', label: `${filters.amenities.length} ανέσεις`, value: filters.amenities });
    }
    if (filters.moveInDate) {
      chips.push({ key: 'moveInDate', label: `Από ${filters.moveInDate.toLocaleDateString('el-GR')}`, value: filters.moveInDate });
    }
    if (filters.duration !== 'any') {
      chips.push({ key: 'duration', label: `${filters.duration} μήνες`, value: filters.duration });
    }
    
    return chips;
  }, [filters]);

  // Extract search parameters
  const city = searchParams.get('city') || '';
  const bbox = searchParams.get('bbox') || '';
  const filtersParam = searchParams.get('filters') || '';
  const sort = searchParams.get('sort') || 'featured';

  // Restore state when coming back from listing
  useEffect(() => {
    if (location.state?.fromListing) {
      const cached = restoreState();
      if (cached) {
        setListings(cached.listings);
        setFilters(cached.filters);
        
        // Restore scroll position after a brief delay to ensure DOM is ready
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.scrollTo(0, cached.scrollY);
          }, 100);
        });
      }
    }
  }, [location.state, restoreState]);

  // Debounced handler for map bounds changes to prevent query spam
  const debouncedBoundsUpdate = useDebouncedCallback((bounds: any) => {
    setFilters(prev => ({ ...prev, bounds }));
  }, 300);

  useEffect(() => {
    // Track analytics
    console.log('search_page_viewed', {
      city,
      filters: filtersParam,
      sort,
      timestamp: Date.now()
    });

    const handleMapBoundsChanged = (event: CustomEvent) => {
      const { bounds } = event.detail;
      if (bounds) {
        debouncedBoundsUpdate(bounds);
      }
    };

    // Listen for listings updates from ListingGrid
    const handleListingsUpdated = (event: CustomEvent) => {
      setListings(event.detail.listings);
    };

    window.addEventListener('mapBoundsChanged', handleMapBoundsChanged as EventListener);
    window.addEventListener('listingsUpdated', handleListingsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('mapBoundsChanged', handleMapBoundsChanged as EventListener);
      window.removeEventListener('listingsUpdated', handleListingsUpdated as EventListener);
      debouncedBoundsUpdate.cancel();
    };
  }, [debouncedBoundsUpdate, city, filtersParam, sort]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL with filter state (simplified for demo)
    const params = new URLSearchParams(searchParams);
    if (city) params.set('city', city);
    if (updatedFilters.sort !== 'featured') params.set('sort', updatedFilters.sort);
    setSearchParams(params);
  };

  const handleRemoveFilter = (key: string) => {
    const defaults: Partial<FilterState> = {
      budget: [300, 800],
      roomType: 'any',
      couplesAccepted: false,
      petsAllowed: false,
      billsIncluded: false,
      verifiedLister: false,
      listerType: 'any',
      amenities: [],
      moveInDate: undefined,
      duration: 'any'
    };
    handleFilterChange({ [key]: defaults[key as keyof typeof defaults] });
  };

  const handleClearAllFilters = () => {
    setFilters({
      budget: [300, 800],
      flatmates: "any",
      space: "any",
      roomType: "any",
      couplesAccepted: false,
      petsAllowed: false,
      billsIncluded: false,
      verifiedLister: false,
      listerType: "any",
      amenities: [],
      duration: "any",
      sort: 'featured'
    });
  };

  const handleListingClick = (listingId: string) => {
    // Save state before navigating
    saveState(listings, window.scrollY, filters);
    setSelectedListingId(listingId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {city ? `Αποτελέσματα σε ${city}` : 'Αποτελέσματα αναζήτησης'}
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Φίλτρα
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileMap(!showMobileMap)}
            >
              {showMobileMap ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  Λίστα
                </>
              ) : (
                <>
                  <Map className="h-4 w-4 mr-2" />
                  Χάρτης
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block border-b border-border bg-background p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {city ? `Αποτελέσματα σε ${city}` : 'Αποτελέσματα αναζήτησης'}
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Λίστα
              </Button>
              <Button
                variant={viewMode === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('split')}
              >
                Λίστα + Χάρτης
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                Χάρτης
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <FilterChips 
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Results Counter */}
      <ResultsCounter count={listings.length} isLoading={false} />

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden border-b border-border bg-surface-elevated p-4">
          <EnhancedSearchFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
            resultCount={listings.length}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block w-80 border-r border-border bg-surface-elevated">
          <div className="p-6 h-full overflow-y-auto">
            <EnhancedSearchFilters 
              filters={filters} 
              onFilterChange={handleFilterChange}
              resultCount={listings.length}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex">
          {/* Mobile: Either list or map */}
          <div className="lg:hidden w-full">
            {showMobileMap ? (
              <div className="h-[calc(100vh-140px)]">
                <MapContainer 
                  listings={listings}
                  onListingHover={setHoveredListingId}
                  onListingClick={setSelectedListingId}
                  hoveredListingId={hoveredListingId}
                  selectedListingId={selectedListingId}
                />
              </div>
            ) : (
              <div className="p-4">
                <ListingGrid 
                  filters={filters} 
                  onListingHover={setHoveredListingId}
                  onListingClick={handleListingClick}
                  hoveredListingId={hoveredListingId}
                  selectedListingId={selectedListingId}
                />
              </div>
            )}
          </div>

          {/* Desktop: List view */}
          {viewMode === 'list' && (
            <div className="hidden lg:block w-full p-6">
              <ListingGrid 
                filters={filters} 
                onListingHover={setHoveredListingId}
                onListingClick={handleListingClick}
                hoveredListingId={hoveredListingId}
                selectedListingId={selectedListingId}
              />
            </div>
          )}

          {/* Desktop: Split view */}
          {viewMode === 'split' && (
            <>
              <div className="hidden lg:block w-1/2 p-6 overflow-y-auto">
                <ListingGrid 
                  filters={filters} 
                  onListingHover={setHoveredListingId}
                  onListingClick={handleListingClick}
                  hoveredListingId={hoveredListingId}
                  selectedListingId={selectedListingId}
                />
              </div>
              <div className="hidden lg:block w-1/2 h-[calc(100vh-120px)] sticky top-[120px]">
                <MapContainer 
                  listings={listings}
                  onListingHover={setHoveredListingId}
                  onListingClick={setSelectedListingId}
                  hoveredListingId={hoveredListingId}
                  selectedListingId={selectedListingId}
                />
              </div>
            </>
          )}

          {/* Desktop: Map view */}
          {viewMode === 'map' && (
            <div className="hidden lg:block w-full h-[calc(100vh-120px)]">
              <MapContainer 
                listings={listings}
                onListingHover={setHoveredListingId}
                onListingClick={setSelectedListingId}
                hoveredListingId={hoveredListingId}
                selectedListingId={selectedListingId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;