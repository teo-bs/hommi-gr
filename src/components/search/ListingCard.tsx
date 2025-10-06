import { useState, useEffect } from "react";
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
  
  // Use cover photo or fallback
  const imageUrl = coverPhoto || listing.cover_photo_url || '/placeholder.svg';
  
  // Reset image state when cover photo changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [imageUrl]);

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
      className="block group animate-fade-in"
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
      <div className={`transition-all duration-200 ${isHighlighted ? 'scale-[1.02]' : ''}`}>
        {/* Cover Image */}
        <div className="relative aspect-[4/3] mb-3 rounded-xl overflow-hidden bg-muted">
          <img
            src={imageError ? '/placeholder.svg' : getOptimizedImageUrl(imageUrl, 720)}
            srcSet={!imageError ? getImageSrcSet(imageUrl) : undefined}
            sizes="(min-width: 1024px) 320px, 100vw"
            alt={listing.title}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
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
