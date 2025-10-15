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
  onClick: () => void;
}

export const MapListingCard = ({ listing, isSelected, onClick }: MapListingCardProps) => {
  const navigate = useNavigate();
  const coverPhoto = Array.isArray(listing.photos) ? listing.photos[0] : undefined;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/rooms/${listing.slug}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={cn(
        "flex-shrink-0 w-[280px] snap-start overflow-hidden cursor-pointer transition-all duration-200 touch-manipulation active:scale-95",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={handleCardClick}
    >
      <div className="relative h-[120px] bg-muted">
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

      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm line-clamp-1">{listing.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base text-primary">{listing.price_month}€</span>
            <span className="text-xs text-muted-foreground">/μήνα</span>
          </div>
          {listing.city && (
            <Badge variant="secondary" className="text-xs">
              {listing.city}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};
