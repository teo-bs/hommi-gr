import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { useAmenitiesByCategory } from "@/hooks/useAmenitiesByCategory";

interface ListingDraft {
  property_size_m2?: number;
  floor?: number;
  has_lift: boolean;
  bathrooms: number;
  wc_count: number;
  i_live_here: boolean;
  flatmates_count: number;
  amenities_property: string[];
  house_rules: string[];
  [key: string]: any;
}

interface PublishStepApartmentDetailsProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Hardcoded house rules (these don't come from amenities table)
const HOUSE_RULES = [
  'Όχι κάπνισμα', 'Όχι κατοικίδια', 'Όχι επισκέπτες αργά', 
  'Όχι πάρτι', 'Ησυχία μετά τις 22:00', 
  'Καθαριότητα κοινόχρηστων χώρων', 'Μοίρασμα λογαριασμών'
];

export default function PublishStepApartmentDetails({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev 
}: PublishStepApartmentDetailsProps) {
  // Fetch amenities from database
  const { data: propertyAmenities = [], isLoading: amenitiesLoading } = useAmenitiesByCategory('property');
  
  // Local state for batch updates - store amenity KEYS
  const [localAmenities, setLocalAmenities] = useState(draft.amenities_property || []);
  const [localHouseRules, setLocalHouseRules] = useState(draft.house_rules || []);
  
  const toggleAmenity = (amenityKey: string) => {
    console.log('🔄 Toggling amenity key:', amenityKey);
    const updated = localAmenities.includes(amenityKey)
      ? localAmenities.filter(a => a !== amenityKey)
      : [...localAmenities, amenityKey];
    setLocalAmenities(updated);
  };

  const toggleHouseRule = (rule: string) => {
    const updated = localHouseRules.includes(rule)
      ? localHouseRules.filter(r => r !== rule)
      : [...localHouseRules, rule];
    setLocalHouseRules(updated);
  };

  const handleNext = async () => {
    // Commit local selections before proceeding (ensure they're saved to draft)
    console.log('📝 Committing apartment amenities (keys):', localAmenities);
    console.log('📝 Committing house rules:', localHouseRules);
    await onUpdate({
      amenities_property: localAmenities,
      house_rules: localHouseRules
    });
    onNext();
  };

  const totalFlatmates = (draft.flatmates_count || 0) + (draft.i_live_here ? 1 : 0);
  const isValid = draft.property_size_m2 && draft.bathrooms;

  // Separate basic and special amenities by key prefixes or manually
  const basicAmenities = propertyAmenities.filter(a => 
    ['wifi', 'tv', 'kitchen', 'washer', 'dishwasher', 'private_parking', 
     'paid_parking', 'air_conditioning', 'dedicated_workspace', 'balcony', 'heating'].includes(a.key)
  );
  
  const specialAmenities = propertyAmenities.filter(a => 
    ['bbq_grill', 'outdoor_dining', 'indoor_fireplace', 'gym'].includes(a.key)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Σχετικά με ολόκληρο το διαμέρισμα</h2>
        <p className="text-muted-foreground">
          Πείτε μας τα βασικά στοιχεία του ακινήτου
        </p>
      </div>

      {/* Section A: Basic Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Βασικά στοιχεία ακινήτου</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="floor">Όροφος</Label>
              <Select
                value={draft.floor?.toString() || ''}
                onValueChange={(value) => onUpdate({ floor: value === '' ? undefined : parseFloat(value) })}
              >
                <SelectTrigger id="floor">
                  <SelectValue placeholder="Επιλέξτε όροφο..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">Υπόγειο</SelectItem>
                  <SelectItem value="-0.5">Ημιυπόγειο</SelectItem>
                  <SelectItem value="0">Ισόγειο</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(floor => (
                    <SelectItem key={floor} value={floor.toString()}>
                      {floor}ο
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_lift"
              checked={draft.has_lift}
              onCheckedChange={(checked) => onUpdate({ has_lift: !!checked })}
            />
            <Label htmlFor="has_lift">Υπάρχει ασανσέρ</Label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Κοινόχρηστα μπάνια *</Label>
              <Select
                value={draft.bathrooms?.toString() || '1'}
                onValueChange={(value) => onUpdate({ bathrooms: parseInt(value) })}
              >
                <SelectTrigger id="bathrooms">
                  <SelectValue placeholder="Επιλέξτε αριθμό..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wc_count">Κοινόχρηστα WC</Label>
              <Select
                value={draft.wc_count?.toString() || '1'}
                onValueChange={(value) => onUpdate({ wc_count: parseInt(value) })}
              >
                <SelectTrigger id="wc_count">
                  <SelectValue placeholder="Επιλέξτε αριθμό..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="i_live_here"
              checked={draft.i_live_here}
              onCheckedChange={(checked) => onUpdate({ i_live_here: !!checked })}
            />
            <Label htmlFor="i_live_here">Μένω στο ακίνητο</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flatmates">Συγκάτοικοι</Label>
            <Select
              value={draft.flatmates_count?.toString() || '0'}
              onValueChange={(value) => onUpdate({ flatmates_count: parseInt(value) })}
            >
              <SelectTrigger id="flatmates">
                <SelectValue placeholder="Επιλέξτε αριθμό..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
            {totalFlatmates > 0 && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Συνολικά είμαστε {totalFlatmates} συγκάτοικοι στο ακίνητο
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section B: Property Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Ανέσεις ακινήτου</CardTitle>
          <p className="text-sm text-muted-foreground">
            Πείτε στον μελλοντικό σας συγκάτοικο για τις παροχές του χώρου σας. 
            Μπορείτε να προσθέσετε περισσότερες ανέσεις μετά τη δημοσίευση.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {amenitiesLoading ? (
            <p className="text-sm text-muted-foreground">Φόρτωση παροχών...</p>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-medium mb-3">Βασικές ανέσεις</h4>
                <div className="flex flex-wrap gap-2">
                  {basicAmenities.map((amenity) => (
                    <Badge
                      key={amenity.id}
                      variant={localAmenities.includes(amenity.key) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleAmenity(amenity.key)}
                    >
                      {amenity.name_el || amenity.name_en}
                    </Badge>
                  ))}
                </div>
              </div>

              {specialAmenities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Διαθέτετε ξεχωριστές παροχές;</h4>
                  <div className="flex flex-wrap gap-2">
                    {specialAmenities.map((amenity) => (
                      <Badge
                        key={amenity.id}
                        variant={localAmenities.includes(amenity.key) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleAmenity(amenity.key)}
                      >
                        {amenity.name_el || amenity.name_en}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Section C: House Rules */}
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