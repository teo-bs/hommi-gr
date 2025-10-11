import { supabase } from "@/integrations/supabase/client";
import { mapGreekArrayToKeys } from "./GreekAmenityMapper";

interface ListingDraft {
  house_rules: string[];
  [key: string]: any;
}

// Helper to map house rule keys (or Greek labels) to IDs
const mapHouseRuleKeysToIds = async (keys: string[]): Promise<string[]> => {
  if (!keys || keys.length === 0) return [];
  
  // First convert Greek labels to database keys
  const dbKeys = mapGreekArrayToKeys(keys, true);
  
  if (dbKeys.length === 0) {
    console.warn('No valid house rule keys after Greek mapping:', keys);
    return [];
  }
  
  const { data, error } = await supabase
    .from('house_rule_types')
    .select('id, key')
    .in('key', dbKeys)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching house rule IDs:', error);
    return [];
  }
  
  console.log(`Mapped ${keys.length} house rule labels to ${data?.length || 0} IDs:`, { 
    input: keys, 
    dbKeys, 
    foundIds: data?.map(r => r.key) 
  });
  
  return data?.map(r => r.id) || [];
};

export const handleHouseRulesUpdate = async (listingId: string, draft: ListingDraft) => {
  try {
    if (!draft.house_rules || draft.house_rules.length === 0) {
      // Clear all house rules if none provided
      await supabase
        .from('listing_house_rules')
        .delete()
        .eq('listing_id', listingId);
      
      console.log('Cleared all house rules for listing:', listingId);
      return;
    }

    // Map Greek labels to rule IDs
    const ruleIds = await mapHouseRuleKeysToIds(draft.house_rules);

    if (ruleIds.length === 0) {
      console.warn('No valid house rule IDs found for:', draft.house_rules);
      return;
    }

    // Clear existing house rules
    await supabase
      .from('listing_house_rules')
      .delete()
      .eq('listing_id', listingId);

    // Insert new house rules
    const ruleInserts = ruleIds.map(ruleId => ({
      listing_id: listingId,
      rule_id: ruleId
    }));

    const { error } = await supabase
      .from('listing_house_rules')
      .insert(ruleInserts);

    if (error) {
      console.error('Error inserting house rules:', error);
    } else {
      console.log(`Saved ${ruleIds.length} house rules for listing ${listingId}`);
    }
  } catch (error) {
    console.error('Error handling house rules update:', error);
    // Don't throw - house rules are not critical for listing creation
  }
};
