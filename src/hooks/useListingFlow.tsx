import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ListingDraft } from "@/components/listing/ListingWizard";

interface ListingFlowState {
  // Auth flow
  authModalOpen: boolean;
  
  // Listing flow
  wizardOpen: boolean;
  selectedRole: 'individual' | 'agency' | null;
  currentDraft: ListingDraft | null;
  
  // Return context
  returnAction: (() => void) | null;
}

export const useListingFlow = () => {
  const { user, profile, needsTermsAcceptance } = useAuth();
  const [state, setState] = useState<ListingFlowState>({
    authModalOpen: false,
    wizardOpen: false,
    selectedRole: null,
    currentDraft: null,
    returnAction: null,
  });

  // Load saved draft and role from localStorage
  useEffect(() => {
    if (user) {
      const savedRole = localStorage.getItem(`listing-role-${user.id}`) as 'individual' | 'agency' | null;
      const savedDraft = localStorage.getItem(`listing-draft-${user.id}`);
      
      if (savedRole) {
        setState(prev => ({ ...prev, selectedRole: savedRole }));
      }
      
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setState(prev => ({ ...prev, currentDraft: draft }));
        } catch (error) {
          console.error('Failed to parse saved draft:', error);
        }
      }
    }
  }, [user]);

  const initiateListingFlow = useCallback((returnAction?: () => void) => {
    if (!user) {
      // User not authenticated - open auth modal
      setState(prev => ({
        ...prev,
        authModalOpen: true,
        returnAction: returnAction || null
      }));
      return;
    }

    // T&C is handled globally by GlobalTermsHandler
    // Go directly to wizard with default role
    setState(prev => ({
      ...prev,
      wizardOpen: true,
      selectedRole: prev.selectedRole || 'individual', // Default to individual
      returnAction: returnAction || null
    }));
  }, [user]);

  const handleAuthSuccess = useCallback(() => {
    // Close auth modal and continue with wizard
    setState(prev => ({
      ...prev,
      authModalOpen: false,
      wizardOpen: true,
      selectedRole: prev.selectedRole || 'individual' // Default to individual
    }));
  }, []);

  const handleDraftSaved = useCallback((draft: ListingDraft) => {
    // Save draft to localStorage
    if (user) {
      localStorage.setItem(`listing-draft-${user.id}`, JSON.stringify(draft));
    }
    
    setState(prev => ({ ...prev, currentDraft: draft }));
  }, [user]);

  const handleListingPublished = useCallback((listing: ListingDraft) => {
    console.log('Publishing listing:', listing);
    
    // Clear draft after successful publish
    if (user) {
      localStorage.removeItem(`listing-draft-${user.id}`);
    }
    
    setState(prev => ({
      ...prev,
      wizardOpen: false,
      currentDraft: null
    }));
  }, [user]);

  const handleRoleChange = useCallback(() => {
    // Reset to step 0 to allow role reselection in the wizard
    setState(prev => ({
      ...prev,
      currentDraft: prev.currentDraft ? { ...prev.currentDraft, step: 0 } : null
    }));
  }, []);

  const closeAuth = useCallback(() => {
    setState(prev => ({ ...prev, authModalOpen: false }));
  }, []);

  const closeWizard = useCallback(() => {
    setState(prev => ({ ...prev, wizardOpen: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      authModalOpen: false,
      wizardOpen: false,
      selectedRole: null,
      currentDraft: null,
      returnAction: null,
    });
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    initiateListingFlow,
    handleAuthSuccess,
    handleDraftSaved,
    handleListingPublished,
    handleRoleChange,
    closeAuth,
    closeWizard,
    reset,
    
    // Helpers
    isAuthenticated: !!user,
    needsTermsAcceptance: needsTermsAcceptance(),
  };
};