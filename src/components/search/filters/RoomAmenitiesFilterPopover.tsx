import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { Bed } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAmenitiesByCategory } from "@/hooks/useAmenitiesByCategory";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoomAmenitiesFilterPopoverProps {
  bedType: string[];
  roomAmenities: string[];
  onBedTypeChange: (types: string[]) => void;
  onRoomAmenitiesChange: (amenities: string[]) => void;
}

const BED_TYPE_OPTIONS = [
  { value: 'single', label: 'Μονό κρεβάτι' },
  { value: 'double', label: 'Διπλό κρεβάτι' },
  { value: 'sofa', label: 'Καναπές κρεβάτι' },
  { value: 'none', label: 'Χωρίς κρεβάτι' },
];

export const RoomAmenitiesFilterPopover = ({
  bedType,
  roomAmenities,
  onBedTypeChange,
  onRoomAmenitiesChange,
}: RoomAmenitiesFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const { data: amenities = [] } = useAmenitiesByCategory('room');
  
  const totalActive = bedType.length + roomAmenities.length;
  const isActive = totalActive > 0;
  const label = isActive ? `Room +${totalActive}` : 'Room Amenities';

  const handleBedTypeToggle = (type: string) => {
    if (bedType.includes(type)) {
      onBedTypeChange(bedType.filter(t => t !== type));
    } else {
      onBedTypeChange([...bedType, type]);
    }
  };

  const handleAmenityToggle = (amenityKey: string) => {
    if (roomAmenities.includes(amenityKey)) {
      onRoomAmenitiesChange(roomAmenities.filter(a => a !== amenityKey));
    } else {
      onRoomAmenitiesChange([...roomAmenities, amenityKey]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <FilterChip
            label={label}
            isActive={isActive}
            onClick={() => setOpen(!open)}
            onRemove={isActive ? () => {
              onBedTypeChange([]);
              onRoomAmenitiesChange([]);
            } : undefined}
            icon={Bed}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-small mb-3">Τύπος κρεβατιού</h4>
              <div className="space-y-2">
                {BED_TYPE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`bed-${option.value}`}
                      checked={bedType.includes(option.value)}
                      onCheckedChange={() => handleBedTypeToggle(option.value)}
                    />
                    <Label htmlFor={`bed-${option.value}`} className="text-small cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-small mb-3">Παροχές δωματίου</h4>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map((amenity) => (
                  <div key={amenity.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.key}`}
                      checked={roomAmenities.includes(amenity.key)}
                      onCheckedChange={() => handleAmenityToggle(amenity.key)}
                    />
                    <Label htmlFor={`amenity-${amenity.key}`} className="text-small cursor-pointer">
                      {amenity.name_el || amenity.name_en}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
