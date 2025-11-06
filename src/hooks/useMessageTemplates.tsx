import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  is_default: boolean;
  usage_count: number;
}

export function useMessageTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (title: string, content: string, category: string = 'general') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          user_id: user.id,
          title,
          content,
          category
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Επιτυχία',
        description: 'Το πρότυπο αποθηκεύτηκε'
      });

      fetchTemplates();
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

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Επιτυχία',
        description: 'Το πρότυπο ενημερώθηκε'
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Σφάλμα',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Επιτυχία',
        description: 'Το πρότυπο διαγράφηκε'
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: 'Σφάλμα',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const incrementUsage = async (id: string) => {
    // Increment usage count using SQL
    await supabase
      .from('message_templates')
      .update({ usage_count: 1 })
      .eq('id', id);
  };

  useEffect(() => {
    fetchTemplates();
  }, [user?.id]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    refetch: fetchTemplates
  };
}
