// Maps Greek amenity labels from UI to database keys
// IMPORTANT: All keys must match the 'key' column in the amenities table
export const GREEK_TO_KEY_MAP: Record<string, string> = {
  // Property amenities
  'WiFi': 'wifi',
  'Wi-Fi': 'wifi',  // Handle both with and without hyphen
  'Τηλεόραση': 'tv',
  'Κουζίνα': 'kitchen',
  'Πλυντήριο ρούχων': 'washer',
  'Πλυντήριο πιάτων': 'dishwasher',
  'Ιδιωτικό πάρκινγκ': 'private_parking',
  'Πάρκινγκ στην ιδιοκτησία με πληρωμή': 'paid_parking',
  'Κλιματισμός': 'air_conditioning',
  'Ειδικός χώρος εργασίας': 'dedicated_workspace',
  'Μπαλκόνι': 'balcony',
  'Θέρμανση': 'heating',
  'Ψησταριά μπάρμπεκιου': 'bbq_grill',
  'Υπαίθρια τραπεζαρία': 'outdoor_dining',
  'Τζάκι': 'indoor_fireplace',
  'Εξοπλισμός γυμναστικής': 'gym',
  'Καθαρισμός': 'cleaning',
  
  // Room amenities
  'Ιδιωτικό μπάνιο': 'private_bathroom',
  'Κλιματισμός δωματίου': 'air_conditioning',  // Same as property AC
  'Γραφείο': 'desk',
  'Καρέκλα': 'chair',
  'Ντουλάπα': 'wardrobe',
  'Συρτάρια': 'drawers',
  'Καθρέφτης': 'mirror',
  'Κουρτίνες': 'curtains',
  'Φωτισμός γραφείου': 'desk_lamp',
};

// Maps Greek house rule labels to database keys
export const GREEK_HOUSE_RULE_MAP: Record<string, string> = {
  'Όχι κάπνισμα': 'no_smoking',
  'Όχι κατοικίδια': 'no_pets',
  'Όχι επισκέπτες αργά': 'no_late_visitors',
  'Όχι πάρτι': 'no_parties',
  'Ησυχία μετά τις 22:00': 'quiet_after_10pm',
  'Καθαριότητα κοινόχρηστων χώρων': 'clean_common_areas',
  'Μοίρασμα λογαριασμών': 'share_bills',
};

/**
 * Convert Greek amenity label to database key
 * Now with case-insensitive and whitespace-trimming for robustness
 */
export function mapGreekAmenityToKey(greekLabel: string): string | null {
  if (!greekLabel) return null;
  
  const trimmed = greekLabel.trim();
  
  // Check if it's already a key (lowercase, no spaces, short)
  if (trimmed.length < 50 && !trimmed.includes(' ') && trimmed === trimmed.toLowerCase()) {
    return trimmed;
  }
  
  // Try exact match first
  if (GREEK_TO_KEY_MAP[trimmed]) {
    return GREEK_TO_KEY_MAP[trimmed];
  }
  
  // Try case-insensitive match
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(GREEK_TO_KEY_MAP)) {
    if (key.toLowerCase() === lowerTrimmed) {
      return value;
    }
  }
  
  console.warn(`⚠️ No mapping found for amenity: "${greekLabel}"`);
  return null;
}

/**
 * Convert Greek house rule label to database key
 */
export function mapGreekHouseRuleToKey(greekLabel: string): string | null {
  // Check if it's already a key
  if (greekLabel && greekLabel.length < 50 && !greekLabel.includes(' ')) {
    return greekLabel;
  }
  return GREEK_HOUSE_RULE_MAP[greekLabel] || null;
}

/**
 * Convert array of Greek labels to database keys, filtering out nulls
 */
export function mapGreekArrayToKeys(greekLabels: string[], isHouseRule = false): string[] {
  return greekLabels
    .map(label => isHouseRule ? mapGreekHouseRuleToKey(label) : mapGreekAmenityToKey(label))
    .filter((key): key is string => key !== null);
}
