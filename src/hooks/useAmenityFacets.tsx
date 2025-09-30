import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AmenityFacet {
  amenity_key: string;
  name_en: string;
  name_el: string;
  icon: string;
  category: string;
  listing_count: number;
}

export const useAmenityFacets = () => {
  return useQuery({
    queryKey: ['amenity-facets'],
    queryFn: async (): Promise<AmenityFacet[]> => {
      const { data, error } = await supabase
        .from('amenities')
        .select('key, name_en, name_el, icon, category')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Amenity facets error:', error);
        throw error;
      }

      return (data || []).map(item => ({
        amenity_key: item.key,
        name_en: item.name_en || '',
        name_el: item.name_el || item.name_en || '',
        icon: item.icon,
        category: item.category,
        listing_count: 0
      }));
    },
    staleTime: 300000, // 5 minutes
  });
};
