import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";

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

const PROPERTY_AMENITIES = [
  'WiFi', 'Τηλεόραση', 'Κουζίνα', 'Πλυντήριο ρούχων', 'Πλυντήριο πιάτων',
  'Ιδιωτικό πάρκινγκ', 'Πάρκινγκ στην ιδιοκτησία με πληρωμή', 
  'Κλιματισμός', 'Ειδικός χώρος εργασίας', 'Μπαλκόνι', 'Θέρμανση'
];

const SPECIAL_AMENITIES = [
  'Ψησταριά μπάρμπεκιου', 'Υπαίθρια τραπεζαρία', 'Τζάκι', 'Εξοπλισμός γυμναστικής'
];

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
  
  const toggleAmenity = (amenity: string) => {
    const current = draft.amenities_property || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    onUpdate({ amenities_property: updated });
  };

  const toggleHouseRule = (rule: string) => {
    const current = draft.house_rules || [];
    const updated = current.includes(rule)
      ? current.filter(r => r !== rule)
      : [...current, rule];
    onUpdate({ house_rules: updated });
  };

  const totalFlatmates = (draft.flatmates_count || 0) + (draft.i_live_here ? 1 : 0);
  const isValid = draft.property_size_m2 && draft.bathrooms;

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
                value={draft.property_size_m2 || ''}
                onChange={(e) => onUpdate({ property_size_m2: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Όροφος</Label>
              <Input
                id="floor"
                type="number"
                placeholder="3"
                value={draft.floor || ''}
                onChange={(e) => onUpdate({ floor: parseInt(e.target.value) || undefined })}
              />
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
              <Input
                id="bathrooms"
                type="number"
                min="1"
                value={draft.bathrooms}
                onChange={(e) => onUpdate({ bathrooms: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wc_count">Κοινόχρηστα WC</Label>
              <Input
                id="wc_count"
                type="number"
                min="0"
                value={draft.wc_count}
                onChange={(e) => onUpdate({ wc_count: parseInt(e.target.value) || 1 })}
              />
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
            <Input
              id="flatmates"
              type="number"
              min="0"
              placeholder="0"
              value={draft.flatmates_count || 0}
              onChange={(e) => onUpdate({ flatmates_count: parseInt(e.target.value) || 0 })}
            />
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
          <div>
            <h4 className="text-sm font-medium mb-3">Βασικές ανέσεις</h4>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_AMENITIES.map((amenity) => (
                <Badge
                  key={amenity}
                  variant={(draft.amenities_property || []).includes(amenity) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Διαθέτετε ξεχωριστές παροχές;</h4>
            <div className="flex flex-wrap gap-2">
              {SPECIAL_AMENITIES.map((amenity) => (
                <Badge
                  key={amenity}
                  variant={(draft.amenities_property || []).includes(amenity) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
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
                variant={(draft.house_rules || []).includes(rule) ? 'default' : 'outline'}
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
        <Button onClick={onNext} disabled={!isValid}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}
