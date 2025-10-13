import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { getUserRoleInThread } from '@/lib/inbox';

interface MessagesParams {
  threadId: string;
  pageSize?: number;
}

export function useThreadMessages(params: MessagesParams) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);

  const pageSize = params.pageSize || 30;
  const threadId = params.threadId;

  const isNearBottom = () => {
    if (!scrollRef.current) return true;
    const threshold = 100;
    const position = scrollRef.current.scrollTop + scrollRef.current.clientHeight;
    const height = scrollRef.current.scrollHeight;
    return height - position < threshold;
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchMessages = async (pageNum: number, append = false) => {
    if (!threadId) return;

    setIsLoading(true);

    try {
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          body,
          sender_id,
          created_at,
          sender:profiles!messages_sender_id_fkey(display_name, avatar_url, verifications_json)
        `)
        .eq('thread_id', threadId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .range(from, to);

      if (error) throw error;

      if (append) {
        setMessages(prev => [...(data || []), ...prev]);
      } else {
        setMessages(data || []);
      }

      setHasMore((data || []).length === pageSize);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage, true);
  };

  // Initial load
  useEffect(() => {
    setPage(1);
    setMessages([]);
    fetchMessages(1, false);

    // Reset unread count
    if (profile?.id && threadId) {
      const resetUnread = async () => {
        const { data: thread } = await supabase
          .from('threads')
          .select('host_id, seeker_id')
          .eq('id', threadId)
          .single();

        if (thread) {
          const userRole = thread.host_id === profile.id ? 'host' : 'seeker';
          await supabase.rpc('reset_unread_count', {
            p_thread_id: threadId,
            p_user_role: userRole
          });
        }
      };
      resetUnread();
    }
  }, [threadId, profile?.id]);

  // Auto-scroll on initial load
  useEffect(() => {
    if (messages.length > 0 && page === 1) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, page]);

  // Realtime subscription
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`messages:thread:${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`
      }, (payload) => {
        const newMessage = payload.new;
        
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        // Smart scroll
        if (newMessage.sender_id === profile?.id || isNearBottom()) {
          setTimeout(scrollToBottom, 100);
          setShowNewMessageBadge(false);
        } else {
          setShowNewMessageBadge(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, profile?.id]);

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    scrollRef,
    showNewMessageBadge,
    setShowNewMessageBadge,
    scrollToBottom
  };
}
