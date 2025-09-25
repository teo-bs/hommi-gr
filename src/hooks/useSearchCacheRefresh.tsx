import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSearchCacheRefresh = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('refresh-search-cache');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      console.log('Search cache refreshed successfully');
    },
    onError: (error) => {
      console.error('Failed to refresh search cache:', error);
    },
  });
};