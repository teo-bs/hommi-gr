import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer } from "@/components/search/MapContainer";
import { SearchFilters } from "@/components/search/SearchFilters";
import { ListingGrid } from "@/components/search/ListingGrid";
import { Button } from "@/components/ui/button";
import { Map, List, SlidersHorizontal } from "lucide-react";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Extract search parameters
  const city = searchParams.get('city') || '';
  const bbox = searchParams.get('bbox') || '';
  const filters = searchParams.get('filters') || '';
  const sort = searchParams.get('sort') || 'featured';

  useEffect(() => {
    // Track analytics
    console.log('search_page_viewed', {
      city,
      filters,
      sort,
      timestamp: Date.now()
    });
  }, [city, filters, sort]);

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

      {/* Mobile Filters */}
      {showFilters && (
        <div className="lg:hidden border-b border-border bg-surface-elevated p-4">
          <SearchFilters />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block w-80 border-r border-border bg-surface-elevated">
          <div className="p-6 h-full overflow-y-auto">
            <SearchFilters />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex">
          {/* Mobile: Either list or map */}
          <div className="lg:hidden w-full">
            {showMobileMap ? (
              <div className="h-[calc(100vh-140px)]">
                <MapContainer />
              </div>
            ) : (
              <div className="p-4">
                <ListingGrid />
              </div>
            )}
          </div>

          {/* Desktop: List view */}
          {viewMode === 'list' && (
            <div className="hidden lg:block w-full p-6">
              <ListingGrid />
            </div>
          )}

          {/* Desktop: Split view */}
          {viewMode === 'split' && (
            <>
              <div className="hidden lg:block w-1/2 p-6 overflow-y-auto">
                <ListingGrid />
              </div>
              <div className="hidden lg:block w-1/2 h-[calc(100vh-120px)] sticky top-[120px]">
                <MapContainer />
              </div>
            </>
          )}

          {/* Desktop: Map view */}
          {viewMode === 'map' && (
            <div className="hidden lg:block w-full h-[calc(100vh-120px)]">
              <MapContainer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;