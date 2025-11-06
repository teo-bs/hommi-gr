import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useVoiceMessage() {
  const { profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadVoiceMessage = async (audioBlob: Blob, threadId: string) => {
    if (!profile?.id) return null;

    setIsUploading(true);
    try {
      const fileName = `${threadId}/${Date.now()}.webm`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-voice')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-voice')
        .getPublicUrl(uploadData.path);

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading voice message:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadVoiceMessage,
    isUploading
  };
}
