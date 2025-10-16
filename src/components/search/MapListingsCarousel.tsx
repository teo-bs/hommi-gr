import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { MapListingCard } from './MapListingCard';

interface Listing {
  id: string;
  slug: string;
  title: string;
  price_month: number;
  city?: string;
  photos?: string[];
  lister_verified?: boolean;
  reviews_count?: number;
  references_count?: number;
  lat: number;
  lng: number;
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
  const [debouncedActiveId] = useDebounce(localActiveId, 150);

  // Detect active card via Intersection Observer
  useEffect(() => {
    if (!carouselRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const listingId = entry.target.getAttribute('data-listing-id');
            setLocalActiveId(listingId);
          }
        });
      },
      {
        root: carouselRef.current,
        threshold: [0.6],
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
      <div className="bg-gradient-to-t from-background via-background to-transparent pt-4 pb-3">
        <div 
          ref={carouselRef}
          className="overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 px-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                ref={(el) => (cardRefs.current[listing.id] = el)}
                data-listing-id={listing.id}
                className="snap-center"
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
  );
};
