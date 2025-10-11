import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAmenitiesByCategory } from "@/hooks/useAmenitiesByCategory";

interface ListingDraft {
  room_size_m2?: number;
  bed_type?: string;
  orientation: 'exterior' | 'interior';
  amenities_room: string[];
  couples_accepted: boolean;
  [key: string]: any;
}

interface PublishStepRoomDetailsProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BED_TYPES = [
  { value: 'single', label: 'Μονό' },
  { value: 'double', label: 'Διπλό' },
  { value: 'sofa-bed', label: 'Καναπές-κρεβάτι' }
];

export default function PublishStepRoomDetails({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev 
}: PublishStepRoomDetailsProps) {
  // Fetch room amenities from database
  const { data: roomAmenities = [], isLoading: amenitiesLoading } = useAmenitiesByCategory('room');
  
  // Local state for batch updates - store amenity KEYS
  const [localAmenities, setLocalAmenities] = useState(draft.amenities_room || []);
  
  const toggleAmenity = (amenityKey: string) => {
    console.log('🔄 Toggling room amenity key:', amenityKey);
    const updated = localAmenities.includes(amenityKey)
      ? localAmenities.filter(a => a !== amenityKey)
      : [...localAmenities, amenityKey];
    setLocalAmenities(updated);
  };

  const handleNext = async () => {
    // Commit local selections before proceeding (ensure they're saved to draft)
    console.log('📝 Committing room amenities (keys):', localAmenities);
    await onUpdate({ amenities_room: localAmenities });
    onNext();
  };

  const isValid = draft.room_size_m2 && draft.bed_type;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Σχετικά με το δωμάτιο</h2>
        <p className="text-muted-foreground">
          Πείτε μας για τον χώρο που προσφέρετε
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Room Basics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Βασικά στοιχεία δωματίου</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label>Κρεβάτι *</Label>
                <Select 
                  value={draft.bed_type} 
                  onValueChange={(value) => onUpdate({ bed_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε τύπο κρεβατιού" />
                  </SelectTrigger>
                  <SelectContent>
                    {BED_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Προσανατολισμός</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={draft.orientation === 'exterior' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => onUpdate({ orientation: 'exterior' })}
                  >
                    Εξωτερικό
                  </Button>
                  <Button
                    type="button"
                    variant={draft.orientation === 'interior' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => onUpdate({ orientation: 'interior' })}
                  >
                    Εσωτερικό
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ποιος μπορεί να μείνει;</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="couples_accepted"
                  checked={draft.couples_accepted}
                  onCheckedChange={(checked) => onUpdate({ couples_accepted: !!checked })}
                />
                <Label htmlFor="couples_accepted">Κατάλληλο για ζευγάρια</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Room Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Ανέσεις δωματίου</CardTitle>
            <p className="text-sm text-muted-foreground">
              Τι περιλαμβάνει το δωμάτιο;
            </p>
          </CardHeader>
          <CardContent>
            {amenitiesLoading ? (
              <p className="text-sm text-muted-foreground">Φόρτωση παροχών...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roomAmenities.map((amenity) => (
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
            )}
          </CardContent>
        </Card>
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