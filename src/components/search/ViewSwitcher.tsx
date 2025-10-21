import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Map } from "lucide-react";

interface ViewSwitcherProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
}

export const ViewSwitcher = ({ view, onViewChange }: ViewSwitcherProps) => {
  return (
    <div className="lg:hidden sticky top-[112px] z-50 bg-background/95 border-b border-border shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-6 py-3">
        <ToggleGroup 
          type="single" 
          value={view} 
          onValueChange={(value) => value && onViewChange(value as 'list' | 'map')}
          className="w-full justify-stretch gap-2"
        >
          <ToggleGroupItem 
            value="list" 
            aria-label="View as list"
            className="flex-1 min-h-[44px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground touch-manipulation active:scale-95 transition-all"
          >
            <List className="h-4 w-4 mr-2" />
            Λίστα
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="map" 
            aria-label="View on map"
            className="flex-1 min-h-[44px] data-[state=on]:bg-primary data-[state=on]:text-primary-foreground touch-manipulation active:scale-95 transition-all"
          >
            <Map className="h-4 w-4 mr-2" />
            Χάρτης
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
