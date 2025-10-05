import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { OptimizedListing } from "@/hooks/useOptimizedSearch";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ListerBadge } from "./ListerBadge";
import { calculateMatchScore } from "@/lib/matching";
import { SaveRoomButton } from "@/components/room/SaveRoomButton";

interface ListingCardProps {
  listing: OptimizedListing;
  photos?: string[];
  currentUserProfileExtras?: any;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
  onHover?: (listingId: string, isEntering: boolean) => void;
  onClick?: (roomId: string) => void;
}

export const ListingCard = ({ 
  listing, 
  photos,
  currentUserProfileExtras,
  hoveredListingId, 
  selectedListingId,
  onHover,
  onClick
}: ListingCardProps) => {
  const isHighlighted = hoveredListingId === listing.room_id || selectedListingId === listing.room_id;
  const images = photos && photos.length > 0 ? photos : [listing.cover_photo_url || '/placeholder.svg'];

  // Calculate match score
  const { isGoodFit } = calculateMatchScore(
    currentUserProfileExtras || {},
    listing.lister_profile_extras || {},
    listing.audience_preferences || {}
  );

  // Format labels
  const roomTypeLabel = listing.room_type === 'private' ? 'PRIVATE ROOM' : 'SHARED ROOM';
  const flatmatesCount = listing.flatmates_count || 0;
  const flatmatesLabel = flatmatesCount === 1 ? '1 FLATMATE' : `${flatmatesCount} FLATMATES`;

  return (
    <Link
      to={`/listing/${listing.slug}`}
      state={{ fromSearch: true }}
      className="block group animate-fade-in"
      onClick={() => onClick?.(listing.room_id)}
      onMouseEnter={() => onHover?.(listing.room_id, true)}
      onMouseLeave={() => onHover?.(listing.room_id, false)}
    >
      <div className={`transition-all duration-200 ${isHighlighted ? 'scale-[1.02]' : ''}`}>
        {/* Image carousel */}
        <div className="relative aspect-[4/3] mb-3 rounded-xl overflow-hidden group/carousel">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((src, idx) => (
                <CarouselItem key={idx} className="w-full h-full">
                  <img
                    src={src}
                    alt={`${listing.title} – φωτο ${idx+1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
              <>
                <CarouselPrevious 
                  className="left-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />
                <CarouselNext 
                  className="right-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                />
              </>
            )}
          </Carousel>
          
          {/* Dots indicator - only show if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className="w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm"
                />
              ))}
            </div>
          )}
          
          {/* Good Fit Badge - Top Left */}
          {isGoodFit && (
            <Badge className="absolute top-3 left-3 bg-background text-foreground shadow-md border-0 font-semibold z-10">
              YOU'RE A GOOD FIT
            </Badge>
          )}
          
          {/* Save Button - Top Right */}
          <SaveRoomButton 
            roomId={listing.room_id}
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background shadow-sm z-10"
          />
          
          {/* Lister Badge - Bottom Right */}
          <ListerBadge
            avatarUrl={listing.lister_avatar_url}
            firstName={listing.lister_first_name}
            score={listing.lister_score}
            verifications={listing.verifications_json}
          />
        </div>

        {/* Content */}
        <div className="space-y-1">
          {/* Room Type & Flatmates */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {roomTypeLabel} · {flatmatesLabel}
          </p>
          
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:underline">
            {listing.title}
          </h3>
          
          {/* Price & Bills */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-lg tabular-nums">€{listing.price_month}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Bills: {listing.bills_included ? 'Included' : 'Not included'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
