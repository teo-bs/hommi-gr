import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

export function useTypingIndicator(threadId: string) {
  const { profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Broadcast typing status
  const setTyping = (typing: boolean) => {
    if (!profile || !threadId) return;
    
    setIsTyping(typing);
    
    const channel = supabase.channel(`typing:${threadId}`);
    
    if (typing) {
      channel.track({
        user_id: profile.id,
        user_name: profile.display_name || 'User',
        typing: true,
        timestamp: Date.now()
      });
    } else {
      channel.untrack();
    }
  };

  // Listen for typing status from others
  useEffect(() => {
    if (!threadId || !profile) return;

    const channel = supabase
      .channel(`typing:${threadId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];

        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            // Don't show own typing indicator
            if (presence.user_id !== profile.id && presence.typing) {
              users.push({
                userId: presence.user_id,
                userName: presence.user_name,
                timestamp: presence.timestamp
              });
            }
          });
        });

        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, profile?.id]);

  // Auto-clear stale typing indicators after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(user => now - user.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    typingUsers,
    isTyping,
    setTyping
  };
}
