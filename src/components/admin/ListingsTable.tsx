import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, CheckCircle, XCircle, Flag, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ListingQuickView } from './ListingQuickView';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { FlagDialog } from './FlagDialog';
import { UserImpersonateButton } from './UserImpersonateButton';

interface ListingsTableProps {
  listings: any[];
  isLoading: boolean;
  onRefetch: () => void;
}

export function ListingsTable({ listings, isLoading, onRefetch }: ListingsTableProps) {
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [listingToReject, setListingToReject] = useState<any>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const approveMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const { data, error } = await supabase.rpc('publish_listing_atomic', {
        p_listing_id: listingId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Η αγγελία εγκρίθηκε επιτυχώς');
      onRefetch();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά την έγκριση: ' + error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string; reason: string }) => {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: 'archived',
          publish_warnings: { rejection_reason: reason }
        })
        .eq('id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Η αγγελία απορρίφθηκε');
      setRejectDialogOpen(false);
      setRejectReason('');
      setListingToReject(null);
      onRefetch();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά την απόρριψη: ' + error.message);
    },
  });

  const flagMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('listings')
        .update({
          flagged_at: new Date().toISOString(),
          flagged_reason: reason,
          flagged_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Η αγγελία επισημάνθηκε');
      onRefetch();
      setShowFlagDialog(false);
    },
    onError: (error) => {
      toast.error('Αποτυχία επισήμανσης αγγελίας');
      console.error('Flag error:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete the listing - this will automatically trigger cache refresh via database trigger
      const { error } = await supabase
        .from('listings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Η αγγελία διαγράφηκε - η λίστα αναζήτησης θα ενημερωθεί αυτόματα');
      onRefetch();
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error('Αποτυχία διαγραφής αγγελίας');
      console.error('Delete error:', error);
    },
  });

  const handleReject = (listing: any) => {
    setListingToReject(listing);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!listingToReject || !rejectReason.trim()) {
      toast.error('Παρακαλώ εισάγετε λόγο απόρριψης');
      return;
    }
    rejectMutation.mutate({ listingId: listingToReject.id, reason: rejectReason });
  };

  const getCoverPhoto = (listing: any) => {
    const coverPhoto = listing.photos?.find((p: any) => p.is_cover);
    return coverPhoto?.url || listing.photos?.[0]?.url;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', text: 'Εκκρεμεί' },
      published: { variant: 'default', text: 'Δημοσιευμένη' },
      archived: { variant: 'outline', text: 'Αρχειοθετημένη' },
      publishing: { variant: 'secondary', text: 'Δημοσίευση...' },
    };

    const config = variants[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Δεν βρέθηκαν αγγελίες
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Φωτό</TableHead>
              <TableHead>Τίτλος</TableHead>
              <TableHead>Ιδιοκτήτης</TableHead>
              <TableHead>Ημερομηνία</TableHead>
              <TableHead>Κατάσταση</TableHead>
              <TableHead>Επισήμανση</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <img
                    src={getCoverPhoto(listing) || '/placeholder.svg'}
                    alt={listing.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{listing.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{listing.owner?.display_name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{listing.owner?.email}</span>
                    </div>
                    {listing.owner?.user_id && (
                      <UserImpersonateButton
                        userId={listing.owner.user_id}
                        userName={listing.owner.display_name || 'User'}
                        userEmail={listing.owner.email || ''}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(listing.created_at).toLocaleDateString('el-GR')}
                </TableCell>
                <TableCell>{getStatusBadge(listing.status)}</TableCell>
                <TableCell>
                  {listing.flagged_at && (
                    <Badge variant="destructive" className="gap-1">
                      <Flag className="h-3 w-3" />
                      Επισημασμένη
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedListing(listing);
                        setEditMode(false);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowFlagDialog(true);
                      }}
                    >
                      <Flag className="h-4 w-4 text-yellow-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedListing(listing);
                        setEditMode(true);
                      }}
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                    {listing.status === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => approveMutation.mutate(listing.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleReject(listing)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedListing && (
        <ListingQuickView
          listing={selectedListing}
          open={!!selectedListing}
          onClose={() => {
            setSelectedListing(null);
            setEditMode(false);
          }}
          onApprove={() => {
            approveMutation.mutate(selectedListing.id);
            setSelectedListing(null);
          }}
          onReject={() => {
            handleReject(selectedListing);
            setSelectedListing(null);
          }}
          editMode={editMode}
          onSaveEdit={async (updates) => {
            const { error } = await supabase
              .from('listings')
              .update(updates)
              .eq('id', selectedListing.id);

            if (error) {
              toast.error('Αποτυχία ενημέρωσης αγγελίας');
            } else {
              toast.success('Η αγγελία ενημερώθηκε');
              onRefetch();
              setSelectedListing(null);
              setEditMode(false);
            }
          }}
        />
      )}

      <FlagDialog
        open={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        onConfirm={(reason) => flagMutation.mutate({ id: selectedListing?.id, reason })}
        listingTitle={selectedListing?.title || ''}
      />

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Απόρριψη Αγγελίας</AlertDialogTitle>
            <AlertDialogDescription>
              Παρακαλώ εισάγετε τον λόγο απόρριψης της αγγελίας. Ο ιδιοκτήτης θα ενημερωθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Λόγος απόρριψης..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject}>Απόρριψη</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Αγγελίας</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την αγγελία; Αυτή η ενέργεια μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(selectedListing?.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
