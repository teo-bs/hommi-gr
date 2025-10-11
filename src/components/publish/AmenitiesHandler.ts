import { supabase } from "@/integrations/supabase/client";
import { mapGreekArrayToKeys } from "./GreekAmenityMapper";

interface ListingDraft {
  amenities_property: string[];
  amenities_room: string[];
  [key: string]: any;
}

// Helper to map amenity keys (or Greek labels) to IDs
const mapAmenityKeysToIds = async (keys: string[]): Promise<string[]> => {
  if (!keys || keys.length === 0) return [];
  
  // First convert Greek labels to database keys
  const dbKeys = mapGreekArrayToKeys(keys, false);
  
  if (dbKeys.length === 0) {
    console.warn('No valid amenity keys after Greek mapping:', keys);
    return [];
  }
  
  const { data, error } = await supabase
    .from('amenities')
    .select('id, key')
    .in('key', dbKeys)
    .eq('is_active', true);
  
  if (error) {
    console.error('❌ Error fetching amenity IDs:', error);
    return [];
  }
  
  // Enhanced logging for debugging
  console.log('🔍 Amenity Mapping Debug:', { 
    originalLabels: keys,
    mappedDbKeys: dbKeys,
    foundInDB: data?.map(a => a.key) || [],
    notFoundInDB: dbKeys.filter(k => !data?.some(a => a.key === k)),
    finalIds: data?.map(a => ({ key: a.key, id: a.id })) || []
  });
  
  if (dbKeys.length > 0 && (!data || data.length === 0)) {
    console.warn('⚠️ No amenities found in DB for keys:', dbKeys);
  }
  
  return data?.map(a => a.id) || [];
};

export const handleAmenitiesUpdate = async (listingId: string, draft: ListingDraft) => {
  console.log('🔧 Starting amenities update for listing:', listingId);
  console.log('📦 Draft amenities:', { 
    property: draft.amenities_property, 
    room: draft.amenities_room 
  });

  try {
    // Handle property amenities
    if (draft.amenities_property?.length > 0) {
      // Map amenity keys to IDs
      const propertyAmenityIds = await mapAmenityKeysToIds(draft.amenities_property);
      console.log('✅ Mapped property amenity IDs:', propertyAmenityIds);

      if (propertyAmenityIds.length > 0) {
        // Clear existing property amenities
        const { error: deleteError } = await supabase
          .from('listing_amenities')
          .delete()
          .eq('listing_id', listingId);

        if (deleteError) {
          console.error('❌ Error deleting old property amenities:', deleteError);
          throw deleteError;
        }

        // Insert new property amenities (without scope - it's nullable)
        const amenityInserts = propertyAmenityIds.map(amenityId => ({
          listing_id: listingId,
          amenity_id: amenityId
        }));

        const { error: insertError } = await supabase
          .from('listing_amenities')
          .insert(amenityInserts);

        if (insertError) {
          console.error('❌ Error inserting property amenities:', insertError);
          throw insertError;
        }

        console.log('✅ Property amenities saved successfully');
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
        console.log('✅ Mapped room amenity IDs:', roomAmenityIds);

        if (roomAmenityIds.length > 0) {
          // Clear existing room amenities
          const { error: deleteError } = await supabase
            .from('room_amenities')
            .delete()
            .eq('room_id', room.id);

          if (deleteError) {
            console.error('❌ Error deleting old room amenities:', deleteError);
            throw deleteError;
          }

          // Insert new room amenities
          const roomAmenityInserts = roomAmenityIds.map(amenityId => ({
            room_id: room.id,
            amenity_id: amenityId
          }));

          const { error: insertError } = await supabase
            .from('room_amenities')
            .insert(roomAmenityInserts);

          if (insertError) {
            console.error('❌ Error inserting room amenities:', insertError);
            throw insertError;
          }

          console.log('✅ Room amenities saved successfully');
        }
      } else {
        console.warn('⚠️ No room found for listing, skipping room amenities');
      }
    }

    console.log('✅ Amenities update completed successfully');
  } catch (error) {
    console.error('❌ Critical error in handleAmenitiesUpdate:', error);
    throw error; // Re-throw so publish flow knows it failed
  }
};