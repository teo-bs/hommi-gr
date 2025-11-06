import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SaveRoomButton } from '@/components/room/SaveRoomButton';
import { cn } from '@/lib/utils';

interface MapListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    price_month: number;
    city?: string;
    photos?: string[];
    lister_verified?: boolean;
    reviews_count?: number;
    references_count?: number;
  };
  isSelected: boolean;
  isActive?: boolean;
  onClick: () => void;
}

export const MapListingCard = ({ listing, isSelected, isActive = false, onClick }: MapListingCardProps) => {
  const navigate = useNavigate();
  const coverPhoto = Array.isArray(listing.photos) ? listing.photos[0] : undefined;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/listing/${listing.slug}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={cn(
        "flex-shrink-0 w-[320px] min-w-[320px] snap-center overflow-hidden cursor-pointer transition-all duration-300 touch-manipulation",
        "hover:shadow-lg",
        // Active state - card in center of carousel
        isActive && "ring-2 ring-primary shadow-2xl scale-[1.04] bg-card",
        // Selected state - from clicking
        isSelected && !isActive && "ring-2 ring-primary shadow-lg scale-[1.02]",
        // Default state
        !isActive && !isSelected && "shadow-md active:scale-95 active:shadow-sm"
      )}
      style={{
        contain: 'layout style paint',
        willChange: isActive || isSelected ? 'transform, box-shadow' : 'auto',
        touchAction: 'manipulation',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={handleCardClick}
    >
      <div className="relative h-[160px] bg-muted">
        {coverPhoto ? (
          <img
            src={coverPhoto}
            alt={listing.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            Χωρίς φωτογραφία
          </div>
        )}
        
        {/* Save button overlay */}
        <div className="absolute top-2 right-2" onClick={handleSaveClick}>
          <SaveRoomButton roomId={listing.id} />
        </div>

        {/* Verification badge */}
        {listing.lister_verified && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-background/90 text-xs gap-1">
              ✓ Επαληθευμένος
            </Badge>
          </div>
        )}
      </div>

      <div className={cn(
        "p-4 space-y-2 transition-colors duration-200",
        isActive && "bg-primary/5"
      )}>
        <h3 className="font-semibold text-base line-clamp-2 leading-snug">{listing.title}</h3>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "font-bold text-lg transition-colors duration-200",
              isActive ? "text-primary" : "text-foreground"
            )}>
              {listing.price_month}€
            </span>
            <span className="text-xs text-muted-foreground">/μήνα</span>
          </div>
          {listing.city && (
            <Badge variant="secondary" className="text-xs">
              {listing.city}
            </Badge>
          )}
        </div>
        
        {/* Visual indicator for active card */}
        {isActive && (
          <div className="flex items-center gap-1.5 text-xs text-primary pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">Ενεργό</span>
          </div>
        )}
      </div>
    </Card>
  );
};
