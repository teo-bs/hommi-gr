import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Verification = Tables<'verifications'>;

export const useVerifications = () => {
  const { user, updateProfile } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch verifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchVerifications();
    } else {
      setVerifications([]);
    }
  }, [user]);

  const fetchVerifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching verifications:', error);
        return;
      }

      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const createOrUpdateVerification = async (kind: 'email' | 'phone', value?: string, status: 'verified' | 'pending' | 'unverified' = 'pending') => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('verifications')
        .upsert({
          user_id: user.id,
          kind,
          value,
          status,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
        });

      if (error) {
        console.error('Error updating verification:', error);
        return { error: error.message };
      }

      // Refresh verifications
      await fetchVerifications();
      return { error: null };
    } catch (error: any) {
      console.error('Error updating verification:', error);
      return { error: error.message };
    }
  };

  const verifyEmail = async () => {
    if (!user?.email) return { error: 'No email found' };

    setLoading(true);
    try {
      // Send email verification through Supabase Auth
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (authError) {
        console.error('Error sending verification email:', authError);
        setLoading(false);
        return { error: authError.message };
      }

      // Update verification status to pending
      const { error } = await createOrUpdateVerification('email', user.email, 'pending');
      
      setLoading(false);
      return { error };
    } catch (error: any) {
      console.error('Error in email verification:', error);
      setLoading(false);
      return { error: error.message };
    }
  };

  const verifyPhone = async () => {
    // For testing purposes, automatically verify phone number
    // In a real app, you'd integrate with SMS/phone verification service
    setLoading(true);
    
    try {
      // Mock phone verification - automatically set to verified for testing
      const mockPhoneNumber = '+30 69X XXX XXXX'; // Mock Greek phone number
      const { error } = await createOrUpdateVerification('phone', mockPhoneNumber, 'verified');
      setLoading(false);
      return { error };
    } catch (error: any) {
      console.error('Error in phone verification:', error);
      setLoading(false);
      return { error: error.message };
    }
  };

  const linkGoogle = async () => {
    setLoading(true);
    
    try {
      // Use Supabase OAuth to link Google account
      const { error: authError } = await supabase.auth.linkIdentity({
        provider: 'google',
      });

      if (authError) {
        console.error('Error linking Google account:', authError);
        setLoading(false);
        return { error: authError.message };
      }

      // Update profile to mark Google as connected
      const { error: profileError } = await updateProfile({
        google_connected: true,
      });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setLoading(false);
        return { error: profileError };
      }

      setLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error('Error linking Google:', error);
      setLoading(false);
      return { error: error.message };
    }
  };

  const linkFacebook = async () => {
    setLoading(true);
    
    try {
      // Use Supabase OAuth to link Facebook account
      const { error: authError } = await supabase.auth.linkIdentity({
        provider: 'facebook',
      });

      if (authError) {
        console.error('Error linking Facebook account:', authError);
        setLoading(false);
        return { error: authError.message };
      }

      // Update profile to mark Facebook as connected
      const { error: profileError } = await updateProfile({
        facebook_connected: true,
      });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        setLoading(false);
        return { error: profileError };
      }

      setLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error('Error linking Facebook:', error);
      setLoading(false);
      return { error: error.message };
    }
  };

  return {
    verifications,
    loading,
    verifyEmail,
    verifyPhone,
    linkGoogle,
    linkFacebook,
    refetch: fetchVerifications,
  };
};