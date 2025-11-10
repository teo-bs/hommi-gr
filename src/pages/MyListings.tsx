import React, { useState } from 'react';
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Eye, Heart, Home, MessageCircle, Plus, Users, Edit, FileText, Archive, AlertTriangle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/owner/DeleteConfirmDialog";
import { Link } from "react-router-dom";
import { useMyListings, OwnerListingFilters as FilterType } from "@/hooks/useMyListings";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { OwnerListingFiltersComponent } from '@/components/owner/OwnerListingFilters';
import { BulkActionsBar } from '@/components/owner/BulkActionsBar';

const MyListings = () => {
  const [activeTab, setActiveTab] = useState<'draft' | 'published' | 'archived'>('published');
  const [filters, setFilters] = useState<FilterType>({ status: 'published', page: 1, pageSize: 24 });
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useMyListings(filters);
  const listings = data?.listings || [];
  const totalCount = data?.totalCount || 0;

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

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;

    try {
      const nowISO = new Date().toISOString();
      
      const { error } = await supabase
        .from('listings')
        .update({ deleted_at: nowISO } as any)
        .eq('id', listingToDelete);

      if (error) throw error;

      toast({
        title: "Επιτυχής διαγραφή",
        description: "Η αγγελία διαγράφηκε"
      });
      
      refetch();
      setSelectedListings(new Set());
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η διαγραφή της αγγελίας",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  // Bulk actions
  const handleBulkPublish = async () => {
    const ids = Array.from(selectedListings);
    try {
      await supabase.from('listings').update({ status: 'published' }).in('id', ids);
      toast({ title: "Επιτυχής ενημέρωση", description: `${ids.length} αγγελίες δημοσιεύτηκαν` });
      refetch();
      setSelectedListings(new Set());
    } catch (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία δημοσίευσης", variant: "destructive" });
    }
  };

  const handleBulkUnpublish = async () => {
    const ids = Array.from(selectedListings);
    try {
      await supabase.from('listings').update({ status: 'draft' }).in('id', ids);
      toast({ title: "Επιτυχής ενημέρωση", description: `${ids.length} αγγελίες αποσύρθηκαν` });
      refetch();
      setSelectedListings(new Set());
    } catch (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία απόσυρσης", variant: "destructive" });
    }
  };

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedListings);
    const nowISO = new Date().toISOString();
    try {
      await supabase.from('listings').update({ deleted_at: nowISO }).in('id', ids);
      toast({ title: "Επιτυχής αρχειοθέτηση", description: `${ids.length} αγγελίες αρχειοθετήθηκαν` });
      refetch();
      setSelectedListings(new Set());
    } catch (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία αρχειοθέτησης", variant: "destructive" });
    }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selectedListings);
    try {
      await supabase.from('listings').update({ deleted_at: null }).in('id', ids);
      toast({ title: "Επιτυχής επαναφορά", description: `${ids.length} αγγελίες επαναφέρθηκαν` });
      refetch();
      setSelectedListings(new Set());
    } catch (error) {
      toast({ title: "Σφάλμα", description: "Αποτυχία επαναφοράς", variant: "destructive" });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'draft' | 'published' | 'archived');
    setFilters({ ...filters, status: value as 'draft' | 'published' | 'archived', page: 1 });
    setSelectedListings(new Set());
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedListings);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedListings(newSet);
  };

  const totalPages = Math.ceil(totalCount / (filters.pageSize || 24));

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

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Οι Αγγελίες μου
                </h1>
                <p className="text-muted-foreground text-lg">
                  Διαχειριστείτε τις αγγελίες σας και παρακολουθήστε την απόδοσή τους
                </p>
              </div>
              <Link to="/publish">
                <Button 
                  variant="hero" 
                  className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" />
                  Νέα Αγγελία
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <OwnerListingFiltersComponent
              filters={filters}
              onFiltersChange={(newFilters) => setFilters({ ...filters, ...newFilters, page: 1 })}
            />

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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
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
                      <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <Skeleton className="h-32 w-48 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-4">
                              <Skeleton className="h-7 w-3/4" />
                              <Skeleton className="h-5 w-1/2" />
                              <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                              <div className="flex gap-2 mt-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Skeleton className="h-10 w-32" />
                              <Skeleton className="h-10 w-32" />
                            </div>
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
                      const isSelected = selectedListings.has(listing.id);
                      return (
                      <Card 
                        key={listing.id} 
                        className={`overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.005] ${
                          hasBrokenPhotos ? 'border-destructive border-2' : ''
                        } ${
                          isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/10' : ''
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Selection Checkbox */}
                            <div className="flex items-start pt-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSelection(listing.id)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                            </div>
                            {/* Image */}
                            <div className="relative w-48 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                              {listing.cover_photo_url ? (
                                <img 
                                  src={listing.cover_photo_url} 
                                  alt={listing.title}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
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
                              <Link to={hasBrokenPhotos ? `/publish?id=${listing.id}&step=6` : `/publish?id=${listing.id}`}>
                                <Button 
                                  variant={hasBrokenPhotos ? "destructive" : "outline"} 
                                  size="sm" 
                                  className="w-full transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
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
                                  className="transition-all duration-200 hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md"
                                >
                                  Δημοσίευση
                                </Button>
                              )}
                              
                              {listing.status === 'published' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(listing.id, 'archived')}
                                  className="transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
                                >
                                  Αρχειοθέτηση
                                </Button>
                              )}

                              {listing.status === 'draft' && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    setListingToDelete(listing.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="gap-1 transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Διαγραφή
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

                {/* Pagination */}
                {!isLoading && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                      disabled={(filters.page || 1) === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Προηγούμενη
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const current = filters.page || 1;
                          return page === 1 || page === totalPages || Math.abs(page - current) <= 1;
                        })
                        .map((page, idx, arr) => (
                          <>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span key={`ellipsis-${page}`} className="px-2">...</span>
                            )}
                            <Button
                              key={page}
                              variant={(filters.page || 1) === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFilters({ ...filters, page })}
                            >
                              {page}
                            </Button>
                          </>
                        ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({ ...filters, page: Math.min(totalPages, (filters.page || 1) + 1) })}
                      disabled={(filters.page || 1) >= totalPages}
                    >
                      Επόμενη
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && listings.length === 0 && (
                  <Card className="text-center py-16 border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardContent className="space-y-8">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                        {activeTab === 'draft' && <FileText className="h-10 w-10 text-primary" />}
                        {activeTab === 'published' && <Home className="h-10 w-10 text-primary" />}
                        {activeTab === 'archived' && <Archive className="h-10 w-10 text-primary" />}
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-foreground">
                          {activeTab === 'draft' && 'Δεν έχετε πρόχειρες αγγελίες'}
                          {activeTab === 'published' && 'Δεν έχετε δημοσιευμένες αγγελίες'}
                          {activeTab === 'archived' && 'Δεν έχετε αρχειοθετημένες αγγελίες'}
                        </h3>
                        <p className="text-muted-foreground text-lg max-w-md mx-auto">
                          {activeTab === 'draft' && 'Ξεκινήστε τη δημιουργία μιας νέας αγγελίας για να την αποθηκεύσετε ως πρόχειρο.'}
                          {activeTab === 'published' && 'Δημιουργήστε και δημοσιεύστε την πρώτη σας αγγελία για να ξεκινήσετε.'}
                          {activeTab === 'archived' && 'Οι αρχειοθετημένες αγγελίες θα εμφανιστούν εδώ.'}
                        </p>
                      </div>

                      <Link to="/publish">
                        <Button 
                          variant="hero" 
                          className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                        >
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
            <Card className="mt-8 border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Συμβουλές για Επιτυχημένες Αγγελίες
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

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedListings.size}
          onSelectAll={() => setSelectedListings(new Set(listings.map(l => l.id)))}
          onDeselectAll={() => setSelectedListings(new Set())}
          onPublish={handleBulkPublish}
          onUnpublish={handleBulkUnpublish}
          onArchive={handleBulkArchive}
          onRestore={handleBulkRestore}
          showRestore={filters.showArchived === true}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteListing}
          title="Διαγραφή αγγελίας;"
          description="Η αγγελία θα διαγραφεί οριστικά. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
          confirmText="Διαγραφή"
        />
      </div>
    </>
  );
};

export default MyListings;