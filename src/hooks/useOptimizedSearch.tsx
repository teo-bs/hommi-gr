import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedListing {
  room_id: string;
  slug: string;
  listing_id: string;
  title: string;
  price_month: number;
  city: string;
  neighborhood: string;
  availability_date: string;
  availability_to?: string;
  min_stay_months?: number;
  max_stay_months?: number;
  flatmates_count: number;
  couples_accepted: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  bills_included: boolean;
  room_type: string;
  lat?: number;
  lng?: number;
  cover_photo_url?: string;
  photos?: string[];
  kyc_status?: string;
  lister_type?: string;
  amenity_keys?: string[];
  formatted_address?: string;
  published_at?: string;
  listing_created_at?: string;
  
  // Lister data
  lister_profile_id?: string;
  lister_avatar_url?: string;
  lister_first_name?: string;
  lister_score?: number;
  verifications_json?: any;
  lister_profile_extras?: any;
  audience_preferences?: any;
}

export interface SearchFilters {
  budget?: { min?: number; max?: number };
  flatmates?: number;
  couplesAccepted?: boolean;
  petsAllowed?: boolean;
  billsIncluded?: boolean;
  verifiedLister?: boolean;
  listerType?: 'individual' | 'agency';
  amenities?: string[];
  moveInDate?: Date;
  duration?: number;
  city?: string;
  searchText?: string;
  sort?: string;
  bedType?: string[];
  houseRules?: string[];
  propertySize?: { min: number; max: number };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  page?: number;
  pageSize?: number;
}

interface UseOptimizedSearchProps {
  filters: SearchFilters;
  enabled?: boolean;
}

interface SearchResult {
  data: OptimizedListing[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: any;
}

export const useOptimizedSearch = ({ filters, enabled = true }: UseOptimizedSearchProps): SearchResult => {
  const pageSize = filters.pageSize ?? 24;
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Combined count + data query for better performance

  // Data query with count
  const { data: result, isLoading, error } = useQuery({
    queryKey: ['optimized-search', filters, page],
    queryFn: async (): Promise<{ data: OptimizedListing[], count: number }> => {
      let query = supabase
        .from('room_search_cache')
        .select('*', { count: 'exact' });

      // Apply all filters
      query = applyFilters(query, filters);

      // Stable sorting BEFORE pagination
      switch (filters.sort) {
        case 'newest':
          query = query.order('published_at', { ascending: false, nullsFirst: false })
                       .order('listing_created_at', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price_month', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_month', { ascending: false });
          break;
        default: // 'featured'
          query = query.order('price_month', { ascending: true });
          break;
      }

      // Pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      return { data: data || [], count: count ?? 0 };
    },
    enabled,
    staleTime: 5 * 60 * 1000,  // 5 minutes for aggressive caching
    gcTime: 15 * 60 * 1000,    // 15 minutes to keep in memory
    placeholderData: (previousData) => previousData,  // Keep old data while fetching
  });

  return {
    data: result?.data ?? [],
    totalCount: result?.count ?? 0,
    page,
    pageSize,
    isLoading,
    error,
  };
};

// Helper function to apply filters to a query
function applyFilters(query: any, filters: SearchFilters) {
  // CRITICAL: Only show listings with published_at set
  query = query.not('published_at', 'is', null);
  
  // Budget
  if (filters.budget?.min != null) {
    query = query.gte('price_month', filters.budget.min);
  }
  if (filters.budget?.max != null) {
    query = query.lte('price_month', filters.budget.max);
  }

  // Flatmates
  if (filters.flatmates !== undefined) {
    query = query.eq('flatmates_count', filters.flatmates);
  }

  // House rules
  if (filters.couplesAccepted !== undefined) {
    query = query.eq('couples_accepted', filters.couplesAccepted);
  }
  if (filters.petsAllowed !== undefined) {
    query = query.eq('pets_allowed', filters.petsAllowed);
  }

  // Bills included
  if (filters.billsIncluded !== undefined) {
    query = query.eq('bills_included', filters.billsIncluded);
  }

  // Verified lister
  if (filters.verifiedLister) {
    query = query.eq('kyc_status', 'approved');
  }

  // Lister type
  if (filters.listerType) {
    query = query.eq('lister_type', filters.listerType);
  }

  // Availability date with open-ended support
  if (filters.moveInDate) {
    const dateStr = filters.moveInDate.toISOString().split('T')[0];
    query = query.lte('availability_date', dateStr);
    // Open-ended: availability_to IS NULL OR availability_to >= date
    query = query.or(`availability_to.is.null,availability_to.gte.${dateStr}`);
  }

  // Duration (min_stay_months constraint)
  if (filters.duration) {
    query = query.or(`min_stay_months.is.null,min_stay_months.lte.${filters.duration}`);
  }

  // City
  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  // Amenities (ANY-of using overlaps)
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.overlaps('amenity_keys', filters.amenities);
  }

  // Map bounds
  if (filters.bounds) {
    const { north, south, east, west } = filters.bounds;
    query = query
      .gte('lat', south)
      .lte('lat', north)
      .gte('lng', west)
      .lte('lng', east);
  }

  // Full-text search on title/neighborhood/city
  if (filters.searchText && filters.searchText.trim()) {
    const searchTerm = `%${filters.searchText.trim().toLowerCase()}%`;
    query = query.or(`title.ilike.${searchTerm},neighborhood.ilike.${searchTerm},city.ilike.${searchTerm}`);
  }

  return query;
}
