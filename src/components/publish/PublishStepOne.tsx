import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info, Home, Building, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddressAutocomplete } from './AddressAutocomplete';
import { PublishMap } from './PublishMap';

interface LocationData {
  city: string;
  region: string;
  postcode: string;
  country: string;
  street: string;
  street_number: string;
  lat: number;
  lng: number;
  formatted_address: string;
}

interface ListingDraft {
  title?: string;
  city?: string;
  neighborhood?: string;
  street_address?: string;
  region?: string;
  postcode?: string;
  country?: string;
  street?: string;
  street_number?: string;
  lat?: number;
  lng?: number;
  formatted_address?: string;
  property_type?: 'room' | 'apartment';
  [key: string]: any;
}

interface PublishStepOneProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PublishStepOne({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev 
}: PublishStepOneProps) {
  const [addressInput, setAddressInput] = useState(draft.formatted_address || '');

  const handleLocationSelect = useCallback((location: LocationData) => {
    onUpdate({
      city: location.city,
      region: location.region,
      postcode: location.postcode,
      country: location.country,
      street: location.street,
      street_number: location.street_number,
      lat: location.lat,
      lng: location.lng,
      formatted_address: location.formatted_address,
      // Also update legacy fields for compatibility
      street_address: location.formatted_address,
      neighborhood: location.region || location.city
    });
  }, [onUpdate]);

  const handleMapLocationChange = useCallback((location: LocationData) => {
    setAddressInput(location.formatted_address);
    handleLocationSelect(location);
  }, [handleLocationSelect]);

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
            {/* Address Search */}
            <AddressAutocomplete
              value={addressInput}
              onChange={setAddressInput}
              onLocationSelect={handleLocationSelect}
              label="Διεύθυνση"
              placeholder="Αναζητήστε διεύθυνση ή τοποθεσία στην Ελλάδα..."
              required
              error={!draft.city}
            />
            
            {!draft.city && (
              <p className="text-sm text-destructive mt-1">Παρακαλώ επιλέξτε μια διεύθυνση</p>
            )}

            {/* Display selected location details */}
            {draft.city && (
              <div className="text-sm text-muted-foreground space-y-1 p-3 bg-accent/50 rounded">
                <div><strong>Πόλη:</strong> {draft.city}</div>
                {draft.region && <div><strong>Περιοχή:</strong> {draft.region}</div>}
                {draft.postcode && <div><strong>Τ.Κ.:</strong> {draft.postcode}</div>}
                {draft.street && (
                  <div>
                    <strong>Οδός:</strong> {draft.street_number} {draft.street}
                  </div>
                )}
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Η ακριβής διεύθυνση δεν θα είναι δημόσια. Θα εμφανίζεται μόνο η περιοχή.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Right Column - Property Type & Interactive Map */}
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

          {/* Interactive Map */}
          <Card>
            <CardHeader>
              <CardTitle>Τοποθεσία στον χάρτη</CardTitle>
            </CardHeader>
            <CardContent>
              <PublishMap
                location={draft.lat && draft.lng ? { lat: draft.lat, lng: draft.lng } : undefined}
                onLocationChange={handleMapLocationChange}
                className="h-48 w-full rounded-lg"
              />
              {!import.meta.env.VITE_MAPBOX_TOKEN && (
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ VITE_MAPBOX_TOKEN δεν έχει ρυθμιστεί. Η λειτουργία χάρτη είναι απενεργοποιημένη.
                  </AlertDescription>
                </Alert>
              )}
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