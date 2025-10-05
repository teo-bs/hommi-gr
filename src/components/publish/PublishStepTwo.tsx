import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ListingDraft {
  property_type: 'room' | 'apartment';
  property_size_m2?: number;
  room_size_m2?: number;
  has_lift: boolean;
  bedrooms_single: number;
  bedrooms_double: number;
  bathrooms: number;
  wc_count: number;
  flatmates_count: number;
  i_live_here: boolean;
  orientation: 'exterior' | 'interior';
  has_bed?: boolean;
  bed_type?: string;
  amenities_property: string[];
  amenities_room: string[];
  house_rules: string[];
  [key: string]: any;
}

interface PublishStepTwoProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PROPERTY_AMENITIES = [
  'WiFi', 'Κλιματισμός', 'Θέρμανση', 'Πλυντήριο', 'Πλυντήριο πιάτων', 
  'Μπαλκόνι', 'Τερράτσα', 'Κήπος', 'Πάρκινγκ', 'Ασανσέρ', 'Ηλιακός θερμοσίφωνας'
];

const ROOM_AMENITIES = [
  'Ιδιωτικό μπάνιο', 'Κλιματισμός δωματίου', 'Μπαλκόνι', 'Γραφείο', 'Καρέκλα', 
  'Ντουλάπα', 'Συρτάρια', 'Καθρέφτης', 'Κουρτίνες', 'Φωτισμός γραφείου'
];

const HOUSE_RULES = [
  'Όχι κάπνισμα', 'Όχι κατοικίδια', 'Όχι επισκέπτες αργά', 'Ησυχία μετά τις 22:00', 
  'Καθαριότητα κοινόχρηστων χώρων', 'Όχι πάρτι', 'Μοίρασμα λογαριασμών'
];

const BED_TYPES = [
  'Μονό κρεβάτι', 'Διπλό κρεβάτι', 'Κουκέτα', 'Καναπέ-κρεβάτι', 'Χωρίς κρεβάτι'
];

export default function PublishStepTwo({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev 
}: PublishStepTwoProps) {
  // Local state for batching badge selections
  const [localAmenitiesProperty, setLocalAmenitiesProperty] = useState(draft.amenities_property || []);
  const [localAmenitiesRoom, setLocalAmenitiesRoom] = useState(draft.amenities_room || []);
  const [localHouseRules, setLocalHouseRules] = useState(draft.house_rules || []);
  
  const toggleAmenity = (amenity: string, type: 'property' | 'room') => {
    if (type === 'property') {
      const updated = localAmenitiesProperty.includes(amenity)
        ? localAmenitiesProperty.filter((a: string) => a !== amenity)
        : [...localAmenitiesProperty, amenity];
      setLocalAmenitiesProperty(updated);
    } else {
      const updated = localAmenitiesRoom.includes(amenity)
        ? localAmenitiesRoom.filter((a: string) => a !== amenity)
        : [...localAmenitiesRoom, amenity];
      setLocalAmenitiesRoom(updated);
    }
  };

  const toggleHouseRule = (rule: string) => {
    const updated = localHouseRules.includes(rule)
      ? localHouseRules.filter(r => r !== rule)
      : [...localHouseRules, rule];
    setLocalHouseRules(updated);
  };

  const handleNext = () => {
    // Commit local badge selections to draft
    onUpdate({
      amenities_property: localAmenitiesProperty,
      amenities_room: localAmenitiesRoom,
      house_rules: localHouseRules
    });
    onNext();
  };

  const isValid = draft.property_size_m2 && draft.bathrooms && 
    (draft.property_type === 'apartment' || draft.room_size_m2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Λεπτομέρειες {draft.property_type === 'room' ? 'δωματίου' : 'διαμερίσματος'}
        </h2>
        <p className="text-muted-foreground">
          Συμπληρώστε τις βασικές πληροφορίες του ακινήτου
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Property Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Βασικά στοιχεία</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property_size">Μέγεθος ακινήτου (m²) *</Label>
                  <Input
                    id="property_size"
                    type="number"
                    placeholder="80"
                    defaultValue={draft.property_size_m2 || ''}
                    onBlur={(e) => onUpdate({ property_size_m2: parseInt(e.target.value) || undefined })}
                  />
                </div>

                {draft.property_type === 'room' && (
                  <div className="space-y-2">
                    <Label htmlFor="room_size">Μέγεθος δωματίου (m²) *</Label>
                    <Input
                      id="room_size"
                      type="number"
                      placeholder="15"
                      defaultValue={draft.room_size_m2 || ''}
                      onBlur={(e) => onUpdate({ room_size_m2: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_lift"
                  checked={draft.has_lift}
                  onCheckedChange={(checked) => onUpdate({ has_lift: !!checked })}
                />
                <Label htmlFor="has_lift">Υπάρχει ασανσέρ</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms_single">Μονά κρεβάτια</Label>
                  <Input
                    id="bedrooms_single"
                    type="number"
                    min="0"
                    defaultValue={draft.bedrooms_single}
                    onBlur={(e) => onUpdate({ bedrooms_single: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedrooms_double">Διπλά κρεβάτια</Label>
                  <Input
                    id="bedrooms_double"
                    type="number"
                    min="0"
                    defaultValue={draft.bedrooms_double}
                    onBlur={(e) => onUpdate({ bedrooms_double: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Μπάνια *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="1"
                    defaultValue={draft.bathrooms}
                    onBlur={(e) => onUpdate({ bathrooms: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wc_count">WC</Label>
                  <Input
                    id="wc_count"
                    type="number"
                    min="0"
                    defaultValue={draft.wc_count}
                    onBlur={(e) => onUpdate({ wc_count: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {draft.property_type === 'room' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="flatmates">Συγκάτοικοι</Label>
                    <Input
                      id="flatmates"
                      type="number"
                      min="0"
                      placeholder="2"
                      defaultValue={draft.flatmates_count}
                      onBlur={(e) => onUpdate({ flatmates_count: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="i_live_here"
                      checked={draft.i_live_here}
                      onCheckedChange={(checked) => onUpdate({ i_live_here: !!checked })}
                    />
                    <Label htmlFor="i_live_here">Μένω στο ακίνητο</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {draft.property_type === 'room' && (
            <Card>
              <CardHeader>
                <CardTitle>Λεπτομέρειες δωματίου</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Προσανατολισμός</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={draft.orientation === 'exterior' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdate({ orientation: 'exterior' })}
                    >
                      Εξωτερικό
                    </Button>
                    <Button
                      variant={draft.orientation === 'interior' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdate({ orientation: 'interior' })}
                    >
                      Εσωτερικό
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_bed"
                    checked={draft.has_bed !== false}
                    onCheckedChange={(checked) => onUpdate({ has_bed: !!checked })}
                  />
                  <Label htmlFor="has_bed">Υπάρχει κρεβάτι</Label>
                </div>

                {draft.has_bed !== false && (
                  <div className="space-y-2">
                    <Label>Τύπος κρεβατιού</Label>
                    <Select 
                      value={draft.bed_type} 
                      onValueChange={(value) => onUpdate({ bed_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλέξτε τύπο" />
                      </SelectTrigger>
                      <SelectContent>
                        {BED_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Amenities & Rules */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ανέσεις ακινήτου</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_AMENITIES.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={localAmenitiesProperty.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity, 'property')}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {draft.property_type === 'room' && (
            <Card>
              <CardHeader>
                <CardTitle>Ανέσεις δωματίου</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex flex-wrap gap-2">
                  {ROOM_AMENITIES.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant={localAmenitiesRoom.includes(amenity) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleAmenity(amenity, 'room')}
                    >
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Κανόνες σπιτιού</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {HOUSE_RULES.map((rule) => (
                  <Badge
                    key={rule}
                    variant={localHouseRules.includes(rule) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleHouseRule(rule)}
                  >
                    {rule}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button onClick={handleNext} disabled={!isValid}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}