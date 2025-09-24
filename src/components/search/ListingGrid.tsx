import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Users, Heart, Star, MessageSquare } from "lucide-react";
import { FilterState } from "@/pages/Search";

interface ListingWithRoom {
  id: string;
  title: string;
  price_month: number;
  neighborhood: string;
  city: string;
  flatmates_count: number;
  couples_accepted: boolean;
  photos: string[];
  room_id: string;
  room_slug?: string; // Add slug field
  geo?: {
    lat: number;
    lng: number;
  };
}

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
  // Fetch listings with rooms from Supabase
  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          price_month,
          neighborhood,
          city,
          flatmates_count,
          couples_accepted,
          photos,
          geo
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get room IDs for each listing
      const listingIds = data?.map(listing => listing.id) || [];
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, slug, listing_id')
        .in('listing_id', listingIds);
      
      const roomMap = rooms?.reduce((acc, room) => {
        acc[room.listing_id] = { id: room.id, slug: room.slug };
        return acc;
      }, {} as Record<string, { id: string; slug?: string }>) || {};
      
      return (data || []).map((listing, index) => {
        // Mock geo coordinates for Athens area until real data is available
        const mockCoordinates = [
          { lat: 37.9755, lng: 23.7348 }, // Kifisia
          { lat: 37.9838, lng: 23.7275 }, // Marousi
          { lat: 37.9445, lng: 23.6981 }, // Kolonaki
          { lat: 37.9648, lng: 23.7048 }, // Exarchia
          { lat: 37.9519, lng: 23.7348 }, // Pangrati
          { lat: 37.9794, lng: 23.7162 }, // Psychiko
        ];
        
        const geoData = listing.geo || mockCoordinates[index % mockCoordinates.length];
        
        return {
          id: listing.id,
          title: listing.title,
          price_month: listing.price_month,
          neighborhood: listing.neighborhood || '',
          city: listing.city,
          flatmates_count: listing.flatmates_count,
          couples_accepted: listing.couples_accepted,
          photos: Array.isArray(listing.photos) ? listing.photos : ['/placeholder.svg'],
          room_id: roomMap[listing.id]?.id || listing.id,
          room_slug: roomMap[listing.id]?.slug,
          geo: geoData
        };
      }) as ListingWithRoom[];
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
    // Dispatch listings data for map integration
    window.dispatchEvent(new CustomEvent('listingsUpdated', { 
      detail: { listings: filteredAndSortedListings } 
    }));
  }, []);

  // Filter and sort listings based on filters
  const filteredAndSortedListings = React.useMemo(() => {
    if (!listings) return [];
    
    let filtered = [...listings];

    if (filters) {
      // Budget filter
      if (filters.budget) {
        filtered = filtered.filter(listing => 
          listing.price_month >= filters.budget[0] && listing.price_month <= filters.budget[1]
        );
      }

      // Flatmates filter
      if (filters.flatmates && filters.flatmates !== "any") {
        if (filters.flatmates === "4+") {
          filtered = filtered.filter(listing => listing.flatmates_count >= 4);
        } else {
          filtered = filtered.filter(listing => listing.flatmates_count === parseInt(filters.flatmates));
        }
      }

      // Space filter (for this demo, we'll treat all listings as rooms)
      if (filters.space && filters.space !== "any") {
        if (filters.space === "whole") {
          filtered = filtered.filter(listing => listing.flatmates_count === 0);
        }
      }

      // Couples filter
      if (filters.couplesAccepted) {
        filtered = filtered.filter(listing => listing.couples_accepted);
      }
    }

    // Sort listings
    const sortType = filters?.sort || 'newest';
    switch (sortType) {
      case 'newest':
        // Keep original order (already sorted by created_at desc)
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price_month - b.price_month);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price_month - a.price_month);
        break;
      case 'featured':
      default:
        // Keep original order for now
        break;
    }

    return filtered;
  }, [listings, filters]);

  // Update the effect dependency
  React.useEffect(() => {
    // Dispatch listings data for map integration
    window.dispatchEvent(new CustomEvent('listingsUpdated', { 
      detail: { listings: filteredAndSortedListings } 
    }));
  }, [filteredAndSortedListings]);

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
          {filteredAndSortedListings.length} καταχωρήσεις βρέθηκαν
        </p>
      </div>

      <div className="grid gap-6">
        {filteredAndSortedListings.map((listing) => (
          <Link
            key={listing.room_id}
            to={`/listing/${listing.room_slug || listing.room_id}`}
            className="block"
            onClick={() => handleCardClick(listing.room_id)}
          >
            <Card 
              className={`hover:shadow-moderate transition-all duration-200 cursor-pointer ${
                hoveredListingId === listing.id || selectedListingId === listing.id
                  ? 'ring-2 ring-primary shadow-moderate' 
                  : ''
              }`}
              onMouseEnter={() => handleCardHover(listing.id, true)}
              onMouseLeave={() => handleCardHover(listing.id, false)}
            >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3">
                  <img
                    src={listing.photos[0]}
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
                        <span className="text-sm">{listing.neighborhood}</span>
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
                    
                    <Badge variant="secondary" className="text-xs text-success">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-primary">
                        New listing
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
