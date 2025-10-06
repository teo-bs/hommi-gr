import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';

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

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: boolean;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  properties: {
    address?: string;
  };
  context?: Array<{
    id: string;
    text: string;
  }>;
}

export const AddressAutocomplete = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for address...",
  label,
  required = false,
  error = false
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedValue] = useDebounce(value, 250);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Transliteration maps
  const greekToLatinMap: Record<string, string> = {
    'α': 'a', 'ά': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'έ': 'e',
    'ζ': 'z', 'η': 'i', 'ή': 'i', 'θ': 'th', 'ι': 'i', 'ί': 'i', 'ϊ': 'i',
    'ΐ': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o',
    'ό': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y',
    'ύ': 'y', 'ϋ': 'y', 'ΰ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o', 'ώ': 'o'
  };

  const latinToGreekMap: Record<string, string> = {
    'a': 'α', 'v': 'β', 'b': 'μπ', 'g': 'γ', 'd': 'δ', 'e': 'ε', 'z': 'ζ',
    'i': 'ι', 'k': 'κ', 'l': 'λ', 'm': 'μ', 'n': 'ν', 'x': 'ξ', 'o': 'ο',
    'p': 'π', 'r': 'ρ', 's': 'σ', 't': 'τ', 'y': 'υ', 'f': 'φ', 'u': 'ου'
  };

  const transliterateGreekToLatin = (text: string): string => {
    return text.toLowerCase().split('').map(char => greekToLatinMap[char] || char).join('');
  };

  const transliterateLatinToGreek = (text: string): string => {
    let result = text.toLowerCase();
    // Handle digraphs first
    result = result.replace(/th/g, 'θ').replace(/ch/g, 'χ').replace(/ps/g, 'ψ');
    // Then single characters
    return result.split('').map(char => latinToGreekMap[char] || char).join('');
  };

  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!mapboxToken) {
        console.error('VITE_MAPBOX_TOKEN is not configured');
        setIsLoading(false);
        return;
      }

      // Determine if query is Greek or Latin
      const isGreek = /[\u0370-\u03FF]/.test(query);
      const queries = [query];
      
      // Add transliterated version
      if (isGreek) {
        queries.push(transliterateGreekToLatin(query));
      } else {
        queries.push(transliterateLatinToGreek(query));
      }

      // Search both original and transliterated queries in parallel
      const responses = await Promise.all(
        queries.map(q => 
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?` +
            new URLSearchParams({
              access_token: mapboxToken,
              country: 'GR',
              limit: '5',
              types: 'place,locality,neighborhood,address,poi'
            }),
            { signal: abortControllerRef.current?.signal }
          )
        )
      );

      const allData = await Promise.all(
        responses.map(r => r.ok ? r.json() : { features: [] })
      );

      // Combine and deduplicate results by feature ID
      const allFeatures = allData.flatMap(data => data.features || []);
      const uniqueFeatures = Array.from(
        new Map(allFeatures.map(f => [f.id, f])).values()
      );

      setSuggestions(uniqueFeatures);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedValue) {
      searchAddress(debouncedValue);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedValue, searchAddress]);

  const parseLocationFromFeature = (feature: MapboxFeature): LocationData => {
    const [lng, lat] = feature.center;
    
    // Extract address components from context
    const context = feature.context || [];
    
    let city = '';
    let region = '';
    let postcode = '';
    let country = '';
    let street = '';
    let street_number = '';

    // Parse from context
    context.forEach(item => {
      if (item.id.includes('place')) {
        city = item.text;
      } else if (item.id.includes('region')) {
        region = item.text;
      } else if (item.id.includes('postcode')) {
        postcode = item.text;
      } else if (item.id.includes('country')) {
        country = item.text;
      }
    });

    // Extract street info if available
    if (feature.properties?.address) {
      const addressParts = feature.properties.address.split(' ');
      if (addressParts.length > 0) {
        street_number = addressParts[0];
        street = addressParts.slice(1).join(' ');
      }
    }

    // Default to Greece if country not found
    if (!country) {
      country = 'Greece';
    }

    return {
      city: city || '',
      region: region || '',
      postcode: postcode || '',
      country,
      street: street || '',
      street_number: street_number || '',
      lat,
      lng,
      formatted_address: feature.place_name
    };
  };

  const handleSuggestionSelect = (feature: MapboxFeature) => {
    const locationData = parseLocationFromFeature(feature);
    onChange(feature.place_name);
    onLocationSelect(locationData);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearSelection = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {label && (
        <Label htmlFor="address-input">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="address-input"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${error ? 'border-destructive' : ''}`}
        />
        
        {isLoading && (
          <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        
        {value && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={clearSelection}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{suggestion.place_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};