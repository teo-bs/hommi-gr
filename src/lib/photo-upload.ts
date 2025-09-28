import { supabase } from "@/integrations/supabase/client";

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload a photo to Supabase Storage listing-photos bucket
 */
export async function uploadListingPhoto(
  file: File, 
  userId: string
): Promise<PhotoUploadResult> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('listing-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicData.publicUrl,
      path: data.path
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deleteListingPhoto(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('listing-photos')
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Failed to delete photo:', error);
    return false;
  }
}

/**
 * Get public URL for a stored photo path
 */
export function getListingPhotoUrl(path: string): string {
  const { data } = supabase.storage
    .from('listing-photos')
    .getPublicUrl(path);
  
  return data.publicUrl;
}