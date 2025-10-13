import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isAdmin, loading } = useAdminCheck();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Έλεγχος δικαιωμάτων...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Δεν έχετε δικαιώματα πρόσβασης</AlertTitle>
          <AlertDescription>
            Αυτή η σελίδα είναι διαθέσιμη μόνο για διαχειριστές.
          </AlertDescription>
        </Alert>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <>{children}</>;
};
