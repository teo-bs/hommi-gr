import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { MapContainer } from "@/components/search/MapContainer";
import { FilterBar, FilterBarState } from "@/components/search/FilterBar";
import { useSearchStateCache } from "@/hooks/useSearchStateCache";
import { useDebouncedCallback } from 'use-debounce';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { ListingCard } from "@/components/search/ListingCard";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

  // Fetch current user's profile for matching
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_extras')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
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

  // Fetch all photos for visible listings
  const [photosByListing, setPhotosByListing] = useState<Record<string, string[]>>({});
  useEffect(() => {
    const run = async () => {
      const listingIds = Array.from(new Set(listings.map(l => l.listing_id).filter(Boolean)));
      if (listingIds.length === 0) { setPhotosByListing({}); return; }
      const { data, error } = await supabase
        .from('listing_photos')
        .select('listing_id,url,sort_order,is_cover')
        .in('listing_id', listingIds)
        .order('is_cover', { ascending: false })
        .order('sort_order', { ascending: true });
      if (error) { console.error('photo query error', error); return; }
      const grouped: Record<string, string[]> = {};
      (data || []).forEach((p: any) => {
        const id = p.listing_id as string;
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push(p.url as string);
      });
      setPhotosByListing(grouped);
    };
    run();
  }, [listings]);

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
      photos: photosByListing[listing.listing_id]?.length ? photosByListing[listing.listing_id] : (listing.cover_photo_url ? [listing.cover_photo_url] : ['/placeholder.svg']),
      room_slug: listing.slug,
      geo: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined,
      formatted_address: (listing as any).formatted_address
    }));
  }, [listings, photosByListing]);

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

  const city = searchParams.get('city');

  return (
    <div className="min-h-screen bg-background">
      {/* Filter Bar */}
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      {/* Results Counter */}
      <div className="container mx-auto px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Πάνω από {listings.length} καταλύματα{city ? ` - ${city}` : ''}
        </p>
      </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => (
                <ListingCard
                  key={listing.room_id}
                  listing={listing}
                  photos={photosByListing[listing.listing_id]}
                  currentUserProfileExtras={currentUserProfile?.profile_extras}
                  hoveredListingId={hoveredListingId}
                  selectedListingId={selectedListingId}
                  onHover={handleListingHover}
                  onClick={handleListingClick}
                />
                ))}
              </div>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;