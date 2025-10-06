import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OverviewStats {
  activeListings: number;
  totalViews: number;
  newMessages: number;
  monthlyVisits: number;
  recentListings: {
    id: string;
    title: string;
    status: 'draft' | 'published' | 'archived';
    views: number;
    created_at: string;
  }[];
}

export const useOverviewStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['overview-stats', profile?.id],
    queryFn: async (): Promise<OverviewStats> => {
      if (!profile?.id) {
        return {
          activeListings: 0,
          totalViews: 0,
          newMessages: 0,
          monthlyVisits: 0,
          recentListings: []
        };
      }

      // Get listing counts by status
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          status,
          created_at,
          rooms (
            id,
            room_stats (
              view_count
            )
          )
        `)
        .eq('owner_id', profile.id);

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        throw listingsError;
      }

      const activeListings = listings?.filter(l => l.status === 'published').length || 0;
      
      // Calculate total views from all rooms
      const totalViews = (listings || []).reduce((total, listing) => {
        const rooms: any[] = Array.isArray(listing.rooms)
          ? (listing.rooms as any[])
          : (listing.rooms ? [listing.rooms] : []);
        const roomViews = rooms.reduce((roomTotal, room) => {
          const statsArr = Array.isArray(room.room_stats)
            ? room.room_stats
            : (room.room_stats ? [room.room_stats] : []);
          return roomTotal + (statsArr[0]?.view_count || 0);
        }, 0);
        return total + roomViews;
      }, 0);

      // Get message count (from threads where user is host)
      const { data: userThreads } = await supabase
        .from('threads')
        .select('id')
        .eq('host_id', profile.id);

      const threadIds = userThreads?.map(t => t.id) || [];
      let messageCount = 0;
      
      if (threadIds.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('thread_id', threadIds);
        messageCount = count || 0;
      }

      // Get recent listings (last 5)
      const recentListings = (listings || [])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(listing => {
          const rooms: any[] = Array.isArray(listing.rooms)
            ? (listing.rooms as any[])
            : (listing.rooms ? [listing.rooms] : []);
          const views = rooms.reduce((total, room) => {
            const statsArr = Array.isArray(room.room_stats)
              ? room.room_stats
              : (room.room_stats ? [room.room_stats] : []);
            return total + (statsArr[0]?.view_count || 0);
          }, 0);
          return {
            id: listing.id,
            title: listing.title,
            status: listing.status as 'draft' | 'published' | 'archived',
            views,
            created_at: listing.created_at
          };
        });

      return {
        activeListings,
        totalViews,
        newMessages: messageCount,
        monthlyVisits: totalViews, // For now, using total views as monthly visits
        recentListings
      };
    },
    enabled: !!profile?.id,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });
};