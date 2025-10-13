import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatThreadForDisplay } from '@/lib/inbox';
import { useAuth } from './useAuth';

interface ThreadsParams {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'accepted' | 'declined' | 'all';
}

export function useThreads(params: ThreadsParams = {}) {
  const { profile } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const status = params.status || 'all';

  const fetchThreads = async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('threads')
        .select(`
          *,
          listing:listings!inner(id, title),
          host_profile:profiles!threads_host_id_fkey(id, display_name, avatar_url, verifications_json),
          seeker_profile:profiles!threads_seeker_id_fkey(id, display_name, avatar_url, verifications_json)
        `, { count: 'exact' })
        .is('deleted_at', null)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error: fetchError, count } = await query.range(from, to);

      if (fetchError) throw fetchError;

      const formatted = (data || []).map(thread => 
        formatThreadForDisplay(thread, profile.id)
      );

      setThreads(formatted);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching threads:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [profile?.id, page, pageSize, status]);

  // Realtime subscription for thread updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('user_threads')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'threads'
      }, (payload) => {
        // Refetch threads on any change
        fetchThreads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, page, pageSize, status]);

  return {
    threads,
    totalCount,
    isLoading,
    error,
    refetch: fetchThreads
  };
}
