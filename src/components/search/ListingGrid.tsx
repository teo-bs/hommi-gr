import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Users, Heart, Star, MessageSquare } from "lucide-react";
import { FilterState } from "@/pages/Search";

// Mock data for demo
const mockListings = [
  {
    id: "cozy-koukaki-room-1",
    title: "Cozy room in trendy Koukaki",
    price: 520,
    neighborhood: "Κουκάκι",
    flatmates: 2,
    matchScore: 92,
    photos: ["/placeholder.svg"],
    couples: true,
    verified: true
  },
  {
    id: "acropolis-museum-room-1", 
    title: "Spacious room near Acropolis Museum",
    price: 680,
    neighborhood: "Μακρυγιάννη",
    flatmates: 1,
    matchScore: 88,
    photos: ["/placeholder.svg"],
    couples: false,
    verified: true
  },
  {
    id: "bohemian-exarchia-room-1",
    title: "Bohemian flat in Exarchia", 
    price: 450,
    neighborhood: "Εξάρχεια",
    flatmates: 3,
    matchScore: 85,
    photos: ["/placeholder.svg"],
    couples: true,
    verified: true
  },
  {
    id: "quiet-pangrati-room-1",
    title: "Quiet room in Pangrati",
    price: 480,
    neighborhood: "Παγκράτι", 
    flatmates: 2,
    matchScore: 78,
    photos: ["/placeholder.svg"],
    couples: false,
    verified: true
  },
  {
    id: "luxury-kolonaki-room-1",
    title: "Luxury apartment in Kolonaki",
    price: 750,
    neighborhood: "Κολωνάκι",
    flatmates: 1,
    matchScore: 95,
    photos: ["/placeholder.svg"],
    couples: true,
    verified: true
  },
  {
    id: "modern-ambelokipi-studio-1",
    title: "Modern studio near Metro",
    price: 550,
    neighborhood: "Αμπελόκηποι",
    flatmates: 0,
    matchScore: 89,
    photos: ["/placeholder.svg"],
    couples: false,
    verified: true
  },
  {
    id: "traditional-plaka-room-1",
    title: "Traditional flat in Plaka",
    price: 620,
    neighborhood: "Πλάκα",
    flatmates: 2,
    matchScore: 91,
    photos: ["/placeholder.svg"],
    couples: true,
    verified: true
  }
];

interface ListingGridProps {
  filters?: FilterState;
}

export const ListingGrid = ({ filters }: ListingGridProps) => {
  const handleCardHover = (listingId: string) => {
    console.log('card_hover_preview', { listingId, timestamp: Date.now() });
  };

  const handleRequestChat = (listingId: string, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent link navigation
    console.log('request_to_chat_clicked', { listingId, timestamp: Date.now() });
  };

  // Filter and sort listings based on filters
  const filteredAndSortedListings = React.useMemo(() => {
    let filtered = [...mockListings];

    if (filters) {
      // Budget filter
      if (filters.budget) {
        filtered = filtered.filter(listing => 
          listing.price >= filters.budget[0] && listing.price <= filters.budget[1]
        );
      }

      // Flatmates filter
      if (filters.flatmates && filters.flatmates !== "any") {
        if (filters.flatmates === "4+") {
          filtered = filtered.filter(listing => listing.flatmates >= 4);
        } else {
          filtered = filtered.filter(listing => listing.flatmates === parseInt(filters.flatmates));
        }
      }

      // Space filter (for this demo, we'll treat all listings as rooms)
      if (filters.space && filters.space !== "any") {
        if (filters.space === "whole") {
          filtered = filtered.filter(listing => listing.flatmates === 0);
        }
      }

      // Couples filter
      if (filters.couplesAccepted) {
        filtered = filtered.filter(listing => listing.couples);
      }
    }

    // Sort listings
    const sortType = filters?.sort || 'featured';
    switch (sortType) {
      case 'newest':
        // For demo, keep original order
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    return filtered;
  }, [filters]);

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
            key={listing.id}
            to={`/room/${listing.title.toLowerCase().replace(/\s+/g, '-')}/${listing.id}`}
            className="block"
          >
            <Card 
              className="hover:shadow-moderate transition-shadow cursor-pointer"
              onMouseEnter={() => handleCardHover(listing.id)}
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
                      <div className="text-2xl font-bold">{listing.price}€</div>
                      <div className="text-sm text-muted-foreground">+ λογαριασμοί</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{listing.flatmates} συγκάτοικοι</span>
                    </div>
                    
                    {listing.couples && (
                      <Badge variant="secondary" className="text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Couples OK
                      </Badge>
                    )}
                    
                    {listing.verified && (
                      <Badge variant="secondary" className="text-xs text-success">
                        <Star className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-primary">
                        {listing.matchScore}% match
                      </div>
                    </div>
                    
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={(e) => handleRequestChat(listing.id, e)}
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