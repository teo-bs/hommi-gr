import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatRequest {
  id: string;
  listing_id: string;
  seeker_id: string;
  host_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked' | 'archived';
  created_at: string;
  accepted_at?: string;
  declined_at?: string;
}

export const useChatRequests = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const createChatRequest = useCallback(async (
    listingId: string, 
    hostProfileId: string,
    initialMessage: string
  ): Promise<{ success: boolean; threadId?: string; error?: string }> => {
    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    setLoading(true);
    try {
      console.log('Creating chat request:', { listingId, hostProfileId, seekerId: profile.id });

      // Check if thread already exists
      const { data: existingThread, error: checkError } = await supabase
        .from('threads')
        .select('*')
        .eq('listing_id', listingId)
        .eq('seeker_id', profile.id)
        .eq('host_id', hostProfileId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing thread:', checkError);
        return { success: false, error: "Failed to check existing request" };
      }

      if (existingThread) {
        if (existingThread.status === 'pending') {
          return { success: false, error: "Request already sent and pending" };
        } else if (existingThread.status === 'accepted') {
          return { success: true, threadId: existingThread.id };
        } else if (existingThread.status === 'declined') {
          // Allow creating new request after decline
          const { error: updateError } = await supabase
            .from('threads')
            .update({ 
              status: 'pending', 
              declined_at: null,
              created_at: new Date().toISOString()
            })
            .eq('id', existingThread.id);

          if (updateError) {
            console.error('Error updating thread:', updateError);
            return { success: false, error: "Failed to resend request" };
          }

          toast.success("Request sent!");
          return { success: true, threadId: existingThread.id };
        }
      }

      // Create new thread
      const { data: newThread, error: createError } = await supabase
        .from('threads')
        .insert({
          listing_id: listingId,
          seeker_id: profile.id,
          host_id: hostProfileId,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating thread:', createError);
        return { success: false, error: "Failed to create request" };
      }

      // Send initial message if provided
      if (initialMessage && newThread) {
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            thread_id: newThread.id,
            sender_id: profile.id,
            body: initialMessage
          });

        if (messageError) {
          console.error('Error sending initial message:', messageError);
          // Don't fail the whole request if message fails
        }
      }

      toast.success("Request sent!");
      return { success: true, threadId: newThread.id };

    } catch (error) {
      console.error('Unexpected error creating chat request:', error);
      return { success: false, error: "Unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const respondToRequest = useCallback(async (
    threadId: string,
    response: 'accepted' | 'declined'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_thread_status', {
        thread_id: threadId,
        new_status: response
      });

      if (error) {
        console.error('Error updating thread status:', error);
        return { success: false, error: "Failed to update request" };
      }

      toast.success(response === 'accepted' ? "Request accepted!" : "Request declined");
      return { success: true };

    } catch (error) {
      console.error('Unexpected error responding to request:', error);
      return { success: false, error: "Unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getPendingRequests = useCallback(async (): Promise<{
    success: boolean;
    requests?: ChatRequest[];
    error?: string;
  }> => {
    if (!user || !profile) {
      return { success: false, error: "Authentication required" };
    }

    try {
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          listing:listings(title, city),
          seeker:profiles!threads_seeker_id_fkey(display_name, avatar_url)
        `)
        .eq('host_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        return { success: false, error: "Failed to fetch requests" };
      }

      return { success: true, requests: data || [] };
    } catch (error) {
      console.error('Unexpected error fetching requests:', error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }, [user, profile]);

  return {
    createChatRequest,
    respondToRequest,
    getPendingRequests,
    loading
  };
};