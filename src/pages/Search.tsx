import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { MapContainer } from "@/components/search/MapContainer";
import { FilterBar, FilterBarState } from "@/components/search/FilterBar";
import { useSearchStateCache } from "@/hooks/useSearchStateCache";
import { useDebouncedCallback } from 'use-debounce';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { ListingCard } from "@/components/search/ListingCard";
import { ResultsCounter } from "@/components/search/ResultsCounter";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export interface FilterState extends FilterBarState {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { saveState, restoreState } = useSearchStateCache();
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [autoSearch, setAutoSearch] = useState<boolean>(false);
  
  // Pagination state - initialize from URL
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 30;

  // Fetch current user and profile for matching
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_extras')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      console.log('Fetched user profile_extras:', data?.profile_extras);
      return data;
    },
  });

  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    budget: [300, 800],
    sort: searchParams.get('sort') || 'featured',
    listerType: "any",
    moveInDate: undefined,
    duration: "any",
    flatmatesCount: undefined,
    flatmatesGender: [],
    bedType: [],
    roomAmenities: [],
    services: [],
    flatAmenities: [],
    houseRules: [],
    propertySize: [0, 1000],
    bounds: undefined
  });

  // Use optimized search hook
  const { data: listings = [], isLoading } = useOptimizedSearch({
    filters: {
      budget: { min: filters.budget[0], max: filters.budget[1] },
      flatmates: filters.flatmatesCount,
      couplesAccepted: filters.houseRules.includes('couples'),
      petsAllowed: filters.houseRules.includes('pets'),
      listerType: filters.listerType !== 'any' ? filters.listerType as 'individual' | 'agency' : undefined,
      amenities: [...filters.roomAmenities, ...filters.flatAmenities],
      moveInDate: filters.moveInDate,
      duration: filters.duration !== 'any' ? (
        filters.duration === 'short' ? 5 :
        filters.duration === 'medium' ? 11 :
        filters.duration === 'long' ? 12 : undefined
      ) : undefined,
      sort: filters.sort,
      bounds: filters.bounds,
      bedType: filters.bedType,
      services: filters.services,
      houseRules: filters.houseRules,
      propertySize: filters.propertySize[0] !== 0 || filters.propertySize[1] !== 1000 ? 
        { min: filters.propertySize[0], max: filters.propertySize[1] } : undefined,
    }
  });


  // Convert listings to map format
  const mapListings = useMemo(() => {
    return listings.map(listing => ({
      id: listing.room_id,
      room_id: listing.room_id,
      title: listing.title,
      price_month: listing.price_month,
      neighborhood: listing.neighborhood,
      city: listing.city,
      flatmates_count: listing.flatmates_count,
      couples_accepted: listing.couples_accepted,
      photos: listing.cover_photo_url ? [listing.cover_photo_url] : ['/placeholder.svg'],
      room_slug: listing.slug,
      geo: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
      formatted_address: (listing as any).formatted_address
    }));
  }, [listings]);

  // Restore state when coming back from listing
  useEffect(() => {
    if (location.state?.fromListing) {
      const cached = restoreState();
      if (cached) {
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
    const handleMapBoundsChanged = (event: CustomEvent) => {
      const { bounds } = event.detail;
      if (bounds) {
        debouncedBoundsUpdate(bounds);
      }
    };

    window.addEventListener('mapBoundsChanged', handleMapBoundsChanged as EventListener);
    
    return () => {
      window.removeEventListener('mapBoundsChanged', handleMapBoundsChanged as EventListener);
      debouncedBoundsUpdate.cancel();
    };
  }, [debouncedBoundsUpdate]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    // Persist to URL
    const params = new URLSearchParams(searchParams);
    if (updatedFilters.budget[0] !== 300 || updatedFilters.budget[1] !== 800) {
      params.set('budget', `${updatedFilters.budget[0]}-${updatedFilters.budget[1]}`);
    } else {
      params.delete('budget');
    }
    if (updatedFilters.sort !== 'featured') params.set('sort', updatedFilters.sort); else params.delete('sort');
    setSearchParams(params);
  };

  const handleListingHover = (listingId: string, isEntering: boolean) => {
    setHoveredListingId(isEntering ? listingId : null);
  };

  const handleListingClick = (listingId: string) => {
    // Save state before navigating
    saveState(mapListings, window.scrollY, filters);
    setSelectedListingId(listingId);
  };

  const handleManualMapSearch = () => {
    // Trigger a new search based on current map bounds
    window.dispatchEvent(new CustomEvent('mapBoundsChanged', { 
      detail: { bounds: filters.bounds } 
    }));
  };

  const city = searchParams.get('city');
  
  // Calculate pagination values
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = listings.slice(startIndex, endIndex);
  
  // Sync currentPage to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(currentPage));
    setSearchParams(params, { replace: true });
  }, [currentPage]);

  // Clamp currentPage if totalPages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages]);
  
  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (showEllipsisStart) {
        pages.push('ellipsis');
      }
      
      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (showEllipsisEnd) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Filter Bar */}
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      {/* Results Counter */}
      <ResultsCounter 
        count={listings.length} 
        isLoading={isLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      {/* Main Content - Always Split View on Desktop */}
      <div className="container mx-auto px-6 pb-6">
        <div className="flex gap-6">
          {/* Listings Panel */}
          <div className="flex-1 max-w-2xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-xl mb-3"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedListings.map((listing) => (
                    <ListingCard
                      key={listing.room_id}
                      listing={listing}
                      coverPhoto={listing.cover_photo_url}
                      currentUserProfileExtras={currentUserProfile?.profile_extras}
                      hoveredListingId={hoveredListingId}
                      selectedListingId={selectedListingId}
                      onHover={handleListingHover}
                      onClick={handleListingClick}
                    />
                  ))}
                </div>
                
                {/* Pagination - always show when there are listings */}
                {listings.length > 0 && (
                  <div className="mt-8 mb-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {getPageNumbers().map((page, idx) => (
                          <PaginationItem key={idx}>
                            {page === 'ellipsis' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map Panel - Sticky */}
          <div className="hidden lg:block flex-1 sticky top-[120px] h-[calc(100vh-140px)]">
            <div className="w-full h-full rounded-xl overflow-hidden">
              <MapContainer 
                listings={mapListings}
                onListingHover={setHoveredListingId}
                onListingClick={setSelectedListingId}
                hoveredListingId={hoveredListingId}
                selectedListingId={selectedListingId}
                autoSearch={autoSearch}
                onAutoSearchChange={setAutoSearch}
                onManualSearch={handleManualMapSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;