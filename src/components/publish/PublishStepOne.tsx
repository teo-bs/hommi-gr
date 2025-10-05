import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, MapPin } from 'lucide-react';
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
      street_address: location.formatted_address,
      neighborhood: location.region || location.city
    });
  }, [onUpdate]);

  const handleMapLocationChange = useCallback((location: LocationData) => {
    setAddressInput(location.formatted_address);
    handleLocationSelect(location);
  }, [handleLocationSelect]);

  const isValid = draft.city && draft.lat && draft.lng;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Τοποθεσία</h2>
        <p className="text-muted-foreground">
          Πείτε μας πού βρίσκεται το ακίνητο σας
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Διεύθυνση και Χάρτης
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* a) Dynamic Address */}
          <div className="space-y-2">
            <Label>α) Δυναμική διεύθυνση *</Label>
            <AddressAutocomplete
              value={addressInput}
              onChange={setAddressInput}
              onLocationSelect={handleLocationSelect}
              placeholder="Αναζητήστε διεύθυνση ή τοποθεσία στην Ελλάδα..."
              required
              error={!draft.city}
            />
            
            {!draft.city && (
              <p className="text-sm text-destructive">Παρακαλώ επιλέξτε μια διεύθυνση</p>
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
          </div>

          {/* b) Map Pin */}
          <div className="space-y-2">
            <Label>β) Πιν στον χάρτη</Label>
            <div className="rounded-lg overflow-hidden border border-muted">
              <PublishMap
                location={draft.lat && draft.lng ? { lat: draft.lat, lng: draft.lng } : undefined}
                onLocationChange={handleMapLocationChange}
                className="h-64 w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Σύρετε το δείκτη για να προσαρμόσετε την ακριβή τοποθεσία
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Η ακριβής διεύθυνση δεν θα είναι δημόσια. Θα εμφανίζεται μόνο η περιοχή.
            </AlertDescription>
          </Alert>
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
