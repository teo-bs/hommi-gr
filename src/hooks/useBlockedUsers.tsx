import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  reason?: string;
  created_at: string;
  blocked_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export function useBlockedUsers() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBlockedUsers = async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocked_user_id,
          reason,
          created_at,
          blocked_profile:profiles!blocked_users_blocked_user_id_fkey(
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching blocked users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string, reason?: string) => {
    if (!profile?.id) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: profile.id,
          blocked_user_id: userId,
          reason
        });

      if (error) throw error;

      toast({
        title: 'Χρήστης αποκλείστηκε',
        description: 'Δεν θα μπορείτε να επικοινωνήσετε πλέον'
      });

      await fetchBlockedUsers();
      return true;
    } catch (err: any) {
      console.error('Error blocking user:', err);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατός ο αποκλεισμός του χρήστη',
        variant: 'destructive'
      });
      return false;
    }
  };

  const unblockUser = async (blockedUserId: string) => {
    if (!profile?.id) return false;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', profile.id)
        .eq('blocked_user_id', blockedUserId);

      if (error) throw error;

      toast({
        title: 'Αποκλεισμός αφαιρέθηκε',
        description: 'Μπορείτε να επικοινωνήσετε ξανά με αυτόν τον χρήστη'
      });

      await fetchBlockedUsers();
      return true;
    } catch (err: any) {
      console.error('Error unblocking user:', err);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η αφαίρεση του αποκλεισμού',
        variant: 'destructive'
      });
      return false;
    }
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.some(b => b.blocked_user_id === userId);
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, [profile?.id]);

  return {
    blockedUsers,
    isLoading,
    blockUser,
    unblockUser,
    isUserBlocked,
    refetch: fetchBlockedUsers
  };
}
