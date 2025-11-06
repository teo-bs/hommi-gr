import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export function useMessageReactions(messageId: string) {
  const { profile } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReactions = async () => {
    if (!messageId) return;

    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    setReactions(data || []);
  };

  const addReaction = async (emoji: string) => {
    if (!profile?.id || !messageId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: profile.id,
          reaction: emoji
        });

      if (error) throw error;
      await fetchReactions();
    } catch (err: any) {
      console.error('Error adding reaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeReaction = async (reactionId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', reactionId);

      if (error) throw error;
      await fetchReactions();
    } catch (err: any) {
      console.error('Error removing reaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReactions();

    const channel = supabase
      .channel(`reactions:${messageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
        filter: `message_id=eq.${messageId}`
      }, () => {
        fetchReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId]);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = [];
    }
    acc[reaction.reaction].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return {
    reactions: groupedReactions,
    addReaction,
    removeReaction,
    isLoading,
    userReactions: reactions.filter(r => r.user_id === profile?.id)
  };
}
