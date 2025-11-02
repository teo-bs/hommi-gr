import { SortFilterPopover } from "./filters/SortFilterPopover";
import { ListerTypeFilterPopover } from "./filters/ListerTypeFilterPopover";
import { BudgetFilterPopover } from "./filters/BudgetFilterPopover";
import { AvailabilityFilterPopover } from "./filters/AvailabilityFilterPopover";
import { FlatmatesFilterPopover } from "./filters/FlatmatesFilterPopover";
import { RoomAmenitiesFilterPopover } from "./filters/RoomAmenitiesFilterPopover";
import { FlatFilterPopover } from "./filters/FlatFilterPopover";

export interface FilterBarState {
  sort: string;
  listerType: string;
  budget: [number, number];
  moveInDate?: Date;
  duration: string;
  flatmatesCount?: number;
  flatmatesGender: string[];
  bedType: string[];
  roomAmenities: string[];
  flatAmenities: string[];
  houseRules: string[];
  propertySize: [number, number];
}

interface FilterBarProps {
  filters: FilterBarState;
  onFilterChange: (filters: Partial<FilterBarState>) => void;
}

export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  return (
    <div className="sticky top-[48px] sm:top-[56px] z-40 border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-1">
          <SortFilterPopover
            value={filters.sort}
            onChange={(sort) => onFilterChange({ sort })}
          />
          <ListerTypeFilterPopover
            value={filters.listerType}
            onChange={(listerType) => onFilterChange({ listerType })}
          />
          <BudgetFilterPopover
            value={filters.budget}
            onChange={(budget) => onFilterChange({ budget })}
          />
          <AvailabilityFilterPopover
            moveInDate={filters.moveInDate}
            duration={filters.duration}
            onMoveInDateChange={(moveInDate) => onFilterChange({ moveInDate })}
            onDurationChange={(duration) => onFilterChange({ duration })}
          />
          <FlatmatesFilterPopover
            flatmatesCount={filters.flatmatesCount}
            flatmatesGender={filters.flatmatesGender}
            onFlatmatesCountChange={(flatmatesCount) => onFilterChange({ flatmatesCount })}
            onFlatmatesGenderChange={(flatmatesGender) => onFilterChange({ flatmatesGender })}
          />
          <RoomAmenitiesFilterPopover
            bedType={filters.bedType}
            roomAmenities={filters.roomAmenities}
            onBedTypeChange={(bedType) => onFilterChange({ bedType })}
            onRoomAmenitiesChange={(roomAmenities) => onFilterChange({ roomAmenities })}
          />
          <FlatFilterPopover
            flatAmenities={filters.flatAmenities}
            houseRules={filters.houseRules}
            propertySize={filters.propertySize}
            onFlatAmenitiesChange={(flatAmenities) => onFilterChange({ flatAmenities })}
            onHouseRulesChange={(houseRules) => onFilterChange({ houseRules })}
            onPropertySizeChange={(propertySize) => onFilterChange({ propertySize })}
          />
        </div>
      </div>
    </div>
  );
};
