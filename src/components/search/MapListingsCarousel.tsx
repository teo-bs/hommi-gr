import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { MapListingCard } from './MapListingCard';

interface Listing {
  id: string;
  slug: string;
  title: string;
  price_month: number;
  city?: string;
  neighborhood?: string;
  photos?: string[];
  lister_verified?: boolean;
  reviews_count?: number;
  references_count?: number;
  lat: number;
  lng: number;
  formatted_address?: string;
  lister_first_name?: string;
}

interface MapListingsCarouselProps {
  listings: Listing[];
  selectedListingId: string | null;
  onListingSelect: (id: string, lat: number, lng: number) => void;
}

export const MapListingsCarousel = ({ 
  listings, 
  selectedListingId,
  onListingSelect 
}: MapListingsCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const [debouncedActiveId] = useDebounce(localActiveId, 80);

  // Detect active card via Intersection Observer with higher precision
  useEffect(() => {
    if (!carouselRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Only process the most intersecting entry with higher threshold
        const mostVisible = entries.reduce((max, entry) => 
          entry.intersectionRatio > (max?.intersectionRatio || 0) ? entry : max
        , entries[0]);
        
        // Require at least 70% visibility for more precise detection
        if (mostVisible && mostVisible.isIntersecting && mostVisible.intersectionRatio >= 0.7) {
          const listingId = mostVisible.target.getAttribute('data-listing-id');
          setLocalActiveId(listingId);
        }
      },
      {
        root: carouselRef.current,
        // More granular thresholds for precise detection
        threshold: [0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0],
        rootMargin: '0px'
      }
    );

    // Observe all cards
    Object.values(cardRefs.current).forEach(card => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [listings]);

  // Notify parent of active listing change
  useEffect(() => {
    if (debouncedActiveId) {
      const listing = listings.find(l => l.id === debouncedActiveId);
      if (listing) {
        onListingSelect(listing.id, listing.lat, listing.lng);
      }
    }
  }, [debouncedActiveId, listings, onListingSelect]);

  // Auto-scroll when external selection changes
  useEffect(() => {
    if (selectedListingId && cardRefs.current[selectedListingId]) {
      cardRefs.current[selectedListingId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedListingId]);

  if (listings.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden pb-safe">
      <div className="bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-lg pt-6 pb-4 pointer-events-none">
        <div className="pointer-events-auto">
          <div 
            ref={carouselRef}
            className="overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              transform: 'translateZ(0)',
              willChange: 'scroll-position',
              // Precise snap alignment
              scrollPaddingLeft: 'calc(50vw - 160px)', // Half viewport minus half card width
              scrollPaddingRight: 'calc(50vw - 160px)',
            }}
          >
            <div 
              className="flex gap-4"
              style={{
                // Add padding to center first/last cards
                paddingLeft: 'calc(50vw - 160px)',
                paddingRight: 'calc(50vw - 160px)',
              }}
            >
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  ref={(el) => (cardRefs.current[listing.id] = el)}
                  data-listing-id={listing.id}
                  className="snap-center shrink-0"
                  style={{
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'always'
                  }}
                >
                  <MapListingCard
                    listing={listing}
                    isSelected={selectedListingId === listing.id}
                    isActive={debouncedActiveId === listing.id}
                    onClick={() => onListingSelect(listing.id, listing.lat, listing.lng)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
