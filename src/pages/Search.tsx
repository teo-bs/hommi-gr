import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { MapContainer } from "@/components/search/MapContainer";
import { MapListingsCarousel } from "@/components/search/MapListingsCarousel";
import { FilterBar, FilterBarState } from "@/components/search/FilterBar";
import { ViewSwitcher } from "@/components/search/ViewSwitcher";
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

// Helper to expand bounds to show surrounding listings
const expandBounds = (bounds: { north: number; south: number; east: number; west: number } | undefined, factor: number = 1.5): { north: number; south: number; east: number; west: number } | undefined => {
  if (!bounds) return undefined;
  
  const { north, south, east, west } = bounds;
  const lngDelta = (east - west) * (factor - 1) / 2;
  const latDelta = (north - south) * (factor - 1) / 2;
  
  return {
    north: north + latDelta,
    south: south - latDelta,
    east: east + lngDelta,
    west: west - lngDelta
  };
};

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
  const [autoSearch, setAutoSearch] = useState<boolean>(true);
  const [hasUserMoved, setHasUserMoved] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Pagination state - initialize from URL
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const [currentPage, setCurrentPage] = useState(initialPage);

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
    flatAmenities: [],
    houseRules: [],
    propertySize: [0, 1000],
    bounds: undefined
  });

  // Use optimized search hook with pagination
  const { data: listings = [], totalCount, isLoading, page: currentPageFromHook, pageSize: itemsPerPage } = useOptimizedSearch({
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
      page: currentPage,
      pageSize: 24,
    }
  });

  // Extract room_ids for current page to fetch photos
  const roomIds = useMemo(() => listings.map(l => l.room_id), [listings]);

  // Fetch photos for current page's rooms
  const { data: roomPhotos = [] } = useQuery({
    queryKey: ['room-photos', roomIds],
    queryFn: async () => {
      if (roomIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('room_photos')
        .select('room_id, url, medium_url, thumbnail_url, sort_order')
        .in('room_id', roomIds)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching room photos:', error);
        return [];
      }
      
      return data;
    },
    enabled: roomIds.length > 0,
  });

  // Build photos map: room_id -> array of photo URLs
  const photosByRoomId = useMemo(() => {
    const map: Record<string, string[]> = {};
    roomPhotos.forEach(photo => {
      const url = photo.medium_url || photo.url || photo.thumbnail_url;
      if (url) {
        if (!map[photo.room_id]) {
          map[photo.room_id] = [];
        }
        map[photo.room_id].push(url);
      }
    });
    return map;
  }, [roomPhotos]);

  // Fetch ALL listings for map (without pagination) with expanded bounds
  const { data: allListingsForMap = [] } = useOptimizedSearch({
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
      bounds: expandBounds(filters.bounds, 1.5), // Show listings 50% beyond viewport
      page: 1,
      pageSize: 1000, // Fetch all results for map
    }
  });

  // Convert ALL listings to map format (not paginated)
  const mapListings = useMemo(() => {
    return allListingsForMap
      .filter(listing => listing.lat && listing.lng) // Only include listings with valid coordinates
      .map(listing => ({
        id: listing.room_id,
        slug: listing.slug,
        title: listing.title,
        price_month: listing.price_month,
        neighborhood: listing.neighborhood,
        city: listing.city,
        flatmates_count: listing.flatmates_count,
        couples_accepted: listing.couples_accepted,
        photos: listing.cover_photo_url ? [listing.cover_photo_url] : ['/placeholder.svg'],
        lat: listing.lat,
        lng: listing.lng,
        formatted_address: (listing as any).formatted_address,
        lister_first_name: listing.lister_first_name
      }));
  }, [allListingsForMap]);

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

  const handleCarouselListingSelect = (id: string, lat: number, lng: number) => {
    setSelectedListingId(id);
    // Map will automatically center on this marker via selectedListingId
  };

  const handleManualMapSearch = () => {
    // Trigger a new search based on current map bounds
    window.dispatchEvent(new CustomEvent('mapBoundsChanged', { 
      detail: { bounds: filters.bounds } 
    }));
  };

  const city = searchParams.get('city');
  
  // Calculate pagination values using totalCount from hook (not listings.length)
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginatedListings = listings; // Hook already returns correct page
  
  console.debug('Search pagination', { totalCount, itemsPerPage, currentPage, totalPages });
  
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

  // Trigger map resize when switching to map view on mobile
  useEffect(() => {
    if (mobileView === 'map') {
      setIsMapReady(false);
      // Wait for DOM to update and transition to complete, then resize map
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        setIsMapReady(true);
      }, 350); // Match transition duration
      
      return () => clearTimeout(timer);
    }
  }, [mobileView]);
  
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

      {/* View Switcher - Mobile Only */}
      <ViewSwitcher 
        view={mobileView}
        onViewChange={setMobileView}
      />

      {/* Results Counter - Hide when map view on mobile */}
      {(mobileView === 'list' || window.innerWidth >= 1024) && (
        <ResultsCounter 
          count={totalCount} 
          isLoading={isLoading}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      )}

      {/* Main Content - Conditional rendering based on view */}
      <div className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="flex gap-6">
          {/* Listings Panel - Show on desktop always, on mobile only if list view */}
          <div className={`flex-1 max-w-2xl ${mobileView === 'map' ? 'hidden lg:block' : ''}`}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-xl sm:rounded-2xl mb-3 animate-scale-in"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {paginatedListings.map((listing, index) => {
                    // Decorate listing with photos array
                    const photos = photosByRoomId[listing.room_id] ?? [listing.cover_photo_url].filter(Boolean);
                    const listingWithPhotos = { ...listing, photos };
                    
                    return (
                      <div 
                        key={listing.room_id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <ListingCard
                          listing={listingWithPhotos}
                          coverPhoto={listing.cover_photo_url}
                          currentUserProfileExtras={currentUserProfile?.profile_extras}
                          hoveredListingId={hoveredListingId}
                          selectedListingId={selectedListingId}
                          onHover={handleListingHover}
                          onClick={handleListingClick}
                        />
                      </div>
                    );
                  })}
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

          {/* Map Panel - Show on desktop always (sticky), on mobile only if map view (full screen) */}
          <div className={`flex-1 transition-all duration-300 ${
            mobileView === 'map' 
              ? 'fixed inset-0 top-0 z-40 pt-[160px]' 
              : 'hidden'
          } lg:block lg:sticky lg:top-[120px] lg:h-[calc(100vh-140px)] lg:z-auto lg:pt-0`}>
            <div className="w-full h-full rounded-none lg:rounded-xl overflow-hidden relative">
              {/* Loading overlay for mobile map */}
              {mobileView === 'map' && !isMapReady && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center lg:hidden">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
              <MapContainer 
                listings={mapListings}
                onListingHover={setHoveredListingId}
                onListingClick={setSelectedListingId}
                hoveredListingId={hoveredListingId}
                selectedListingId={selectedListingId}
                autoSearch={autoSearch}
                onAutoSearchChange={setAutoSearch}
                onManualSearch={handleManualMapSearch}
                hasUserMoved={hasUserMoved}
                onMapReady={() => setIsMapReady(true)}
              />
              
              {/* Mobile Listings Carousel - Only on mobile map view */}
              {mobileView === 'map' && (
                <MapListingsCarousel
                  listings={mapListings}
                  selectedListingId={selectedListingId}
                  onListingSelect={handleCarouselListingSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;