import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useListingsCount = () => {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingsCount = async () => {
      if (!profile) {
        setCount(0);
        setLoading(false);
        return;
      }

      try {
        const { count: listingsCount, error } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', profile.id)
          .in('status', ['draft', 'published']);

        if (error) {
          console.error('Error fetching listings count:', error);
          setCount(0);
        } else {
          setCount(listingsCount || 0);
        }
      } catch (error) {
        console.error('Error fetching listings count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchListingsCount();
  }, [profile]);

  return { count, loading };
};