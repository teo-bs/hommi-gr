import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ImageViewer } from './ImageViewer';
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

interface VerificationViewerProps {
  verification: any;
  open: boolean;
  onClose: () => void;
  onRefetch: () => void;
}

export function VerificationViewer({ verification, open, onClose, onRefetch }: VerificationViewerProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('verifications')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      if (error) throw error;

      // Update profile kyc_status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'approved' })
        .eq('user_id', verification.user_id);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      toast.success('Η επαλήθευση εγκρίθηκε επιτυχώς');
      onRefetch();
      onClose();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά την έγκριση: ' + error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const { error } = await supabase
        .from('verifications')
        .update({ 
          status: 'pending',
        })
        .eq('id', verification.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Η επαλήθευση απορρίφθηκε');
      setRejectDialogOpen(false);
      setRejectReason('');
      onRefetch();
      onClose();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά την απόρριψη: ' + error.message);
    },
  });

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Παρακαλώ εισάγετε λόγο απόρριψης');
      return;
    }
    rejectMutation.mutate(rejectReason);
  };

  const getKindLabel = (kind: string) => {
    const labels: Record<string, string> = {
      govgr: 'Ταυτότητα',
      phone: 'Τηλέφωνο',
      email: 'Email',
      facebook: 'Facebook',
      google: 'Google',
    };
    return labels[kind] || kind;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', text: 'Εκκρεμεί' },
      unverified: { variant: 'secondary', text: 'Μη επαληθευμένο' },
      verified: { variant: 'default', text: 'Επαληθευμένο' },
    };

    const config = variants[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επαλήθευση {getKindLabel(verification.kind)}</DialogTitle>
            <DialogDescription>
              Αίτημα από {verification.user?.display_name || 'Unknown'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              {verification.user?.avatar_url && (
                <img
                  src={verification.user.avatar_url}
                  alt={verification.user.display_name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg">{verification.user?.display_name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{verification.user?.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Κατάσταση</div>
                {getStatusBadge(verification.status)}
              </div>
            </div>

            {/* Verification Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Τύπος</div>
                <div className="font-medium">{getKindLabel(verification.kind)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Ημερομηνία Υποβολής</div>
                <div className="font-medium">
                  {new Date(verification.created_at).toLocaleDateString('el-GR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Document Image */}
            {verification.kind === 'govgr' && verification.value && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Έγγραφο Ταυτότητας</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(verification.value, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Λήψη
                  </Button>
                </div>
                <ImageViewer imageUrl={verification.value} />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose}>
              Κλείσιμο
            </Button>
            {verification.status === 'unverified' && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Απόρριψη
                </Button>
                <Button
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Έγκριση
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Απόρριψη Επαλήθευσης</AlertDialogTitle>
            <AlertDialogDescription>
              Παρακαλώ εισάγετε τον λόγο απόρριψης. Ο χρήστης θα ενημερωθεί.
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
