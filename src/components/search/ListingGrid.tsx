import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Heart, Star, MessageSquare } from "lucide-react";

// Mock data for demo
const mockListings = [
  {
    id: "1",
    title: "Όμορφο δωμάτιο στο Κουκάκι",
    price: 450,
    neighborhood: "Κουκάκι",
    flatmates: 2,
    matchScore: 85,
    photos: ["/api/placeholder/400/300"],
    couples: true,
    verified: true,
  },
  {
    id: "2", 
    title: "Σύγχρονο διαμέρισμα Εξάρχεια",
    price: 650,
    neighborhood: "Εξάρχεια",
    flatmates: 1,
    matchScore: 92,
    photos: ["/api/placeholder/400/300"],
    couples: false,
    verified: true,
  },
];

export const ListingGrid = () => {
  const handleCardHover = (listingId: string) => {
    console.log('card_hover_preview', { listingId, timestamp: Date.now() });
  };

  const handleRequestChat = (listingId: string) => {
    console.log('request_to_chat_clicked', { listingId, timestamp: Date.now() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {mockListings.length} καταχωρήσεις βρέθηκαν
        </p>
      </div>

      <div className="grid gap-6">
        {mockListings.map((listing) => (
          <a
            key={listing.id}
            href={`/room/${listing.title.toLowerCase().replace(/\s+/g, '-')}-${listing.id}`}
            target="_blank"
            rel="noopener noreferrer"
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
                      onClick={() => handleRequestChat(listing.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Request to chat
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </a>
        ))}
      </div>
    </div>
  );
};