import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MyListing {
  id: string;
  title: string;
  price_month: number;
  city: string;
  neighborhood: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  availability_date: string;
  flatmates_count: number;
  couples_accepted: boolean;
  pets_allowed: boolean;
  cover_photo_url?: string;
  room_count: number;
  view_count: number;
  request_count: number;
}

export const useMyListings = (status?: 'draft' | 'published' | 'archived') => {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['my-listings', status, profile?.id],
    queryFn: async (): Promise<MyListing[]> => {
      if (!profile?.id) return [];

      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          price_month,
          city,
          neighborhood,
          status,
          created_at,
          availability_date,
          flatmates_count,
          couples_accepted,
          pets_allowed,
          photos,
          rooms (
            id,
            room_photos (
              url,
              sort_order
            ),
            room_stats (
              view_count,
              request_count
            )
          )
        `)
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data: listings, error } = await query;

      if (error) {
        console.error('Error fetching my listings:', error);
        throw error;
      }

      return (listings || []).map(listing => {
        // Use room_photos if available (published), otherwise fall back to listings.photos (draft)
        const roomPhoto = listing.rooms?.[0]?.room_photos?.[0]?.url;
        
        // Handle JSONB photos array for drafts
        let draftPhoto: string | undefined;
        if (listing.photos) {
          const photosArray = Array.isArray(listing.photos) 
            ? listing.photos 
            : (typeof listing.photos === 'string' ? JSON.parse(listing.photos) : []);
          draftPhoto = photosArray.length > 0 ? String(photosArray[0]) : undefined;
        }
        
        return {
          id: listing.id,
          title: listing.title,
          price_month: listing.price_month,
          city: listing.city,
          neighborhood: listing.neighborhood,
          status: listing.status as 'draft' | 'published' | 'archived',
          created_at: listing.created_at,
          availability_date: listing.availability_date,
          flatmates_count: listing.flatmates_count,
          couples_accepted: listing.couples_accepted,
          pets_allowed: listing.pets_allowed,
          cover_photo_url: roomPhoto || draftPhoto,
          room_count: listing.rooms?.length || 0,
          view_count: listing.rooms?.[0]?.room_stats?.[0]?.view_count || 0,
          request_count: listing.rooms?.[0]?.room_stats?.[0]?.request_count || 0,
        };
      });
    },
    enabled: !!profile?.id,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};