import { supabase } from "@/integrations/supabase/client";

export type ResolutionAction = 'replaced' | 'deleted' | 'fixed_automatically';

/**
 * Mark a broken photo as resolved in the database
 */
export async function resolveBrokenPhoto(
  photoUrl: string, 
  action: ResolutionAction
): Promise<void> {
  try {
    await supabase
      .from('broken_photos_log')
      .update({
        resolved_at: new Date().toISOString(),
        resolution_action: action
      })
      .eq('photo_url', photoUrl)
      .is('resolved_at', null); // Only update unresolved entries

    console.log('Marked photo as resolved:', { photoUrl, action });
  } catch (error) {
    console.error('Error resolving broken photo:', error);
  }
}

/**
 * Mark multiple broken photos as resolved
 */
export async function resolveBrokenPhotos(
  photoUrls: string[], 
  action: ResolutionAction
): Promise<void> {
  try {
    await supabase
      .from('broken_photos_log')
      .update({
        resolved_at: new Date().toISOString(),
        resolution_action: action
      })
      .in('photo_url', photoUrls)
      .is('resolved_at', null);

    console.log('Marked photos as resolved:', { count: photoUrls.length, action });
  } catch (error) {
    console.error('Error resolving broken photos:', error);
  }
}

/**
 * Get broken photo URLs for a specific room
 */
export async function getBrokenPhotosForRoom(roomId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('broken_photos_log')
      .select('photo_url')
      .eq('room_id', roomId)
      .is('resolved_at', null);

    return data?.map(row => row.photo_url) || [];
  } catch (error) {
    console.error('Error fetching broken photos:', error);
    return [];
  }
}
