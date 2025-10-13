import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ListingQuickView } from './ListingQuickView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

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
                <TableCell>{listing.owner?.display_name || 'Unknown'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(listing.created_at).toLocaleDateString('el-GR')}
                </TableCell>
                <TableCell>{getStatusBadge(listing.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <Eye className="h-4 w-4" />
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
          onClose={() => setSelectedListing(null)}
          onApprove={() => {
            approveMutation.mutate(selectedListing.id);
            setSelectedListing(null);
          }}
          onReject={() => {
            handleReject(selectedListing);
            setSelectedListing(null);
          }}
        />
      )}

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
    </>
  );
}
