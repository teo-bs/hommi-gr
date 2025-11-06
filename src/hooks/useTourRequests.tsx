import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface TourRequest {
  id: string;
  thread_id: string;
  listing_id: string;
  requested_by: string;
  requested_time: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  confirmed_at?: string;
}

export function useTourRequests(threadId: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tours, setTours] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = async () => {
    if (!threadId) return;

    try {
      const { data, error } = await supabase
        .from('tour_requests')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTours((data || []) as TourRequest[]);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTourRequest = async (listingId: string, requestedTime: Date, notes?: string) => {
    if (!profile) return null;

    try {
      const { data, error } = await supabase
        .from('tour_requests')
        .insert({
          thread_id: threadId,
          listing_id: listingId,
          requested_by: profile.id,
          requested_time: requestedTime.toISOString(),
          notes
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Επιτυχία',
        description: 'Το αίτημα επίσκεψης στάλθηκε'
      });

      fetchTours();
      return data;
    } catch (error: any) {
      toast({
        title: 'Σφάλμα',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateTourStatus = async (tourId: string, status: TourRequest['status']) => {
    try {
      const updates: any = { status };
      
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tour_requests')
        .update(updates)
        .eq('id', tourId);

      if (error) throw error;

      toast({
        title: 'Επιτυχία',
        description: 'Η κατάσταση ενημερώθηκε'
      });

      fetchTours();
    } catch (error: any) {
      toast({
        title: 'Σφάλμα',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchTours();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`tour_requests:${threadId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tour_requests',
        filter: `thread_id=eq.${threadId}`
      }, () => {
        fetchTours();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  return {
    tours,
    loading,
    createTourRequest,
    updateTourStatus,
    refetch: fetchTours
  };
}
