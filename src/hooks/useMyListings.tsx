import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MyListing {
  id: string;
  title: string;
  price_month: number;
  city: string;
  neighborhood: string;
  status: string;
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

export const useMyListings = () => {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: async (): Promise<MyListing[]> => {
      const { data: listings, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my listings:', error);
        throw error;
      }

      return (listings || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        price_month: listing.price_month,
        city: listing.city,
        neighborhood: listing.neighborhood,
        status: listing.status,
        created_at: listing.created_at,
        availability_date: listing.availability_date,
        flatmates_count: listing.flatmates_count,
        couples_accepted: listing.couples_accepted,
        pets_allowed: listing.pets_allowed,
        cover_photo_url: listing.rooms?.[0]?.room_photos?.[0]?.url,
        room_count: listing.rooms?.length || 0,
        view_count: listing.rooms?.[0]?.room_stats?.[0]?.view_count || 0,
        request_count: listing.rooms?.[0]?.room_stats?.[0]?.request_count || 0,
      }));
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
};