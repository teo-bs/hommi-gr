import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Download, Edit, Trash2, RefreshCw } from 'lucide-react';
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
  const { user: adminUser } = useAuth();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editValue, setEditValue] = useState(verification.value || '');

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('verifications')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          metadata: {
            ...verification.metadata,
            verified_by: adminUser?.id,
            verified_method: 'manual',
            verified_at: new Date().toISOString()
          }
        })
        .eq('id', verification.id);

      if (error) throw error;

      // Update profile kyc_status if govgr verification
      if (verification.kind === 'govgr') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ kyc_status: 'approved' })
          .eq('user_id', verification.user_id);

        if (profileError) throw profileError;
      }
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
          status: 'unverified',
          metadata: {
            ...verification.metadata,
            rejection_reason: reason,
            rejected_by: adminUser?.id,
            rejected_at: new Date().toISOString()
          }
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

  const editMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('verifications')
        .update({ 
          value: editValue,
          metadata: {
            ...verification.metadata,
            edited_by: adminUser?.id,
            edited_at: new Date().toISOString(),
            previous_value: verification.value
          }
        })
        .eq('id', verification.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Η επαλήθευση ενημερώθηκε');
      setEditMode(false);
      onRefetch();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά την επεξεργασία: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete file from storage if exists
      if (verification.metadata?.file_url || verification.value?.includes('verification-documents')) {
        const fileUrl = verification.metadata?.file_url || verification.value;
        const pathMatch = fileUrl.match(/verification-documents\/(.+)$/);
        if (pathMatch) {
          const path = pathMatch[1];
          await supabase.storage.from('verification-documents').remove([path]);
        }
      }
      
      // Delete verification record
      const { error } = await supabase
        .from('verifications')
        .delete()
        .eq('id', verification.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Η επαλήθευση διαγράφηκε');
      setDeleteDialogOpen(false);
      onRefetch();
      onClose();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά τη διαγραφή: ' + error.message);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('verifications')
        .update({ 
          status: 'unverified',
          verified_at: null,
          metadata: {
            ...verification.metadata,
            revoked_by: adminUser?.id,
            revoked_at: new Date().toISOString(),
            revoke_reason: 'Manual revoke by admin'
          }
        })
        .eq('id', verification.id);

      if (error) throw error;

      // Update profile kyc_status if govgr verification
      if (verification.kind === 'govgr') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ kyc_status: 'none' })
          .eq('user_id', verification.user_id);

        if (profileError) console.warn('Could not update profile kyc_status');
      }
    },
    onSuccess: () => {
      toast.success('Η επαλήθευση ανακλήθηκε');
      onRefetch();
    },
    onError: (error) => {
      toast.error('Σφάλμα κατά την ανάκληση: ' + error.message);
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

  const renderValueField = () => {
    if (verification.kind === 'govgr') {
      // Show document viewer for ID
      const imageUrl = verification.metadata?.file_url || verification.value;
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Έγγραφο Ταυτότητας</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Λήψη
            </Button>
          </div>
          <ImageViewer imageUrl={imageUrl} />
        </div>
      );
    }

    // Show editable field for email/phone
    if (editMode) {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Τιμή</label>
          <Input
            type={verification.kind === 'email' ? 'email' : 'tel'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={verification.kind === 'email' ? 'email@example.com' : '+30 69X XXX XXXX'}
          />
        </div>
      );
    }

    return (
      <div>
        <div className="text-muted-foreground text-sm">Τιμή</div>
        <div className="font-medium">{verification.value || 'Δεν έχει οριστεί'}</div>
      </div>
    );
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
              {verification.metadata?.verified_by && (
                <div>
                  <div className="text-muted-foreground">Επαληθεύτηκε από</div>
                  <div className="font-medium">Admin</div>
                </div>
              )}
              {verification.metadata?.method && (
                <div>
                  <div className="text-muted-foreground">Μέθοδος</div>
                  <div className="font-medium">
                    {verification.metadata.method === 'manual' ? 'Χειροκίνητη' : 'Αυτόματη'}
                  </div>
                </div>
              )}
            </div>

            {/* Value / Document */}
            {renderValueField()}

            {/* Rejection Reason */}
            {verification.metadata?.rejection_reason && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <div className="text-sm font-medium text-destructive">Λόγος απόρριψης</div>
                <div className="text-sm mt-1">{verification.metadata.rejection_reason}</div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={onClose}>
              Κλείσιμο
            </Button>
            
            {verification.status === 'verified' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => revokeMutation.mutate()}
                  disabled={revokeMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Ανάκληση
                </Button>
              </>
            )}

            {(verification.status === 'pending' || verification.status === 'unverified') && (
              <>
                {verification.kind !== 'govgr' && (
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editMode ? 'Ακύρωση' : 'Επεξεργασία'}
                  </Button>
                )}
                
                {editMode && (
                  <Button
                    onClick={() => editMutation.mutate()}
                    disabled={editMutation.isPending}
                  >
                    Αποθήκευση
                  </Button>
                )}

                {!editMode && (
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
              </>
            )}

            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Διαγραφή
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Επαλήθευσης</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την επαλήθευση; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate()}
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
