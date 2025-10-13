import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserImpersonateButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export function UserImpersonateButton({ userId, userName, userEmail }: UserImpersonateButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Σφάλμα',
        description: 'Παρακαλώ εισάγετε λόγο impersonation',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-impersonate-user', {
        body: { target_user_id: userId, reason },
      });

      if (error) throw error;

      // Store original session info
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        sessionStorage.setItem('admin_session', JSON.stringify({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        }));
      }

      // Store impersonation info
      sessionStorage.setItem('impersonation', JSON.stringify({
        target_user_id: userId,
        target_user_name: userName,
        target_user_email: userEmail,
        expires_at: data.expires_at,
      }));

      // Set the new session
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (setSessionError) throw setSessionError;

      toast({
        title: 'Επιτυχία',
        description: `Συνδεθήκατε ως ${userName}`,
      });

      // Reload to apply new session
      window.location.href = '/';
    } catch (error: any) {
      console.error('Impersonation error:', error);
      toast({
        title: 'Σφάλμα',
        description: error.message || 'Αποτυχία impersonation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setOpen(false);
      setReason('');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8"
      >
        <UserCog className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Σύνδεση ως Χρήστης</DialogTitle>
            <DialogDescription>
              Θα συνδεθείτε ως: <strong>{userName}</strong> ({userEmail})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Λόγος impersonation *</Label>
              <Textarea
                id="reason"
                placeholder="π.χ. Support ticket #1234 - Χρήστης αναφέρει πρόβλημα με αγγελία"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Αυτό το impersonation θα καταγραφεί για λόγους ασφάλειας και θα λήξει σε 30 λεπτά.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Ακύρωση
            </Button>
            <Button onClick={handleImpersonate} disabled={loading || !reason.trim()}>
              {loading ? 'Φόρτωση...' : 'Σύνδεση'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
