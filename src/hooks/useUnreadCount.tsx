import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUnreadCount() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    if (!profile?.id) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch threads where user is participant
      const { data, error } = await supabase
        .from('threads')
        .select('host_id, seeker_id, unread_count_host, unread_count_seeker')
        .or(`host_id.eq.${profile.id},seeker_id.eq.${profile.id}`)
        .is('deleted_at', null)
        .range(0, 199); // Cap at 200 threads for performance

      if (error || !data) {
        setUnreadCount(0);
        return;
      }

      // Sum unread counts based on user role in each thread
      let total = 0;
      for (const thread of data) {
        if (thread.host_id === profile.id) {
          total += thread.unread_count_host ?? 0;
        }
        if (thread.seeker_id === profile.id) {
          total += thread.unread_count_seeker ?? 0;
        }
      }

      setUnreadCount(total);
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [profile?.id]);

  // Subscribe to thread updates (for unread count changes)
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('unread-count-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'threads'
      }, () => {
        // Refetch unread count on any thread change
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  return { unreadCount, isLoading, refetch: fetchUnreadCount };
}
