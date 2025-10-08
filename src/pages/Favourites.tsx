import { useEffect, useState } from 'react';
import { Helmet } from "react-helmet-async";
import { Heart, Search, MapPin, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSavedRooms } from '@/hooks/useSavedRooms';
import { SaveRoomButton } from '@/components/room/SaveRoomButton';

interface SavedRoomWithDetails {
  id: string;
  room_id: string;
  created_at: string;
  room: {
    id: string;
    slug: string;
    room_type: string;
    room_size_m2?: number;
    listing: {
      id: string;
      title: string;
      price_month: number;
      city: string;
      neighborhood?: string;
      photos: any;
      availability_date?: string;
      owner: {
        display_name: string;
        avatar_url?: string;
      } | null;
    };
  };
}

const Favourites = () => {
  const { user } = useAuth();
  const { savedRooms, loading: savedRoomsLoading } = useSavedRooms();
  const [savedRoomsWithDetails, setSavedRoomsWithDetails] = useState<SavedRoomWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 24;

  useEffect(() => {
    if (!user) return;

    const fetchSavedRoomsWithDetails = async () => {
      setLoading(true);
      try {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        // Get total count
        const { count } = await supabase
          .from('saved_rooms')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null);

        setTotalCount(count || 0);

        // Get paginated data
        const { data, error } = await supabase
          .from('saved_rooms')
          .select(`
            id,
            room_id,
            created_at,
            room:rooms (
              id,
              slug,
              room_type,
              room_size_m2,
              listing:listings (
                id,
                title,
                price_month,
                city,
                neighborhood,
                photos,
                availability_date,
                owner:profiles!listings_owner_id_fkey (
                  display_name,
                  avatar_url
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          console.error('Error fetching saved rooms with details:', error);
          return;
        }

        setSavedRoomsWithDetails(data as SavedRoomWithDetails[] || []);
      } catch (error) {
        console.error('Error fetching saved rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRoomsWithDetails();
  }, [user, savedRoomsLoading, currentPage]);

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Αγαπημένα - Hommi</title>
          <meta 
            name="description" 
            content="Δείτε τις αγαπημένες σας αγγελίες στο Hommi. Βρείτε εύκολα τους χώρους που σας άρεσαν περισσότερο." 
          />
        </Helmet>
        
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Συνδεθείτε για να δείτε τα αγαπημένα σας</h2>
                <p className="text-muted-foreground mb-4">
                  Αποθηκεύστε και διαχειριστείτε τα αγαπημένα σας δωμάτια
                </p>
                <Button asChild>
                  <Link to="/auth">Σύνδεση</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Αγαπημένα - Hommi</title>
          <meta 
            name="description" 
            content="Δείτε τις αγαπημένες σας αγγελίες στο Hommi. Βρείτε εύκολα τους χώρους που σας άρεσαν περισσότερο." 
          />
        </Helmet>
        
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Αγαπημένα</h1>
              <p className="text-muted-foreground">Φόρτωση αγαπημένων δωματίων...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Αγαπημένα - Hommi</title>
        <meta 
          name="description" 
          content="Δείτε τις αγαπημένες σας αγγελίες στο Hommi. Βρείτε εύκολα τους χώρους που σας άρεσαν περισσότερο." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Αγαπημένα</h1>
            <p className="text-muted-foreground">
              {totalCount} αποθηκευμέν{totalCount === 1 ? 'ο' : 'α'} δωμάτι{totalCount === 1 ? 'ο' : 'α'}
            </p>
          </div>

          {savedRoomsWithDetails.length === 0 ? (
            <Card className="max-w-md mx-auto text-center py-12">
              <CardContent className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Δεν έχετε αγαπημένες αγγελίες ακόμα
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ξεκινήστε να εξερευνάτε αγγελίες και σημειώστε όσες σας αρέσουν 
                    πατώντας την καρδιά για να τις βρίσκετε εύκολα εδώ.
                  </p>
                </div>

                <Button asChild variant="hero" className="gap-2">
                  <Link to="/search">
                    <Search className="h-4 w-4" />
                    Αναζήτηση Αγγελιών
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRoomsWithDetails.map((savedRoom) => {
                const room = savedRoom.room;
                const listing = room.listing;
                const firstPhoto = Array.isArray(listing.photos) ? listing.photos?.[0] : null;

                return (
                  <Card key={savedRoom.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Link to={`/listing/${room.slug}`}>
                        <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                          {firstPhoto ? (
                            <img
                              src={firstPhoto.url}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">Χωρίς φωτογραφία</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="absolute top-3 right-3">
                        <SaveRoomButton roomId={room.id} variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white" />
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Link to={`/listing/${room.slug}`} className="flex-1">
                          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                            {listing.title}
                          </h3>
                        </Link>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {listing.city}
                          {listing.neighborhood && `, ${listing.neighborhood}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{room.room_type}</Badge>
                        {room.room_size_m2 && (
                          <Badge variant="outline">{room.room_size_m2}m²</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold">
                          €{listing.price_month}
                          <span className="text-sm font-normal text-muted-foreground">/μήνα</span>
                        </div>
                        {listing.availability_date && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(listing.availability_date).toLocaleDateString('el-GR')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {listing.owner?.avatar_url ? (
                            <img
                              src={listing.owner.avatar_url}
                              alt={listing.owner.display_name || 'Owner'}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {listing.owner?.display_name || 'Lister'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Προηγούμενη
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                  .filter(page => {
                    const maxPages = Math.ceil(totalCount / pageSize);
                    return page === 1 || page === maxPages || Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, idx, arr) => (
                    <>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span key={`ellipsis-${page}`} className="px-2">...</span>
                      )}
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              >
                Επόμενη
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Favourites;