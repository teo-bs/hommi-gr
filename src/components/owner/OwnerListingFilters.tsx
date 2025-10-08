import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { Slider } from '@/components/ui/slider';

export interface OwnerListingFilters {
  city?: string;
  priceMin?: number;
  priceMax?: number;
  showArchived?: boolean;
}

interface OwnerListingFiltersProps {
  filters: OwnerListingFilters;
  onFiltersChange: (filters: OwnerListingFilters) => void;
}

export const OwnerListingFiltersComponent = ({ filters, onFiltersChange }: OwnerListingFiltersProps) => {
  const [cityInput, setCityInput] = useState(filters.city || '');
  const [debouncedCity] = useDebounce(cityInput, 500);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 0,
    filters.priceMax || 2000
  ]);

  useEffect(() => {
    onFiltersChange({ ...filters, city: debouncedCity || undefined });
  }, [debouncedCity]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    onFiltersChange({
      ...filters,
      priceMin: values[0] > 0 ? values[0] : undefined,
      priceMax: values[1] < 2000 ? values[1] : undefined
    });
  };

  const handleClearFilters = () => {
    setCityInput('');
    setPriceRange([0, 2000]);
    onFiltersChange({ showArchived: filters.showArchived });
  };

  const hasActiveFilters = filters.city || filters.priceMin || filters.priceMax;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Φίλτρα</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="ml-auto text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Καθαρισμός
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City Filter */}
          <div className="space-y-2">
            <Label htmlFor="city-filter">Πόλη</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="city-filter"
                placeholder="π.χ. Αθήνα"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2 md:col-span-2">
            <Label>Εύρος Τιμής: €{priceRange[0]} - €{priceRange[1]}/μήνα</Label>
            <div className="px-2 pt-2">
              <Slider
                min={0}
                max={2000}
                step={50}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Show Archived Checkbox */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
          <Checkbox
            id="show-archived"
            checked={filters.showArchived || false}
            onCheckedChange={(checked) =>
              onFiltersChange({ ...filters, showArchived: checked === true })
            }
          />
          <Label
            htmlFor="show-archived"
            className="text-sm font-normal cursor-pointer"
          >
            Εμφάνιση αρχειοθετημένων αγγελιών
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
