import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function ImpersonationBanner() {
  const [impersonation, setImpersonation] = useState<any>(null);

  useEffect(() => {
    const impersonationData = sessionStorage.getItem('impersonation');
    if (impersonationData) {
      setImpersonation(JSON.parse(impersonationData));
    }
  }, []);

  const handleExit = async () => {
    try {
      // Get stored admin session
      const adminSessionData = sessionStorage.getItem('admin_session');
      if (!adminSessionData) {
        throw new Error('Admin session not found');
      }

      const adminSession = JSON.parse(adminSessionData);

      // Restore admin session
      const { error } = await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      if (error) throw error;

      // Clear impersonation data
      sessionStorage.removeItem('impersonation');
      sessionStorage.removeItem('admin_session');

      toast({
        title: 'Επιτυχία',
        description: 'Επιστροφή στο admin session',
      });

      // Reload to apply admin session
      window.location.href = '/admin';
    } catch (error: any) {
      console.error('Exit impersonation error:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία εξόδου από impersonation',
        variant: 'destructive',
      });
    }
  };

  if (!impersonation) return null;

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          🔴 Προβολή ως {impersonation.target_user_name} ({impersonation.target_user_email})
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExit}
        className="h-7 text-destructive-foreground hover:text-destructive-foreground"
      >
        <X className="h-4 w-4 mr-1" />
        Έξοδος από Impersonation
      </Button>
    </div>
  );
}
