import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface MapControlsProps {
  autoSearch: boolean;
  onAutoSearchChange: (checked: boolean) => void;
  onManualSearch: () => void;
  hasUserMoved: boolean;
}

export const MapControls = ({ 
  autoSearch, 
  onAutoSearchChange, 
  onManualSearch,
  hasUserMoved 
}: MapControlsProps) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col gap-2 items-center">
      {/* Search as I move checkbox */}
      <div className="bg-background border rounded-lg shadow-lg px-4 py-2.5 flex items-center gap-3">
        <Checkbox 
          id="auto-search" 
          checked={autoSearch}
          onCheckedChange={onAutoSearchChange}
        />
        <Label 
          htmlFor="auto-search" 
          className="text-sm font-medium cursor-pointer select-none"
        >
          Αναζήτηση καθώς μετακινούμαι
        </Label>
      </div>
      
      {/* Manual search button - only show when auto-search is OFF and user has moved */}
      {!autoSearch && hasUserMoved && (
        <Button
          onClick={onManualSearch}
          className="shadow-lg"
          size="sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Αναζήτηση σε αυτήν την περιοχή
        </Button>
      )}
    </div>
  );
};
