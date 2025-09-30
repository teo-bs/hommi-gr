import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Euro, Users, Home, CheckCircle2, Building2 } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useAmenityFacets } from "@/hooks/useAmenityFacets";

interface FilterState {
  budget: [number, number];
  flatmates: string;
  space: string;
  roomType: string;
  couplesAccepted: boolean;
  petsAllowed: boolean;
  billsIncluded: boolean;
  verifiedLister: boolean;
  listerType: string;
  amenities: string[];
  moveInDate?: Date;
  duration: string;
  sort: string;
}

interface EnhancedSearchFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  resultCount?: number;
}

export const EnhancedSearchFilters = ({ filters, onFilterChange, resultCount }: EnhancedSearchFiltersProps) => {
  const { data: amenities = [] } = useAmenityFacets();

  const handleAmenityToggle = (amenityKey: string) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenityKey)
      ? current.filter(k => k !== amenityKey)
      : [...current, amenityKey];
    onFilterChange({ amenities: updated });
  };

  const popularAmenities = ['wifi', 'air_conditioning', 'washing_machine', 'parking', 'dishwasher', 'tv'];

  return (
    <div className="space-y-4">
      {/* Budget */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <Label>Προϋπολογισμός</Label>
          </div>
          <div className="space-y-2">
            <Slider
              value={filters.budget}
              onValueChange={(value) => onFilterChange({ budget: value as [number, number] })}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.budget[0]}€</span>
              <span>{filters.budget[1]}€</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Move-in Date */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Label>Ημερομηνία μετακόμισης</Label>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                {filters.moveInDate ? format(filters.moveInDate, "PPP", { locale: el }) : "Επιλέξτε ημερομηνία"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.moveInDate}
                onSelect={(date) => onFilterChange({ moveInDate: date })}
                initialFocus
                locale={el}
              />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Duration */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label>Διάρκεια</Label>
          <Select value={filters.duration} onValueChange={(value) => onFilterChange({ duration: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Οποιαδήποτε" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Οποιαδήποτε</SelectItem>
              <SelectItem value="1">1 μήνας</SelectItem>
              <SelectItem value="3">3 μήνες</SelectItem>
              <SelectItem value="6">6 μήνες</SelectItem>
              <SelectItem value="12">12+ μήνες</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Room Type */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <Label>Τύπος χώρου</Label>
          </div>
          <Select value={filters.roomType} onValueChange={(value) => onFilterChange({ roomType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Όλοι" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Όλοι</SelectItem>
              <SelectItem value="private">Ιδιωτικό δωμάτιο</SelectItem>
              <SelectItem value="shared">Κοινόχρηστο δωμάτιο</SelectItem>
              <SelectItem value="entire_place">Ολόκληρο το σπίτι</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Flatmates */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label>Συγκάτοικοι</Label>
          </div>
          <Select value={filters.flatmates} onValueChange={(value) => onFilterChange({ flatmates: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Οποιοσδήποτε" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Οποιοσδήποτε</SelectItem>
              <SelectItem value="0">Κανένας</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Amenities */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label>Ανέσεις</Label>
          <div className="flex flex-wrap gap-2">
            {popularAmenities.map((amenityKey) => {
              const amenity = amenities.find(a => a.amenity_key === amenityKey);
              if (!amenity) return null;
              
              const isSelected = filters.amenities?.includes(amenityKey);
              
              return (
                <Badge
                  key={amenityKey}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleAmenityToggle(amenityKey)}
                >
                  {amenity.name_el}
                </Badge>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label>Προτιμήσεις</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="couples"
                checked={filters.couplesAccepted}
                onCheckedChange={(checked) => onFilterChange({ couplesAccepted: checked as boolean })}
              />
              <label htmlFor="couples" className="text-sm">Αποδοχή ζευγαριών</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pets"
                checked={filters.petsAllowed}
                onCheckedChange={(checked) => onFilterChange({ petsAllowed: checked as boolean })}
              />
              <label htmlFor="pets" className="text-sm">Επιτρέπονται κατοικίδια</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bills"
                checked={filters.billsIncluded}
                onCheckedChange={(checked) => onFilterChange({ billsIncluded: checked as boolean })}
              />
              <label htmlFor="bills" className="text-sm">Λογαριασμοί συμπεριλαμβάνονται</label>
            </div>
          </div>
        </div>
      </Card>

      {/* Lister Type */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Label>Ιδιοκτήτης</Label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.verifiedLister}
                onCheckedChange={(checked) => onFilterChange({ verifiedLister: checked as boolean })}
              />
              <label htmlFor="verified" className="text-sm flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Επαληθευμένοι μόνο
              </label>
            </div>
          </div>
          <Select value={filters.listerType} onValueChange={(value) => onFilterChange({ listerType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Όλοι" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Όλοι</SelectItem>
              <SelectItem value="individual">Ιδιώτες</SelectItem>
              <SelectItem value="agency">Μεσιτικά γραφεία</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Sort */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label>Ταξινόμηση</Label>
          <Select value={filters.sort} onValueChange={(value) => onFilterChange({ sort: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Προτεινόμενα</SelectItem>
              <SelectItem value="newest">Νεότερα πρώτα</SelectItem>
              <SelectItem value="price_low">Τιμή: Χαμηλή → Υψηλή</SelectItem>
              <SelectItem value="price_high">Τιμή: Υψηλή → Χαμηλή</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Result count */}
      {resultCount !== undefined && (
        <div className="text-center text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'}
        </div>
      )}
    </div>
  );
};
