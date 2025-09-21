import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  SlidersHorizontal, 
  Euro, 
  Calendar as CalendarIcon, 
  Users, 
  Home,
  X 
} from "lucide-react";

export const SearchFilters = () => {
  const [budget, setBudget] = useState([300, 800]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [flatmates, setFlatmates] = useState("any");
  const [space, setSpace] = useState("any");
  const [couplesAccepted, setCouplesAccepted] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (filterType: string, value: any) => {
    // Track analytics
    console.log('filter_applied', {
      filterType,
      value,
      timestamp: Date.now()
    });

    // Update active filters for display
    const filterName = `${filterType}:${value}`;
    if (!activeFilters.includes(filterName)) {
      setActiveFilters(prev => [...prev, filterName]);
    }
  };

  const removeFilter = (filter: string) => {
    console.log('filter_cleared', {
      filter,
      timestamp: Date.now()
    });
    
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  const clearAllFilters = () => {
    console.log('all_filters_cleared', {
      timestamp: Date.now()
    });
    
    setBudget([300, 800]);
    setDateRange({});
    setFlatmates("any");
    setSpace("any");
    setCouplesAccepted(false);
    setActiveFilters([]);
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Ενεργά φίλτρα</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Καθαρισμός όλων
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="text-xs"
                >
                  {filter.split(':')[1]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => removeFilter(filter)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Euro className="h-4 w-4 mr-2" />
            Προϋπολογισμός
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={budget}
              onValueChange={(value) => {
                setBudget(value);
                handleFilterChange('budget', `${value[0]}-${value[1]}€`);
              }}
              max={2000}
              min={200}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{budget[0]}€</span>
              <span>{budget[1]}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Διαθεσιμότητα
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  ) : (
                    dateRange.from.toLocaleDateString()
                  )
                ) : (
                  "Επιλέξτε ημερομηνίες"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={(range) => {
                  setDateRange(range || {});
                  if (range?.from) {
                    handleFilterChange('availability', range.from.toISOString().split('T')[0]);
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Flatmates Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Users className="h-4 w-4 mr-2" />
            Συγκάτοικοι
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={flatmates}
            onValueChange={(value) => {
              setFlatmates(value);
              handleFilterChange('flatmates', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Αριθμός συγκάτοικων" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Οποιοσδήποτε</SelectItem>
              <SelectItem value="0">Χωρίς συγκάτοικους</SelectItem>
              <SelectItem value="1">1 συγκάτοικος</SelectItem>
              <SelectItem value="2">2 συγκάτοικοι</SelectItem>
              <SelectItem value="3">3 συγκάτοικοι</SelectItem>
              <SelectItem value="4+">4+ συγκάτοικοι</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Space Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Home className="h-4 w-4 mr-2" />
            Χώρος
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={space}
            onValueChange={(value) => {
              setSpace(value);
              handleFilterChange('space', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Τύπος χώρου" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Οποιοσδήποτε</SelectItem>
              <SelectItem value="room">Μόνο δωμάτιο</SelectItem>
              <SelectItem value="whole">Ολόκληρο διαμέρισμα</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Additional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Προτιμήσεις</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="couples"
                checked={couplesAccepted}
                onCheckedChange={(checked) => {
                  setCouplesAccepted(checked as boolean);
                  if (checked) {
                    handleFilterChange('couples', 'accepted');
                  }
                }}
              />
              <Label
                htmlFor="couples"
                className="text-sm font-normal cursor-pointer"
              >
                Δέχονται ζευγάρια
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ταξινόμηση</CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue="featured">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Προτεινόμενα</SelectItem>
              <SelectItem value="newest">Νεότερα πρώτα</SelectItem>
              <SelectItem value="price-low">Τιμή (χαμηλή)</SelectItem>
              <SelectItem value="price-high">Τιμή (υψηλή)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};