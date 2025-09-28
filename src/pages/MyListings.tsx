import { Helmet } from "react-helmet-async";
import { List, Plus, Settings, Eye, MessageSquare, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useMyListings } from "@/hooks/useMyListings";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";

const MyListings = () => {
  const { data: listings, isLoading, error } = useMyListings();

  return (
    <>
      <Helmet>
        <title>Οι Αγγελίες Μου - Hommi</title>
        <meta 
          name="description" 
          content="Διαχειριστείτε τις αγγελίες σας στο Hommi. Δείτε στατιστικά, επεξεργαστείτε και διαχειριστείτε τις δημοσιεύσεις σας." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Οι Αγγελίες Μου
                </h1>
                <p className="text-muted-foreground">
                  Διαχειριστείτε και παρακολουθήστε τις αγγελίες σας
                  {listings && listings.length > 0 && ` (${listings.length})`}
                </p>
              </div>
              
              <Link to="/publish">
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Νέα Αγγελία
                </Button>
              </Link>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="w-32 h-24 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-destructive">
                    Σφάλμα φόρτωσης αγγελιών. Παρακαλώ δοκιμάστε ξανά.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Listings */}
            {!isLoading && !error && listings && listings.length > 0 && (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Cover Photo */}
                        <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {listing.cover_photo_url ? (
                            <img 
                              src={listing.cover_photo_url} 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <List className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground truncate">
                                {listing.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {listing.city}, {listing.neighborhood}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              <Badge 
                                variant={listing.status === 'published' ? 'default' : 'secondary'}
                              >
                                {listing.status === 'published' ? 'Δημοσιευμένη' : 'Πρόχειρο'}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>€{listing.price_month}/μήνα</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {listing.flatmates_count} συγκάτοικοι
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {listing.view_count} προβολές
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {listing.request_count} αιτήματα
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {listing.couples_accepted && (
                                <Badge variant="secondary" className="text-xs">
                                  Ζευγάρια ✓
                                </Badge>
                              )}
                              {listing.pets_allowed && (
                                <Badge variant="secondary" className="text-xs">
                                  Κατοικίδια ✓
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(listing.created_at), { 
                                  addSuffix: true, 
                                  locale: el 
                                })}
                              </span>
                              <Link to={`/publish?id=${listing.id}`}>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Settings className="h-4 w-4" />
                                  Επεξεργασία
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && (!listings || listings.length === 0) && (
              <Card className="text-center py-12">
                <CardContent className="space-y-6">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <List className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      Δεν έχετε δημιουργήσει αγγελίες ακόμα
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ξεκινήστε να δημοσιεύετε τους χώρους σας και προσελκύστε 
                      τους ιδανικούς συγκατοίκους. Η διαδικασία είναι γρήγορη και εύκολη.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/publish">
                      <Button variant="hero" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Δημιουργία Αγγελίας
                      </Button>
                    </Link>
                    
                    <Link to="/help">
                      <Button variant="outline" className="gap-2">
                        Οδηγός Δημοσίευσης
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  💡 Συμβουλές για Επιτυχημένες Αγγελίες
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Προσθέστε τουλάχιστον 5 φωτογραφίες υψηλής ποιότητας
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Γράψτε λεπτομερή περιγραφή με τις παροχές και τους κανόνες
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Καθορίστε σαφή τιμή και διαθεσιμότητα
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">
                    Απαντήστε γρήγορα στα μηνύματα για καλύτερα αποτελέσματα
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyListings;