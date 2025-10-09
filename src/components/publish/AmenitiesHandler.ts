import { supabase } from "@/integrations/supabase/client";

interface ListingDraft {
  amenities_property: string[];
  amenities_room: string[];
  [key: string]: any;
}

// Helper to map amenity keys to IDs
const mapAmenityKeysToIds = async (keys: string[]): Promise<string[]> => {
  if (!keys || keys.length === 0) return [];
  
  const { data } = await supabase
    .from('amenities')
    .select('id, key')
    .in('key', keys)
    .eq('is_active', true);
  
  return data?.map(a => a.id) || [];
};

export const handleAmenitiesUpdate = async (listingId: string, draft: ListingDraft) => {
  try {
    // Handle property amenities
    if (draft.amenities_property?.length > 0) {
      // Map amenity keys to IDs
      const propertyAmenityIds = await mapAmenityKeysToIds(draft.amenities_property);

      if (propertyAmenityIds.length > 0) {
        // Clear existing property amenities
        await supabase
          .from('listing_amenities')
          .delete()
          .eq('listing_id', listingId);

        // Insert new property amenities
        const amenityInserts = propertyAmenityIds.map(amenityId => ({
          listing_id: listingId,
          amenity_id: amenityId,
          scope: 'property'
        }));

        await supabase
          .from('listing_amenities')
          .insert(amenityInserts);
      }
    }

    // Handle room amenities
    if (draft.amenities_room?.length > 0) {
      // Find the room for this listing
      const { data: room } = await supabase
        .from('rooms')
        .select('id')
        .eq('listing_id', listingId)
        .maybeSingle();

      if (room) {
        // Map amenity keys to IDs
        const roomAmenityIds = await mapAmenityKeysToIds(draft.amenities_room);

        if (roomAmenityIds.length > 0) {
          // Clear existing room amenities
          await supabase
            .from('room_amenities')
            .delete()
            .eq('room_id', room.id);

          // Insert new room amenities
          const roomAmenityInserts = roomAmenityIds.map(amenityId => ({
            room_id: room.id,
            amenity_id: amenityId
          }));

          await supabase
            .from('room_amenities')
            .insert(roomAmenityInserts);
        }
      }
    }
  } catch (error) {
    console.error('Error handling amenities update:', error);
    // Don't throw - amenities are not critical for listing creation
  }
};