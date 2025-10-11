import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Locate, Loader2 } from "lucide-react";

interface MapControlsProps {
  autoSearch: boolean;
  onAutoSearchChange: (checked: boolean) => void;
  onManualSearch: () => void;
  hasUserMoved: boolean;
  onLocateUser: () => void;
  isLocating: boolean;
}

export const MapControls = ({ 
  autoSearch, 
  onAutoSearchChange, 
  onManualSearch,
  hasUserMoved,
  onLocateUser,
  isLocating
}: MapControlsProps) => {
  return (
    <>
      {/* Top controls - Search as I move */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-col gap-2 items-center px-4">
        <div className="bg-background border rounded-lg shadow-lg px-4 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 max-w-[90vw]">
          <Checkbox 
            id="auto-search" 
            checked={autoSearch}
            onCheckedChange={onAutoSearchChange}
            className="min-h-[24px] min-w-[24px]"
          />
          <Label 
            htmlFor="auto-search" 
            className="text-sm font-medium cursor-pointer select-none whitespace-nowrap"
          >
            Αναζήτηση καθώς μετακινούμαι
          </Label>
        </div>
        
        {/* Manual search button - only show when auto-search is OFF and user has moved */}
        {!autoSearch && hasUserMoved && (
          <Button
            onClick={onManualSearch}
            className="shadow-lg min-h-[48px] touch-manipulation active:scale-95 transition-transform text-sm px-6"
            size="sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Αναζήτηση σε αυτήν την περιοχή
          </Button>
        )}
      </div>

      {/* Right controls - Locate me button */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          onClick={onLocateUser}
          disabled={isLocating}
          className="shadow-lg min-h-[48px] min-w-[48px] p-0 touch-manipulation active:scale-95 transition-transform bg-background hover:bg-accent border"
          size="icon"
          variant="outline"
          title="Βρες τη θέση μου"
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Locate className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>
    </>
  );
};
