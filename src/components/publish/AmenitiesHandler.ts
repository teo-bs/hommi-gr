import { supabase } from "@/integrations/supabase/client";

interface ListingDraft {
  amenities_property: string[];
  amenities_room: string[];
  [key: string]: any;
}

export const handleAmenitiesUpdate = async (listingId: string, draft: ListingDraft) => {
  try {
    // Handle property amenities
    if (draft.amenities_property?.length > 0) {
      // Get amenity IDs for property amenities
      const { data: propertyAmenities } = await supabase
        .from('amenities')
        .select('id, key')
        .in('key', draft.amenities_property.map(name => 
          // Convert display names to keys (simple mapping for now)
          name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
        ));

      if (propertyAmenities?.length > 0) {
        // Clear existing property amenities
        await supabase
          .from('listing_amenities')
          .delete()
          .eq('listing_id', listingId)
          .eq('scope', 'property');

        // Insert new property amenities
        const amenityInserts = propertyAmenities.map(amenity => ({
          listing_id: listingId,
          amenity_id: amenity.id,
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
        .single();

      if (room) {
        // Get amenity IDs for room amenities
        const { data: roomAmenities } = await supabase
          .from('amenities')
          .select('id, key')
          .in('key', draft.amenities_room.map(name =>
            // Convert display names to keys (simple mapping for now)
            name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
          ));

        if (roomAmenities?.length > 0) {
          // Clear existing room amenities
          await supabase
            .from('room_amenities')
            .delete()
            .eq('room_id', room.id);

          // Insert new room amenities
          const roomAmenityInserts = roomAmenities.map(amenity => ({
            room_id: room.id,
            amenity_id: amenity.id
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