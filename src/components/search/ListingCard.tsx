import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { OptimizedListing } from "@/hooks/useOptimizedSearch";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface ListingCardProps {
  listing: OptimizedListing;
  photos?: string[];
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
  onHover?: (listingId: string, isEntering: boolean) => void;
  onClick?: (roomId: string) => void;
}

export const ListingCard = ({ 
  listing, 
  photos,
  hoveredListingId, 
  selectedListingId,
  onHover,
  onClick
}: ListingCardProps) => {
  const isHighlighted = hoveredListingId === listing.room_id || selectedListingId === listing.room_id;
  const images = photos && photos.length > 0 ? photos : [listing.cover_photo_url || '/placeholder.svg'];

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
        <div className="relative aspect-[4/3] mb-3 rounded-xl overflow-hidden">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((src, idx) => (
                <CarouselItem key={idx} className="w-full h-full">
                  <img
                    src={src}
                    alt={`${listing.title} – φωτο ${idx+1}`}
                    loading="lazy"
                    className="w-full h-full object-cover hover-scale"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <button 
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </button>
          {listing.kyc_status === 'approved' && (
            <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0">
              <Star className="h-3 w-3 mr-1" />
              Επαληθευμένος
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-2 leading-tight group-hover:underline">
              {listing.neighborhood || listing.city}
            </h3>
            <div className="flex items-center gap-1 text-small">
              <Star className="h-3 w-3" />
              <span className="font-semibold tabular-nums">4.9</span>
            </div>
          </div>
          
          <p className="text-small text-muted-foreground tracking-wide line-clamp-1">
            {listing.title}
          </p>
          
          <p className="text-small text-muted-foreground tracking-wide">
            {new Date(listing.availability_date) <= new Date() ? 'Άμεσα διαθέσιμο' : 'Διαθέσιμο σύντομα'}
          </p>
          
          <div className="flex items-baseline gap-1 pt-1">
            <span className="font-bold text-base tabular-nums">€{listing.price_month}</span>
            <span className="text-small text-muted-foreground">μήνα</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
