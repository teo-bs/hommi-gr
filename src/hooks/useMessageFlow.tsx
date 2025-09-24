import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface MessageFlowState {
  // Auth flow
  authModalOpen: boolean;
  termsModalOpen: boolean;
  awaitingTermsAcceptance: boolean;
  
  // Message flow
  conversationOpen: boolean;
  messageToSend: string | null;
  
  // Return context
  returnAction: (() => void) | null;
}

export const useMessageFlow = (roomId: string) => {
  const { user, profile, acceptTerms } = useAuth();
  const [state, setState] = useState<MessageFlowState>({
    authModalOpen: false,
    termsModalOpen: false,
    awaitingTermsAcceptance: false,
    conversationOpen: false,
    messageToSend: null,
    returnAction: null,
  });

  // Check if user needs to accept terms (simulate checking if they haven't accepted before)
  const needsTermsAcceptance = useCallback(() => {
    if (!user || !profile) return false;
    return !profile.terms_accepted_at;
  }, [user, profile]);

  const initiateMessageFlow = useCallback((message: string, returnAction?: () => void) => {
    if (!user) {
      // User not logged in - save message and show auth modal
      setState(prev => ({
        ...prev,
        authModalOpen: true,
        messageToSend: message,
        returnAction: returnAction || null
      }));
      return;
    }

    if (needsTermsAcceptance()) {
      // User logged in but needs to accept terms
      setState(prev => ({
        ...prev,
        termsModalOpen: true,
        awaitingTermsAcceptance: true,
        messageToSend: message,
        returnAction: returnAction || null
      }));
      return;
    }

    // User authenticated and terms accepted - proceed with message
    proceedWithMessage(message);
  }, [user, needsTermsAcceptance]);

  const proceedWithMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      conversationOpen: true,
      messageToSend: message,
      authModalOpen: false,
      termsModalOpen: false,
      awaitingTermsAcceptance: false
    }));
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setState(prev => {
      if (prev.awaitingTermsAcceptance || needsTermsAcceptance()) {
        // After auth, check if we need terms acceptance
        return {
          ...prev,
          authModalOpen: false,
          termsModalOpen: true,
          awaitingTermsAcceptance: true
        };
      } else {
        // Auth complete, proceed with message
        const message = prev.messageToSend;
        if (message) {
          proceedWithMessage(message);
        }
        return {
          ...prev,
          authModalOpen: false
        };
      }
    });
  }, [needsTermsAcceptance, proceedWithMessage]);

  const handleTermsAccepted = useCallback(async (marketingEmails: boolean) => {
    const { error } = await acceptTerms(marketingEmails);
    
    if (error) {
      console.error('Failed to accept terms:', error);
      return;
    }
    
    setState(prev => {
      if (prev.messageToSend) {
        proceedWithMessage(prev.messageToSend);
      }
      if (prev.returnAction) {
        prev.returnAction();
      }
      return {
        ...prev,
        termsModalOpen: false,
        awaitingTermsAcceptance: false
      };
    });
  }, [acceptTerms, proceedWithMessage]);

  const handleMessageSent = useCallback((message: string) => {
    // Message sent successfully, open conversation view
    setState(prev => ({
      ...prev,
      conversationOpen: true,
      messageToSend: message
    }));
  }, []);

  const closeAuth = useCallback(() => {
    setState(prev => ({
      ...prev,
      authModalOpen: false
    }));
  }, []);

  const closeConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationOpen: false,
      messageToSend: null,
      returnAction: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      authModalOpen: false,
      termsModalOpen: false,
      awaitingTermsAcceptance: false,
      conversationOpen: false,
      messageToSend: null,
      returnAction: null,
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    initiateMessageFlow,
    handleAuthSuccess,
    handleTermsAccepted,
    handleMessageSent,
    closeAuth,
    closeConversation,
    reset,
    
    // Helpers
    isAuthenticated: !!user,
    needsTermsAcceptance: needsTermsAcceptance(),
  };
};