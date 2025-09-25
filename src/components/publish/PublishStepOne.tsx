import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, Home, Building, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ListingDraft {
  title: string;
  city: string;
  neighborhood: string;
  street_address?: string;
  lat?: number;
  lng?: number;
  property_type: 'room' | 'apartment';
  [key: string]: any;
}

interface PublishStepOneProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const GREEK_CITIES = [
  'Αθήνα', 'Θεσσαλονίκη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα', 'Βόλος', 'Ιωάννινα', 
  'Καβάλα', 'Σέρρες', 'Ξάνθη', 'Κομοτηνή', 'Δράμα', 'Αλεξανδρούπολη', 'Κοζάνη', 
  'Καστοριά', 'Φλώρινα', 'Γρεβενά', 'Κατερίνη', 'Βέροια', 'Έδεσσα', 'Νάουσα', 
  'Χαλκίδα', 'Καρπενήσι', 'Λαμία', 'Αμφίσσα', 'Λειβαδιά', 'Θήβα', 'Τρίκαλα', 
  'Καρδίτσα', 'Άρτα', 'Πρέβεζα', 'Ιγουμενίτσα', 'Κέρκυρα', 'Ζάκυνθος', 'Αργοστόλι', 
  'Λευκάδα', 'Μυτιλήνη', 'Χίος', 'Σάμος', 'Σύρος', 'Μύκονος', 'Νάξος', 'Πάρος', 
  'Σαντορίνη', 'Ρόδος', 'Κως', 'Καλύμνος', 'Καστελλόριζο', 'Καλαμάτα', 'Σπάρτη', 
  'Άργος', 'Ναύπλιο', 'Τρίπολη', 'Πύργος', 'Μεσολόγγι', 'Αγρίνιο'
];

export default function PublishStepOne({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev 
}: PublishStepOneProps) {
  const [cityFilter, setCityFilter] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  useEffect(() => {
    if (cityFilter) {
      const filtered = GREEK_CITIES.filter(city => 
        city.toLowerCase().includes(cityFilter.toLowerCase())
      ).slice(0, 5);
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [cityFilter]);

  const handleCitySelect = (city: string) => {
    onUpdate({ city });
    setCityFilter(city);
    setShowCitySuggestions(false);
  };

  const handleNextStep = () => {
    if (draft.city && draft.property_type) {
      onNext();
    }
  };

  const isValid = draft.city && draft.property_type;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Τοποθεσία και τύπος ακινήτου</h2>
        <p className="text-muted-foreground">
          Προσδιορίστε την τοποθεσία και τον τύπο του ακινήτου σας
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Διεύθυνση
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">Πόλη *</Label>
              <div className="relative">
                <Input
                  id="city"
                  placeholder="Αρχίστε να πληκτρολογείτε..."
                  value={draft.city || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCityFilter(value);
                    if (value) {
                      onUpdate({ city: value });
                      setShowCitySuggestions(true);
                    } else {
                      onUpdate({ city: '' });
                      setShowCitySuggestions(false);
                    }
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                />
                
                {showCitySuggestions && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-md z-10 mt-1">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md"
                        onClick={() => handleCitySelect(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Γειτονιά</Label>
              <Input
                id="neighborhood"
                placeholder="π.χ. Κολωνάκι, Εξάρχεια"
                value={draft.neighborhood || ''}
                onChange={(e) => onUpdate({ neighborhood: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Οδός & Αριθμός</Label>
              <Input
                id="street"
                placeholder="π.χ. Πανεπιστημίου 15"
                value={draft.street_address || ''}
                onChange={(e) => onUpdate({ street_address: e.target.value })}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Η ακριβής διεύθυνση δεν θα είναι δημόσια. Θα εμφανίζεται μόνο η περιοχή.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Right Column - Property Type & Map Placeholder */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Τύπος ακινήτου</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={draft.property_type === 'room' ? 'default' : 'outline'}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onUpdate({ property_type: 'room' })}
                >
                  <Home className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">Δωμάτιο</div>
                    <div className="text-xs text-muted-foreground">Κοινόχρηστοι χώροι</div>
                  </div>
                </Button>

                <Button
                  variant={draft.property_type === 'apartment' ? 'default' : 'outline'}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onUpdate({ property_type: 'apartment' })}
                >
                  <Building className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">Διαμέρισμα</div>
                    <div className="text-xs text-muted-foreground">Πλήρης κατοικία</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Τοποθεσία στον χάρτη</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Χάρτης με δυνατότητα σύρσιμου pin</p>
                  <p className="text-xs">(Θα ενεργοποιηθεί σύντομα)</p>
                </div>
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
        <Button onClick={handleNextStep} disabled={!isValid}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}