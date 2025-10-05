import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Eye, Heart, Home, MessageCircle, Plus, Users, Edit, FileText, Archive, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyListings } from "@/hooks/useMyListings";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const MyListings = () => {
  const [activeTab, setActiveTab] = useState<'draft' | 'published' | 'archived'>('published');
  const { data: listings = [], isLoading, error, refetch } = useMyListings(activeTab);

  // Query broken photos for current user's listings
  const { data: brokenPhotos = [] } = useQuery({
    queryKey: ['broken-photos'],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) return [];

      const { data } = await supabase
        .from('broken_photos_log')
        .select('room_id, photo_url')
        .eq('lister_id', profile.id);

      return data || [];
    }
  });

  // Group broken photos by listing
  const brokenPhotosByListing = new Map<string, number>();
  listings.forEach(listing => {
    const count = brokenPhotos.filter(bp => 
      bp.room_id && listing.id // matching by listing.id as room_id proxy
    ).length;
    if (count > 0) {
      brokenPhotosByListing.set(listing.id, count);
    }
  });

  const handleStatusChange = async (listingId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      toast({
        title: "Επιτυχής ενημέρωση",
        description: `Η αγγελία ενημερώθηκε σε "${newStatus === 'draft' ? 'Πρόχειρο' : newStatus === 'published' ? 'Δημοσιευμένο' : 'Αρχειοθετημένο'}"`
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating listing status:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ενημέρωση της αγγελίας",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Σφάλμα κατά τη φόρτωση των αγγελιών</p>
            <p className="text-sm text-muted-foreground mt-2">
              Παρακαλώ δοκιμάστε ξανά αργότερα
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Οι Αγγελίες μου
                </h1>
                <p className="text-muted-foreground">
                  Διαχειριστείτε τις αγγελίες σας και παρακολουθήστε την απόδοσή τους
                </p>
              </div>
              <Link to="/publish">
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Νέα Αγγελία
                </Button>
              </Link>
            </div>

            {/* Broken Photos Warning Banner */}
            {brokenPhotos.length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Προσοχή:</strong> Κάποιες από τις φωτογραφίες σας δεν εμφανίζονται σωστά. 
                  Επηρεάζονται {brokenPhotosByListing.size} αγγελί{brokenPhotosByListing.size === 1 ? 'α' : 'ες'}. 
                  Παρακαλούμε επεξεργαστείτε τις και ανεβάστε ξανά τις φωτογραφίες.
                </AlertDescription>
              </Alert>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'draft' | 'published' | 'archived')} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="draft" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Πρόχειρα
                </TabsTrigger>
                <TabsTrigger value="published" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Δημοσιευμένα
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Αρχειοθετημένα
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {/* Loading State */}
                {isLoading && (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <Skeleton className="h-32 w-48 rounded-lg" />
                            <div className="flex-1 space-y-4">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <div className="flex gap-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                            </div>
                            <Skeleton className="h-10 w-24" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Listings */}
                {!isLoading && listings.length > 0 && (
                  <div className="space-y-6">
                    {listings.map((listing) => {
                      const hasBrokenPhotos = brokenPhotosByListing.has(listing.id);
                      return (
                      <Card key={listing.id} className={`overflow-hidden ${hasBrokenPhotos ? 'border-destructive border-2' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Image */}
                            <div className="relative w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              {listing.cover_photo_url ? (
                                <img 
                                  src={listing.cover_photo_url} 
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="text-xl font-semibold text-foreground mb-1 flex items-center gap-2">
                                    {listing.title}
                                    {hasBrokenPhotos && (
                                      <Badge variant="destructive" className="gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Φωτογραφίες
                                      </Badge>
                                    )}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {listing.neighborhood}, {listing.city}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge 
                                    variant={
                                      listing.status === 'published' ? 'default' : 
                                      listing.status === 'draft' ? 'secondary' : 
                                      'outline'
                                    }
                                  >
                                    {listing.status === 'published' ? 'Δημοσιευμένο' : 
                                     listing.status === 'draft' ? 'Πρόχειρο' : 
                                     'Αρχειοθετημένο'}
                                  </Badge>
                                  <p className="text-xl font-bold text-primary">
                                    €{listing.price_month}/μήνα
                                  </p>
                                </div>
                              </div>

                              {/* Features */}
                              <div className="flex items-center gap-4 mb-4">
                                {listing.flatmates_count > 0 && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm">{listing.flatmates_count} συγκάτοικοι</span>
                                  </div>
                                )}
                                {listing.couples_accepted && (
                                  <Badge variant="outline" className="text-xs">
                                    Ζευγάρια OK
                                  </Badge>
                                )}
                                {listing.pets_allowed && (
                                  <Badge variant="outline" className="text-xs">
                                    Κατοικίδια OK
                                  </Badge>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{listing.view_count} προβολές</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{listing.request_count} αιτήσεις</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Δημιουργήθηκε {new Date(listing.created_at).toLocaleDateString('el-GR')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Link to={`/publish?id=${listing.id}`}>
                                <Button 
                                  variant={hasBrokenPhotos ? "destructive" : "outline"} 
                                  size="sm" 
                                  className="w-full"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {hasBrokenPhotos ? 'Διόρθωση Φωτογραφιών' : 'Επεξεργασία'}
                                </Button>
                              </Link>
                              
                              {listing.status !== 'published' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(listing.id, 'published')}
                                >
                                  Δημοσίευση
                                </Button>
                              )}
                              
                              {listing.status === 'published' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(listing.id, 'archived')}
                                >
                                  Αρχειοθέτηση
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && listings.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent className="space-y-6">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        {activeTab === 'draft' && <FileText className="h-8 w-8 text-muted-foreground" />}
                        {activeTab === 'published' && <Home className="h-8 w-8 text-muted-foreground" />}
                        {activeTab === 'archived' && <Archive className="h-8 w-8 text-muted-foreground" />}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {activeTab === 'draft' && 'Δεν έχετε πρόχειρες αγγελίες'}
                          {activeTab === 'published' && 'Δεν έχετε δημοσιευμένες αγγελίες'}
                          {activeTab === 'archived' && 'Δεν έχετε αρχειοθετημένες αγγελίες'}
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {activeTab === 'draft' && 'Ξεκινήστε τη δημιουργία μιας νέας αγγελίας για να την αποθηκεύσετε ως πρόχειρο.'}
                          {activeTab === 'published' && 'Δημιουργήστε και δημοσιεύστε την πρώτη σας αγγελία για να ξεκινήσετε.'}
                          {activeTab === 'archived' && 'Οι αρχειοθετημένες αγγελίες θα εμφανιστούν εδώ.'}
                        </p>
                      </div>

                      <Link to="/publish">
                        <Button variant="hero" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Δημιουργία Αγγελίας
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Tips Card */}
            <Card className="mt-8">
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