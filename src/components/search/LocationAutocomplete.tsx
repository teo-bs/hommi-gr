import * as React from "react";
import { MapPin, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RECENT_SEARCHES_KEY = "hommi_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function LocationAutocomplete({ value, onChange, className }: LocationAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    // Load recent searches from localStorage
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
  }, []);

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;
    
    try {
      const updated = [
        search,
        ...recentSearches.filter((s) => s !== search),
      ].slice(0, MAX_RECENT_SEARCHES);
      
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error("Failed to save recent search:", error);
    }
  };

  const removeRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((s) => s !== search);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error("Failed to remove recent search:", error);
    }
  };

  const clearAllRecent = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error("Failed to clear recent searches:", error);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoibG92YWJsZS1ob21taSIsImEiOiJjbThhYmZuemswM3hlMnJzNTM4cmlneDlvIn0.nF3V4aN5sqrxd10lZcBlFw&language=el&types=place,locality`
      );
      
      if (!response.ok) throw new Error("Geocoding failed");
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return null;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return null;
    }
  };

  const handleSearchNearby = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Σφάλμα",
        description: "Ο browser σας δεν υποστηρίζει geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        
        setIsLoadingLocation(false);
        
        if (address) {
          onChange(address);
          saveRecentSearch(address);
          setOpen(false);
          toast({
            title: "Επιτυχία",
            description: "Η τοποθεσία σας εντοπίστηκε",
          });
        } else {
          toast({
            title: "Σφάλμα",
            description: "Δεν ήταν δυνατή η εύρεση της διεύθυνσης",
            variant: "destructive",
          });
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        toast({
          title: "Σφάλμα",
          description: "Δεν επιτράπηκε η πρόσβαση στην τοποθεσία",
          variant: "destructive",
        });
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleRecentSearchClick = (search: string) => {
    onChange(search);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            placeholder="Type a city"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={className}
            disabled={isLoadingLocation}
          />
          {isLoadingLocation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="py-2">
          <button
            onClick={handleSearchNearby}
            disabled={isLoadingLocation}
            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 disabled:opacity-50"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Αναζήτηση κοντά μου</span>
              <span className="text-xs text-muted-foreground">
                Χρήση της τοποθεσίας μου
              </span>
            </div>
          </button>

          {recentSearches.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Πρόσφατες αναζητήσεις
                </span>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-3 group"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1 truncate">{search}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => removeRecentSearch(search, e)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </button>
              ))}
              <Separator className="my-2" />
              <div className="px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllRecent}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Καθαρισμός όλων
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
