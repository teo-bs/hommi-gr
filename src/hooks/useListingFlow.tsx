import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ListingDraft } from "@/components/listing/ListingWizard";

interface ListingFlowState {
  // Auth flow
  authModalOpen: boolean;
  termsModalOpen: boolean;
  awaitingTermsAcceptance: boolean;
  
  // Listing flow
  roleSelectionOpen: boolean;
  wizardOpen: boolean;
  selectedRole: 'individual' | 'agency' | null;
  currentDraft: ListingDraft | null;
  
  // Return context
  returnAction: (() => void) | null;
}

export const useListingFlow = () => {
  const { user, profile } = useAuth();
  const [state, setState] = useState<ListingFlowState>({
    authModalOpen: false,
    termsModalOpen: false,
    awaitingTermsAcceptance: false,
    roleSelectionOpen: false,
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

  // Check if user needs to accept terms
  const needsTermsAcceptance = useCallback(() => {
    if (!user || !profile) return false;
    // TODO: Check if user has accepted terms in their profile
    return !profile.verifications_json?.terms_accepted;
  }, [user, profile]);

  const initiateListingFlow = useCallback((returnAction?: () => void) => {
    if (!user) {
      // User not logged in - show auth modal
      setState(prev => ({
        ...prev,
        authModalOpen: true,
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
        returnAction: returnAction || null
      }));
      return;
    }

    // Check if user already has a role selected
    if (state.selectedRole) {
      // Go straight to wizard
      setState(prev => ({
        ...prev,
        wizardOpen: true,
        authModalOpen: false,
        termsModalOpen: false
      }));
    } else {
      // Show role selection
      setState(prev => ({
        ...prev,
        roleSelectionOpen: true,
        authModalOpen: false,
        termsModalOpen: false
      }));
    }
  }, [user, needsTermsAcceptance, state.selectedRole]);

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
        // Auth complete, proceed with listing flow
        return {
          ...prev,
          authModalOpen: false,
          roleSelectionOpen: !prev.selectedRole,
          wizardOpen: !!prev.selectedRole
        };
      }
    });
  }, [needsTermsAcceptance]);

  const handleTermsAccepted = useCallback((marketingEmails: boolean) => {
    // TODO: Update user profile with terms acceptance and marketing preference
    console.log('Terms accepted', { marketingEmails, userId: user?.id });
    
    setState(prev => {
      if (prev.returnAction) {
        prev.returnAction();
      }
      return {
        ...prev,
        termsModalOpen: false,
        awaitingTermsAcceptance: false,
        roleSelectionOpen: !prev.selectedRole,
        wizardOpen: !!prev.selectedRole
      };
    });
  }, [user]);

  const handleRoleSelected = useCallback((role: 'individual' | 'agency') => {
    if (user) {
      localStorage.setItem(`listing-role-${user.id}`, role);
    }
    
    setState(prev => ({
      ...prev,
      selectedRole: role,
      roleSelectionOpen: false,
      wizardOpen: true,
      currentDraft: prev.currentDraft?.role === role ? prev.currentDraft : {
        title: '',
        city: '',
        neighborhood: '',
        price_month: null,
        photos: [],
        role,
        step: 1
      }
    }));
  }, [user]);

  const handleDraftSaved = useCallback((draft: ListingDraft) => {
    if (user) {
      localStorage.setItem(`listing-draft-${user.id}`, JSON.stringify(draft));
    }
    setState(prev => ({ ...prev, currentDraft: draft }));
  }, [user]);

  const handleListingPublished = useCallback((listing: ListingDraft) => {
    // TODO: Save listing to Supabase
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
    setState(prev => ({
      ...prev,
      roleSelectionOpen: true,
      wizardOpen: false
    }));
  }, []);

  const closeAuth = useCallback(() => {
    setState(prev => ({ ...prev, authModalOpen: false }));
  }, []);

  const closeRoleSelection = useCallback(() => {
    setState(prev => ({ ...prev, roleSelectionOpen: false }));
  }, []);

  const closeWizard = useCallback(() => {
    setState(prev => ({ ...prev, wizardOpen: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      authModalOpen: false,
      termsModalOpen: false,
      awaitingTermsAcceptance: false,
      roleSelectionOpen: false,
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
    handleTermsAccepted,
    handleRoleSelected,
    handleDraftSaved,
    handleListingPublished,
    handleRoleChange,
    closeAuth,
    closeRoleSelection,
    closeWizard,
    reset,
    
    // Helpers
    isAuthenticated: !!user,
    needsTermsAcceptance: needsTermsAcceptance(),
  };
};