import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useMessageAttachments() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAttachment = async (file: File, messageId: string) => {
    if (!profile) {
      toast({
        title: 'Σφάλμα',
        description: 'Πρέπει να συνδεθείς για να ανεβάσεις αρχεία',
        variant: 'destructive'
      });
      return null;
    }

    setUploading(true);
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 10MB');
      }

      // Validate file type (images only for now)
      if (!file.type.startsWith('image/')) {
        throw new Error('Μόνο εικόνες επιτρέπονται');
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(uploadData.path);

      // Create attachment record
      const { data: attachment, error: dbError } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageId,
          url: publicUrl,
          type: 'image',
          file_size_bytes: file.size,
          mime_type: file.type
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return attachment;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Σφάλμα μεταφόρτωσης',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getAttachments = async (messageId: string) => {
    const { data, error } = await supabase
      .from('message_attachments')
      .select('*')
      .eq('message_id', messageId);

    if (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }

    return data || [];
  };

  return {
    uploading,
    uploadAttachment,
    getAttachments
  };
}
