import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { OptimizedListing } from "@/hooks/useOptimizedSearch";
import { ListerBadge } from "./ListerBadge";
import { calculateMatchScore } from "@/lib/matching";
import { SaveRoomButton } from "@/components/room/SaveRoomButton";

interface ListingCardProps {
  listing: OptimizedListing;
  coverPhoto?: string;
  currentUserProfileExtras?: any;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
  onHover?: (listingId: string, isEntering: boolean) => void;
  onClick?: (roomId: string) => void;
}

// Helper to optimize Supabase images with responsive sizes
const getOptimizedImageUrl = (url: string, width: number = 600): string => {
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    return `${url}?width=${width}&quality=70&format=webp`;
  }
  return url;
};

// Generate srcset for responsive images
const getImageSrcSet = (url: string): string => {
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {
    return `${getOptimizedImageUrl(url, 360)} 360w, ${getOptimizedImageUrl(url, 540)} 540w, ${getOptimizedImageUrl(url, 720)} 720w`;
  }
  return url;
};

export const ListingCard = ({ 
  listing, 
  coverPhoto,
  currentUserProfileExtras,
  hoveredListingId, 
  selectedListingId,
  onHover,
  onClick
}: ListingCardProps) => {
  const isHighlighted = hoveredListingId === listing.room_id || selectedListingId === listing.room_id;
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use cover photo or fallback, and get all photos
  const imageUrl = coverPhoto || listing.cover_photo_url || '/placeholder.svg';
  const photos = listing.photos && listing.photos.length > 0 
    ? listing.photos 
    : [imageUrl];
  const hasMultiplePhotos = photos.length > 1;
  
  // Reset image state when cover photo changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

  // Auto-advance photos on hover
  useEffect(() => {
    if (isHovered && hasMultiplePhotos) {
      // Start auto-advance every 1 second
      carouselIntervalRef.current = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
      }, 1000);
    } else {
      // Stop auto-advance and reset
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
      setCurrentPhotoIndex(0);
    }
    
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [isHovered, hasMultiplePhotos, photos.length]);

  // Calculate match score
  const { isGoodFit, matchPercentage } = calculateMatchScore(
    currentUserProfileExtras || {},
    listing.lister_profile_extras || {},
    listing.audience_preferences || {}
  );
  
  // Debug logging for "Good Fit" badge
  console.log('ListingCard Match Debug:', {
    room_id: listing.room_id,
    title: listing.title,
    currentUserProfileExtras,
    lister_profile_extras: listing.lister_profile_extras,
    audience_preferences: listing.audience_preferences,
    isGoodFit,
    matchPercentage
  });

  // Format labels
  const roomTypeLabel = listing.room_type === 'private' ? 'PRIVATE ROOM' : 'SHARED ROOM';
  const flatmatesCount = listing.flatmates_count || 0;
  const flatmatesLabel = flatmatesCount === 1 ? '1 FLATMATE' : `${flatmatesCount} FLATMATES`;

  return (
    <Link
      to={`/listing/${listing.slug}`}
      state={{ fromSearch: true }}
      className="block group animate-fade-in touch-manipulation"
      onClick={(e) => {
        onClick?.(listing.room_id);
      }}
      onMouseEnter={() => {
        onHover?.(listing.room_id, true);
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        onHover?.(listing.room_id, false);
        setIsHovered(false);
      }}
    >
      <div className={`transition-all duration-200 active:scale-[0.98] ${isHighlighted ? 'scale-[1.02]' : ''}`}>
        {/* Cover Image with Carousel */}
        <div className="relative aspect-[4/3] mb-3 rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
          {/* Show all images stacked with transitions */}
          {photos.map((photo, index) => (
            <img
              key={index}
              src={imageError ? '/placeholder.svg' : getOptimizedImageUrl(photo, 720)}
              srcSet={!imageError ? getImageSrcSet(photo) : undefined}
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
              alt={`${listing.title} - Photo ${index + 1}`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
              } ${isHovered && index === currentPhotoIndex ? 'scale-105' : 'scale-100'}`}
              onLoad={() => index === 0 && setImageLoaded(true)}
              onError={() => index === 0 && setImageError(true)}
            />
          ))}
          
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse text-muted-foreground text-sm">Φόρτωση...</div>
            </div>
          )}
          
          {/* Navigation arrows for multiple photos - visible on hover */}
          {hasMultiplePhotos && isHovered && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-xl sm:text-2xl font-bold z-20 cursor-pointer transition-all hover:scale-110"
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-xl sm:text-2xl font-bold z-20 cursor-pointer transition-all hover:scale-110"
                aria-label="Next photo"
              >
                ›
              </button>
            </>
          )}
          
          {/* Photo counter for multiple photos */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-10">
              {currentPhotoIndex + 1}/{photos.length}
            </div>
          )}
          
          {/* Navigation dots */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentPhotoIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/60 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Good Fit Badge - Top Left */}
          {isGoodFit && (
            <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-background text-foreground shadow-md border-0 font-semibold z-10 text-xs sm:text-sm animate-scale-in">
              YOU'RE A GOOD FIT
            </Badge>
          )}
          
          {/* Save Button - Top Right */}
          <SaveRoomButton 
            roomId={listing.room_id}
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-background/90 hover:bg-background shadow-sm z-10 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] touch-manipulation active:scale-90 transition-transform"
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
        <div className="space-y-1 px-1">
          {/* Room Type & Flatmates */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {roomTypeLabel} · {flatmatesLabel}
          </p>
          
          {/* Title */}
          <h3 className="font-semibold text-base sm:text-lg line-clamp-2 leading-tight group-hover:underline">
            {listing.title}
          </h3>
          
          {/* Price & Bills */}
          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-lg sm:text-xl tabular-nums">€{listing.price_month}</span>
              <span className="text-sm text-muted-foreground">/μήνα</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {listing.bills_included ? '✓ Με λογαριασμούς' : 'Χωρίς λογαριασμούς'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
