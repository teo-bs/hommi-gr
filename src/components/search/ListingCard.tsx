import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { OptimizedListing } from "@/hooks/useOptimizedSearch";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselApi } from "@/components/ui/carousel";
import { ListerBadge } from "./ListerBadge";
import { calculateMatchScore } from "@/lib/matching";
import { SaveRoomButton } from "@/components/room/SaveRoomButton";
import { Image } from "lucide-react";

interface ListingCardProps {
  listing: OptimizedListing;
  photos?: string[];
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
  photos,
  currentUserProfileExtras,
  hoveredListingId, 
  selectedListingId,
  onHover,
  onClick
}: ListingCardProps) => {
  const isHighlighted = hoveredListingId === listing.room_id || selectedListingId === listing.room_id;
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // Filter out broken images
  const allImages = photos && photos.length > 0 ? photos : [listing.cover_photo_url || '/placeholder.svg'];
  const images = allImages.filter(url => url && !failedImages.has(url));
  
  // Fallback if all images failed
  const displayImages = images.length > 0 ? images : ['/placeholder.svg'];
  
  // Carousel API for smart navigation
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateScrollability = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    const handlePointerDown = () => {
      setIsDragging(false);
    };
    
    const handlePointerUp = () => {
      // Small delay to detect drag
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
    };
    
    const handleScroll = () => {
      setIsDragging(true);
    };

    updateScrollability();
    api.on('select', updateScrollability);
    api.on('reInit', updateScrollability);
    api.on('pointerDown', handlePointerDown);
    api.on('pointerUp', handlePointerUp);
    api.on('scroll', handleScroll);

    return () => {
      api.off('select', updateScrollability);
      api.off('reInit', updateScrollability);
      api.off('pointerDown', handlePointerDown);
      api.off('pointerUp', handlePointerUp);
      api.off('scroll', handleScroll);
    };
  }, [api]);

  // Handle image load errors
  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  // Preload adjacent images on hover
  useEffect(() => {
    if (!api || !isHovered || displayImages.length <= 1) return;
    
    const currentIndex = api.selectedScrollSnap();
    const preloadIndexes = [currentIndex - 1, currentIndex + 1].filter(i => i >= 0 && i < displayImages.length);
    
    preloadIndexes.forEach(idx => {
      const img = new window.Image();
      img.src = getOptimizedImageUrl(displayImages[idx], 720);
    });
  }, [api, isHovered, displayImages]);

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
        // Check if click originated from carousel controls
        const target = e.target as Element;
        if (target && target.closest('[data-carousel-control]')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        // Prevent navigation if dragging
        if (isDragging) {
          e.preventDefault();
          return;
        }
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
        {/* Image carousel */}
        <div className="relative aspect-[4/3] mb-3 rounded-xl overflow-hidden group/carousel">
          <Carousel 
            className="w-full h-full" 
            setApi={setApi}
            opts={{
              containScroll: 'trimSnaps',
              align: 'start',
              dragFree: false,
              loop: false
            }}
          >
            <CarouselContent>
              {displayImages.map((src, idx) => (
                <CarouselItem key={idx} className="w-full h-full">
                  <img
                    src={getOptimizedImageUrl(src, 720)}
                    srcSet={getImageSrcSet(src)}
                    sizes="(min-width: 1024px) 320px, 100vw"
                    alt={`${listing.title} – φωτο ${idx+1}`}
                    loading={idx === 0 ? "eager" : "lazy"}
                    fetchPriority={idx === 0 ? "high" : "low"}
                    decoding="async"
                    draggable={false}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(src)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Smart Navigation arrows - only show if can scroll */}
            {displayImages.length > 1 && canScrollPrev && (
              <CarouselPrevious 
                className="left-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                data-carousel-control
              />
            )}
            {displayImages.length > 1 && canScrollNext && (
              <CarouselNext 
                className="right-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                data-carousel-control
              />
            )}
          </Carousel>
          
          {/* Photo count indicator - bottom left */}
          {displayImages.length > 1 && isHovered && (
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 z-10 shadow-sm">
              <Image className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tabular-nums">{displayImages.length}</span>
            </div>
          )}
          
          {/* Dots indicator - only show if multiple images */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
              {displayImages.map((_, idx) => (
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
