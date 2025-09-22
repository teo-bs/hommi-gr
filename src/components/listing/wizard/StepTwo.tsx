import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ListingDraft } from "../ListingWizard";

interface StepTwoProps {
  draft: ListingDraft;
  onChange: (updates: Partial<ListingDraft>) => void;
  role: 'individual' | 'agency';
}

export const StepTwo = ({ draft, onChange, role }: StepTwoProps) => {
  const propertyAmenities = [
    'WiFi', 'Air Conditioning', 'Heating', 'Washing Machine', 'Dishwasher', 
    'Parking', 'Garden/Balcony', 'Elevator', 'Security', 'Storage'
  ];

  const roomAmenities = [
    'Private Bathroom', 'Shared Bathroom', 'Wardrobe', 'Desk', 'Chair', 
    'Window View', 'Natural Light', 'Quiet Area', 'TV', 'Mini Fridge'
  ];

  const toggleAmenity = (amenity: string, type: 'property' | 'room') => {
    const key = type === 'property' ? 'amenities_property' : 'amenities_room';
    const current = draft[key] || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    onChange({ [key]: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Property Details</h2>
        <p className="text-muted-foreground">
          These details help renters find the perfect match (all optional)
        </p>
      </div>

      {/* Description */}
      <Card className="p-6">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your space, the atmosphere, and what makes it special..."
          value={draft.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          className="min-h-24 mt-2"
        />
      </Card>

      {/* Room Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Room Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="room-type">Room Type</Label>
            <Select value={draft.room_type || ''} onValueChange={(value) => onChange({ room_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private Room</SelectItem>
                <SelectItem value="shared">Shared Room</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="apartment">Whole Apartment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="room-size">Room Size (m²)</Label>
            <Input
              id="room-size"
              type="number"
              placeholder="15"
              value={draft.room_size_m2 || ''}
              onChange={(e) => onChange({ room_size_m2: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-bed"
              checked={draft.has_bed ?? true}
              onCheckedChange={(checked) => onChange({ has_bed: checked as boolean })}
            />
            <Label htmlFor="has-bed">Furnished with bed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-interior"
              checked={draft.is_interior ?? true}
              onCheckedChange={(checked) => onChange({ is_interior: checked as boolean })}
            />
            <Label htmlFor="is-interior">Interior room (has window)</Label>
          </div>
        </div>
      </Card>

      {/* Living Situation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Living Situation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="flatmates-count">Current Flatmates</Label>
            <Input
              id="flatmates-count"
              type="number"
              placeholder="2"
              value={draft.flatmates_count || ''}
              onChange={(e) => onChange({ flatmates_count: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          <div>
            <Label htmlFor="availability-date">Available From</Label>
            <Input
              id="availability-date"
              type="date"
              value={draft.availability_date || ''}
              onChange={(e) => onChange({ availability_date: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="couples-accepted"
              checked={draft.couples_accepted ?? false}
              onCheckedChange={(checked) => onChange({ couples_accepted: checked as boolean })}
            />
            <Label htmlFor="couples-accepted">Couples welcome</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pets-allowed"
              checked={draft.pets_allowed ?? false}
              onCheckedChange={(checked) => onChange({ pets_allowed: checked as boolean })}
            />
            <Label htmlFor="pets-allowed">Pets allowed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="smoking-allowed"
              checked={draft.smoking_allowed ?? false}
              onCheckedChange={(checked) => onChange({ smoking_allowed: checked as boolean })}
            />
            <Label htmlFor="smoking-allowed">Smoking allowed</Label>
          </div>
        </div>
      </Card>

      {/* Property Amenities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Property Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {propertyAmenities.map((amenity) => (
            <Badge
              key={amenity}
              variant={draft.amenities_property?.includes(amenity) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleAmenity(amenity, 'property')}
            >
              {amenity}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Room Amenities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Room Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {roomAmenities.map((amenity) => (
            <Badge
              key={amenity}
              variant={draft.amenities_room?.includes(amenity) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleAmenity(amenity, 'room')}
            >
              {amenity}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Bills Information */}
      <Card className="p-6">
        <Label htmlFor="bills-note">Bills & Utilities</Label>
        <Textarea
          id="bills-note"
          placeholder="e.g., All bills included, or specify what's included/excluded..."
          value={draft.bills_note || ''}
          onChange={(e) => onChange({ bills_note: e.target.value })}
          className="mt-2"
        />
      </Card>
    </div>
  );
};