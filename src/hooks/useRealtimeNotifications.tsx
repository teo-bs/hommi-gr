import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UseRealtimeNotificationsParams {
  activeThreadId?: string; // Don't show toast if message is in active thread
  onNewMessage?: () => void; // Callback to refetch unread count
}

export function useRealtimeNotifications(params: UseRealtimeNotificationsParams = {}) {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to new messages across all threads
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new as any;

        // Don't show toast if:
        // 1. User sent the message themselves
        // 2. Message is in the currently active thread
        if (newMessage.sender_id === profile.id) return;
        if (params.activeThreadId === newMessage.thread_id) return;

        // Fetch thread details to show in toast
        const { data: thread } = await supabase
          .from('threads')
          .select(`
            id,
            listing:listings(title),
            host_profile:profiles!threads_host_id_fkey(id, display_name),
            seeker_profile:profiles!threads_seeker_id_fkey(id, display_name)
          `)
          .eq('id', newMessage.thread_id)
          .single();

        if (thread) {
          const senderName = newMessage.sender_id === thread.host_profile?.id 
            ? thread.host_profile?.display_name 
            : thread.seeker_profile?.display_name;

          toast.info(`Νέο μήνυμα από ${senderName}`, {
            description: newMessage.body?.substring(0, 50) + (newMessage.body?.length > 50 ? '...' : ''),
            action: {
              label: 'Προβολή',
              onClick: () => {
                window.location.href = `/inbox?thread=${newMessage.thread_id}`;
              }
            }
          });
        }

        // Trigger refetch of unread count
        params.onNewMessage?.();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, params.activeThreadId]);
}
