import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { OptimizedListing } from "@/hooks/useOptimizedSearch";

interface ListingCardProps {
  listing: OptimizedListing;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
  onHover?: (listingId: string, isEntering: boolean) => void;
  onClick?: (roomId: string) => void;
}

export const ListingCard = ({ 
  listing, 
  hoveredListingId, 
  selectedListingId,
  onHover,
  onClick
}: ListingCardProps) => {
  const isHighlighted = hoveredListingId === listing.room_id || selectedListingId === listing.room_id;

  return (
    <Link
      to={`/listing/${listing.slug}`}
      state={{ fromSearch: true }}
      className="block group"
      onClick={() => onClick?.(listing.room_id)}
      onMouseEnter={() => onHover?.(listing.room_id, true)}
      onMouseLeave={() => onHover?.(listing.room_id, false)}
    >
      <div className={`transition-all duration-200 ${isHighlighted ? 'scale-[1.02]' : ''}`}>
        {/* Image */}
        <div className="relative aspect-[4/3] mb-3 rounded-xl overflow-hidden">
          <img
            src={listing.cover_photo_url || '/placeholder.svg'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button 
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background hover:scale-110 transition-all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
          {listing.kyc_status === 'approved' && (
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0">
              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
              Επαληθευμένος
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:underline">
              {listing.neighborhood || listing.city}
            </h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-semibold">4.9</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1">
            {listing.title}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {new Date(listing.availability_date) <= new Date() ? 'Άμεσα διαθέσιμο' : 'Διαθέσιμο σύντομα'}
          </p>
          
          <div className="flex items-baseline gap-1 pt-1">
            <span className="font-semibold">€{listing.price_month}</span>
            <span className="text-sm text-muted-foreground">μήνα</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
