import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export const NotificationPrompt = () => {
  const { user } = useAuth();
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Check if user has previously dismissed the prompt
  useEffect(() => {
    const isDismissed = localStorage.getItem('notification-prompt-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await requestPermission();
    setRequesting(false);
    
    if (granted) {
      setDismissed(true);
      localStorage.setItem('notification-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Don't show if:
  // - Not logged in
  // - Browser doesn't support notifications
  // - Permission already granted or denied
  // - User has dismissed the prompt
  if (!user || !isSupported || permission !== 'default' || dismissed) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Ενεργοποίηση ειδοποιήσεων
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Λάβε ειδοποιήσεις για νέα μηνύματα ακόμα και όταν η εφαρμογή είναι κλειστή.
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleRequestPermission}
                disabled={requesting}
                className="h-8"
              >
                <Bell className="h-3.5 w-3.5 mr-1.5" />
                {requesting ? 'Ενεργοποίηση...' : 'Ενεργοποίηση'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8"
              >
                Όχι τώρα
              </Button>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
