import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FilterChip } from "./FilterChip";
import { Home } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAmenitiesByCategory } from "@/hooks/useAmenitiesByCategory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FlatFilterPopoverProps {
  services: string[];
  flatAmenities: string[];
  houseRules: string[];
  propertySize: [number, number];
  onServicesChange: (services: string[]) => void;
  onFlatAmenitiesChange: (amenities: string[]) => void;
  onHouseRulesChange: (rules: string[]) => void;
  onPropertySizeChange: (size: [number, number]) => void;
}

const SERVICE_OPTIONS = [
  { value: 'cleaning', label: 'Υπηρεσία καθαρισμού' },
];

const HOUSE_RULE_OPTIONS = [
  { value: 'smoking', label: 'Επιτρέπεται το κάπνισμα' },
  { value: 'pets', label: 'Επιτρέπονται κατοικίδια' },
  { value: 'couples', label: 'Ζευγάρια αποδεκτά' },
];

export const FlatFilterPopover = ({
  services,
  flatAmenities,
  houseRules,
  propertySize,
  onServicesChange,
  onFlatAmenitiesChange,
  onHouseRulesChange,
  onPropertySizeChange,
}: FlatFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const { data: amenities = [] } = useAmenitiesByCategory('property');
  const [tempMinSize, setTempMinSize] = useState(propertySize[0].toString());
  const [tempMaxSize, setTempMaxSize] = useState(propertySize[1].toString());
  
  const totalActive = services.length + flatAmenities.length + houseRules.length + 
    (propertySize[0] !== 0 || propertySize[1] !== 1000 ? 1 : 0);
  const isActive = totalActive > 0;
  const label = isActive ? `Flat +${totalActive}` : 'Flat';

  const handleServiceToggle = (service: string) => {
    if (services.includes(service)) {
      onServicesChange(services.filter(s => s !== service));
    } else {
      onServicesChange([...services, service]);
    }
  };

  const handleAmenityToggle = (amenityKey: string) => {
    if (flatAmenities.includes(amenityKey)) {
      onFlatAmenitiesChange(flatAmenities.filter(a => a !== amenityKey));
    } else {
      onFlatAmenitiesChange([...flatAmenities, amenityKey]);
    }
  };

  const handleRuleToggle = (rule: string) => {
    if (houseRules.includes(rule)) {
      onHouseRulesChange(houseRules.filter(r => r !== rule));
    } else {
      onHouseRulesChange([...houseRules, rule]);
    }
  };

  const handleSizeBlur = () => {
    const min = parseInt(tempMinSize) || 0;
    const max = parseInt(tempMaxSize) || 1000;
    onPropertySizeChange([Math.min(min, max), Math.max(min, max)]);
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
              onServicesChange([]);
              onFlatAmenitiesChange([]);
              onHouseRulesChange([]);
              onPropertySizeChange([0, 1000]);
            } : undefined}
            icon={Home}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-small mb-3">Υπηρεσίες</h4>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`service-${option.value}`}
                      checked={services.includes(option.value)}
                      onCheckedChange={() => handleServiceToggle(option.value)}
                    />
                    <Label htmlFor={`service-${option.value}`} className="text-small cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-small mb-3">Παροχές διαμερίσματος</h4>
              <div className="grid grid-cols-2 gap-2">
                {amenities.map((amenity) => (
                  <div key={amenity.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`flat-amenity-${amenity.key}`}
                      checked={flatAmenities.includes(amenity.key)}
                      onCheckedChange={() => handleAmenityToggle(amenity.key)}
                    />
                    <Label htmlFor={`flat-amenity-${amenity.key}`} className="text-small cursor-pointer">
                      {amenity.name_el || amenity.name_en}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-small mb-3">Κανόνες σπιτιού</h4>
              <div className="space-y-2">
                {HOUSE_RULE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rule-${option.value}`}
                      checked={houseRules.includes(option.value)}
                      onCheckedChange={() => handleRuleToggle(option.value)}
                    />
                    <Label htmlFor={`rule-${option.value}`} className="text-small cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-small mb-3">Μέγεθος ακινήτου (m²)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-size" className="text-small">Ελάχιστο</Label>
                  <Input
                    id="min-size"
                    type="number"
                    value={tempMinSize}
                    onChange={(e) => setTempMinSize(e.target.value)}
                    onBlur={handleSizeBlur}
                    placeholder="0"
                    className="tabular-nums"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-size" className="text-small">Μέγιστο</Label>
                  <Input
                    id="max-size"
                    type="number"
                    value={tempMaxSize}
                    onChange={(e) => setTempMaxSize(e.target.value)}
                    onBlur={handleSizeBlur}
                    placeholder="1000"
                    className="tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
