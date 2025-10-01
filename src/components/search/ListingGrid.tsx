import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart, Star, MessageSquare } from "lucide-react";
import { FilterState } from "@/pages/Search";
import { useOptimizedSearch, OptimizedListing } from '@/hooks/useOptimizedSearch';

interface ListingGridProps {
  filters?: FilterState;
  onListingHover?: (listingId: string | null) => void;
  onListingClick?: (listingId: string) => void;
  hoveredListingId?: string | null;
  selectedListingId?: string | null;
}

export const ListingGrid = ({ 
  filters, 
  onListingHover, 
  onListingClick,
  hoveredListingId,
  selectedListingId 
}: ListingGridProps) => {
  // Use optimized search hook
  const { data: listings = [], isLoading } = useOptimizedSearch({
    filters: {
      budget: filters?.budget ? { min: filters.budget[0], max: filters.budget[1] } : undefined,
      flatmates: filters?.flatmates && filters.flatmates !== "any" ? 
        (filters.flatmates === "4+" ? 4 : parseInt(filters.flatmates)) : undefined,
      space: filters?.space && filters.space !== "any" ? filters.space : undefined,
      couplesAccepted: filters?.couplesAccepted,
      sort: filters?.sort,
    }
  });

  const handleCardHover = (listingId: string, isEntering: boolean) => {
    console.log('card_hover_preview', { listingId, isEntering, timestamp: Date.now() });
    onListingHover?.(isEntering ? listingId : null);
  };

  const handleCardClick = (roomId: string) => {
    console.log('card_clicked_navigate', { roomId, timestamp: Date.now() });
    onListingClick?.(roomId);
  };

  const handleRequestChat = (listingId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent card click navigation
    console.log('request_to_chat_clicked', { listingId, timestamp: Date.now() });
  };

  // Pass listings to MapContainer via Search page
  React.useEffect(() => {
    // Convert optimized listings to format expected by map
    const mapListings = listings.map(listing => ({
      id: listing.room_id, // Use room_id as id since listing_id doesn't exist
      room_id: listing.room_id,
      title: listing.title,
      price_month: listing.price_month,
      neighborhood: listing.neighborhood,
      city: listing.city,
      flatmates_count: listing.flatmates_count,
      couples_accepted: listing.couples_accepted,
      photos: listing.cover_photo_url ? [listing.cover_photo_url] : ['/placeholder.svg'],
      room_slug: listing.slug,
      geo: listing.lat && listing.lng ? { lat: listing.lat, lng: listing.lng } : undefined
    }));

    window.dispatchEvent(new CustomEvent('listingsUpdated', { 
      detail: { listings: mapListings } 
    }));
  }, [listings]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Φόρτωση καταχωρήσεων...
          </p>
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {listings.length} καταχωρήσεις βρέθηκαν
        </p>
      </div>

      <div className="grid gap-6">
        {listings.map((listing) => (
          <Link
            key={listing.room_id}
            to={`/listing/${listing.slug}`}
            className="block"
            onClick={() => handleCardClick(listing.room_id)}
          >
            <Card 
              className={`hover:shadow-moderate transition-all duration-200 cursor-pointer ${
                hoveredListingId === listing.room_id || selectedListingId === listing.room_id
                  ? 'ring-2 ring-primary shadow-moderate' 
                  : ''
              }`}
              onMouseEnter={() => handleCardHover(listing.room_id, true)}
              onMouseLeave={() => handleCardHover(listing.room_id, false)}
            >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img
                    src={listing.cover_photo_url || '/placeholder.svg'}
                    alt={listing.title}
                    className="w-full h-48 md:h-full object-cover rounded-l-lg"
                  />
                </div>
                
                <div className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                      <div className="flex items-center text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{listing.neighborhood || listing.city}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold">{listing.price_month}€</div>
                      <div className="text-sm text-muted-foreground">+ λογαριασμοί</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{listing.flatmates_count} συγκάτοικοι</span>
                    </div>
                    
                    {listing.couples_accepted && (
                      <Badge variant="secondary" className="text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Couples OK
                      </Badge>
                    )}
                    
                    {listing.kyc_status === 'approved' && (
                      <Badge variant="secondary" className="text-xs text-success">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-primary">
                        {new Date(listing.availability_date) <= new Date() ? 'Άμεσα διαθέσιμο' : 'Διαθέσιμο σύντομα'}
                      </div>
                    </div>
                    
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={(e) => handleRequestChat(listing.room_id, e)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request to chat
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};