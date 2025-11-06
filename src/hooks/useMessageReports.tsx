import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useMessageReports() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);

  const reportMessage = async (messageId: string, reason: string, details?: string) => {
    if (!profile?.id) return false;

    setIsReporting(true);
    try {
      const { error } = await supabase
        .from('reported_messages')
        .insert({
          message_id: messageId,
          reporter_id: profile.id,
          reason,
          details
        });

      if (error) throw error;

      toast({
        title: 'Αναφορά υποβλήθηκε',
        description: 'Θα εξετάσουμε την αναφορά σας το συντομότερο δυνατό'
      });

      return true;
    } catch (err: any) {
      console.error('Error reporting message:', err);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η υποβολή της αναφοράς',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsReporting(false);
    }
  };

  const reportThread = async (threadId: string, reason: string, details?: string) => {
    if (!profile?.id) return false;

    setIsReporting(true);
    try {
      const { error } = await supabase
        .from('reported_threads')
        .insert({
          thread_id: threadId,
          reporter_id: profile.id,
          reason,
          details
        });

      if (error) throw error;

      toast({
        title: 'Αναφορά υποβλήθηκε',
        description: 'Θα εξετάσουμε την αναφορά σας το συντομότερο δυνατό'
      });

      return true;
    } catch (err: any) {
      console.error('Error reporting thread:', err);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν ήταν δυνατή η υποβολή της αναφοράς',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsReporting(false);
    }
  };

  return {
    reportMessage,
    reportThread,
    isReporting
  };
}
