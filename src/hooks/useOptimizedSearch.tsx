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
  flatmates_count: number;
  couples_accepted: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  bills_included: boolean;
  lat?: number;
  lng?: number;
  cover_photo_url?: string;
  kyc_status?: string;
  lister_type?: string;
  amenity_keys?: string[];
  formatted_address?: string;
}

export interface SearchFilters {
  budget?: { min?: number; max?: number };
  flatmates?: number;
  space?: string;
  roomType?: string;
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
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface UseOptimizedSearchProps {
  filters: SearchFilters;
  enabled?: boolean;
}

export const useOptimizedSearch = ({ filters, enabled = true }: UseOptimizedSearchProps) => {
  return useQuery({
    queryKey: ['optimized-search', filters],
    queryFn: async (): Promise<OptimizedListing[]> => {
      let query = supabase
        .from('room_search_cache')
        .select('*');

  // Apply filters
  if (filters.budget?.min) {
    query = query.gte('price_month', filters.budget.min);
  }
  if (filters.budget?.max) {
    query = query.lte('price_month', filters.budget.max);
  }
  if (filters.flatmates !== undefined) {
    query = query.eq('flatmates_count', filters.flatmates);
  }
  if (filters.couplesAccepted !== undefined) {
    query = query.eq('couples_accepted', filters.couplesAccepted);
  }
  if (filters.petsAllowed !== undefined) {
    query = query.eq('pets_allowed', filters.petsAllowed);
  }
  if (filters.billsIncluded !== undefined) {
    query = query.eq('bills_included', filters.billsIncluded);
  }
  if (filters.verifiedLister) {
    query = query.eq('kyc_status', 'approved');
  }
  if (filters.listerType) {
    query = query.eq('lister_type', filters.listerType);
  }
  if (filters.moveInDate) {
    query = query.gte('availability_date', filters.moveInDate.toISOString().split('T')[0]);
  }
  if (filters.duration) {
    if (filters.duration > 0) {
      query = query.lte('min_stay_months', filters.duration);
    }
  }
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains('amenity_keys', filters.amenities);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }

      // Geographic bounds filtering
      if (filters.bounds) {
        const { north, south, east, west } = filters.bounds;
        query = query
          .gte('lat', south)
          .lte('lat', north)
          .gte('lng', west)
          .lte('lng', east);
      }

      // Full-text search on title/neighborhood
      if (filters.searchText && filters.searchText.trim()) {
        const searchTerm = `%${filters.searchText.trim().toLowerCase()}%`;
        query = query.or(`title.ilike.${searchTerm},neighborhood.ilike.${searchTerm},city.ilike.${searchTerm}`);
      }

      // Apply sorting
      switch (filters.sort) {
        case 'price_low':
          query = query.order('price_month', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_month', { ascending: false });
          break;
        default:
          // Default: featured
          query = query.order('price_month', { ascending: true });
          break;
      }

      // Limit results for performance
      query = query.limit(100);

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      return data || [];
    },
    enabled,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};