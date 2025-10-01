import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface MessageFlowState {
  // Auth flow
  authModalOpen: boolean;
  termsModalOpen: boolean;
  awaitingTermsAcceptance: boolean;
  
  // Message flow
  conversationOpen: boolean;
  messageToSend: string | null;
  
  // Request flow
  requestSent: boolean;
  requestStatus: 'none' | 'pending' | 'accepted' | 'declined';
  threadId: string | null;
  
  // Return context
  returnAction: (() => void) | null;
}

export const useMessageFlow = (listingId?: string) => {
  const { user, profile, acceptTerms } = useAuth();
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [messageToSend, setMessageToSend] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createChatRequest = async () => {
    if (!user || !profile || !listingId) {
      console.log('Missing required data:', { user: !!user, profile: !!profile, listingId });
      setAuthModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      console.log('Creating chat request for listing:', listingId);
      
      // Get the listing to find the host
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('owner_id')
        .eq('id', listingId)
        .single();

      if (listingError || !listing) {
        console.error('Listing error:', listingError);
        throw new Error('Listing not found');
      }

      console.log('Found listing owner:', listing.owner_id);

      // Check if thread already exists
      const { data: existingThread } = await supabase
        .from('threads')
        .select('*')
        .eq('listing_id', listingId)
        .eq('seeker_id', profile.id)
        .eq('host_id', listing.owner_id)
        .maybeSingle();

      if (existingThread) {
        console.log('Found existing thread:', existingThread);
        setThreadId(existingThread.id);
        setRequestStatus(existingThread.status === 'accepted' ? 'accepted' : 
                        existingThread.status === 'declined' ? 'declined' : 'pending');
        setShowConversation(true); // Always open conversation if thread exists
        return;
      }

      // Create new thread
      console.log('Creating new thread');
      const { data: newThread, error: threadError } = await supabase
        .from('threads')
        .insert([{
          listing_id: listingId,
          seeker_id: profile.id,
          host_id: listing.owner_id,
          status: 'pending'
        }])
        .select()
        .single();

      if (threadError || !newThread) {
        console.error('Thread creation error:', threadError);
        throw new Error('Failed to create thread');
      }

      console.log('Created new thread:', newThread);
      setThreadId(newThread.id);
      setRequestStatus('pending');
      setShowConversation(true); // Open conversation immediately
      
      // Send initial message if provided
      if (messageToSend) {
        console.log('Sending initial message');
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            thread_id: newThread.id,
            sender_id: profile.id,
            body: messageToSend
          });
        
        if (msgError) {
          console.error('Error sending initial message:', msgError);
        }
      }
      
    } catch (error) {
      console.error('Error creating chat request:', error);
      setRequestStatus('none');
    } finally {
      setLoading(false);
    }
  };

  // Load existing thread status on mount
  useEffect(() => {
    const loadThreadStatus = async () => {
      if (!user || !profile || !listingId) return;

      try {
        const { data: listing } = await supabase
          .from('listings')
          .select('owner_id')
          .eq('id', listingId)
          .single();

        if (!listing) return;

        const { data: thread } = await supabase
          .from('threads')
          .select('*')
          .eq('listing_id', listingId)
          .eq('seeker_id', profile.id)
          .eq('host_id', listing.owner_id)
          .single();

        if (thread) {
          setThreadId(thread.id);
          setRequestStatus(thread.status === 'accepted' ? 'accepted' : 
                          thread.status === 'declined' ? 'declined' : 'pending');
          if (thread.status === 'accepted') {
            setShowConversation(true);
          }
        }
      } catch (error) {
        console.error('Error loading thread status:', error);
      }
    };

    loadThreadStatus();
  }, [user, profile, listingId]);

  // Subscribe to thread status changes for real-time updates
  useEffect(() => {
    if (!threadId) return;

    const subscription = supabase
      .channel('thread_status_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'threads', filter: `id=eq.${threadId}` },
        (payload) => {
          const updatedThread = payload.new;
          if (updatedThread.status === 'accepted') {
            setRequestStatus('accepted');
            setShowConversation(true);
            // Optionally show a toast notification
          } else if (updatedThread.status === 'declined') {
            setRequestStatus('declined');
            setShowConversation(false);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [threadId]);

  // Check if user needs to accept terms
  const needsTermsAcceptance = useCallback(() => {
    if (!user || !profile) return false;
    return !profile.terms_accepted_at;
  }, [user, profile]);

  const proceedWithMessage = useCallback((message: string) => {
    setShowConversation(true);
    setMessageToSend(message);
    setAuthModalOpen(false);
    setTermsModalOpen(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    if (needsTermsAcceptance()) {
      setAuthModalOpen(false);
      setTermsModalOpen(true);
    } else {
      const message = messageToSend;
      if (message) {
        proceedWithMessage(message);
      }
      setAuthModalOpen(false);
    }
  }, [needsTermsAcceptance, proceedWithMessage, messageToSend]);

  const handleTermsAccepted = useCallback(async (marketingEmails: boolean) => {
    const { error } = await acceptTerms(marketingEmails);
    
    if (error) {
      console.error('Failed to accept terms:', error);
      return;
    }
    
    const message = messageToSend;
    if (message) {
      proceedWithMessage(message);
    }
    setTermsModalOpen(false);
  }, [acceptTerms, proceedWithMessage, messageToSend]);

  const handleMessageSent = useCallback(async (message: string) => {
    console.log('handleMessageSent called with:', { message, threadId, profile: !!profile });
    
    if (!threadId || !profile) {
      console.error('Cannot send message: missing thread or profile');
      setMessageToSend(message);
      return;
    }

    try {
      console.log('Sending message to thread:', threadId);
      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: profile.id,
          body: message
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent successfully');
      setShowConversation(true);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [threadId, profile]);

  const closeAuth = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const closeConversation = useCallback(() => {
    setShowConversation(false);
    setMessageToSend(null);
  }, []);

  const reset = useCallback(() => {
    setAuthModalOpen(false);
    setTermsModalOpen(false);
    setShowConversation(false);
    setMessageToSend(null);
    setRequestStatus('none');
    setThreadId(null);
  }, []);

  return {
    // State
    requestStatus,
    threadId,
    showConversation,
    conversationOpen: showConversation,
    authModalOpen,
    termsModalOpen,
    messageToSend,
    
    // Actions
    createChatRequest,
    handleAuthSuccess,
    handleTermsAccepted,
    handleMessageSent,
    closeAuth,
    closeConversation,
    reset,
    
    // Helpers
    isAuthenticated: !!user,
    needsTermsAcceptance: needsTermsAcceptance(),
    loading: loading,
  };
};