import { supabase } from "@/integrations/supabase/client";

/**
 * Log a broken photo URL to the database for lister notification
 */
export async function logBrokenPhoto(roomId: string, photoUrl: string): Promise<void> {
  try {
    // Get the lister_id from the room's listing
    const { data: room } = await supabase
      .from('rooms')
      .select('listing_id')
      .eq('id', roomId)
      .single();

    if (!room) return;

    const { data: listing } = await supabase
      .from('listings')
      .select('owner_id')
      .eq('id', room.listing_id)
      .single();

    if (!listing) return;

    // Insert broken photo log (will ignore if duplicate due to unique constraint)
    await supabase
      .from('broken_photos_log')
      .insert({
        room_id: roomId,
        photo_url: photoUrl,
        lister_id: listing.owner_id
      })
      .select()
      .single();

    console.log('Logged broken photo:', { roomId, photoUrl });
  } catch (error) {
    // Silently fail - logging is not critical
    console.error('Error logging broken photo:', error);
  }
}
