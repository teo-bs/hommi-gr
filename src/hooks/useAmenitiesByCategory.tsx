import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAmenitiesByCategory = (category: 'room' | 'property') => {
  return useQuery({
    queryKey: ['amenities', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amenities')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 300000, // 5 minutes
  });
};
