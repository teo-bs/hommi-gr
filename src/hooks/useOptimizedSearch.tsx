import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OptimizedListing {
  room_id: string;
  slug: string;
  title: string;
  price_month: number;
  city: string;
  neighborhood: string;
  availability_date: string;
  flatmates_count: number;
  couples_accepted: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  lat?: number;
  lng?: number;
  cover_photo_url?: string;
  created_at: string;
  lister_name?: string;
  lister_verification?: string;
  lister_member_since?: string;
}

export interface SearchFilters {
  budget?: { min?: number; max?: number };
  flatmates?: number;
  space?: string;
  couplesAccepted?: boolean;
  petsAllowed?: boolean;
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

      // Full-text search
      if (filters.searchText && filters.searchText.trim()) {
        // Convert search text to tsquery format
        const searchQuery = filters.searchText
          .trim()
          .split(/\s+/)
          .map(term => term.replace(/[^\w]/g, ''))
          .filter(term => term.length > 0)
          .join(' & ');
        
        if (searchQuery) {
          query = query.textSearch('search_tsv', searchQuery);
        }
      }

      // Apply sorting
      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price_month', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_month', { ascending: false });
          break;
        case 'popular':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          // Default: featured - newest first
          query = query.order('created_at', { ascending: false });
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