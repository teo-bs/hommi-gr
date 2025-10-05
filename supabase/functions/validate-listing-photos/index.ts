import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoValidationResult {
  url: string;
  isValid: boolean;
  roomId: string;
  listerId: string;
}

/**
 * Validate a photo URL using HEAD request with timeout
 */
async function validatePhotoUrl(url: string, timeoutMs: number = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch (error) {
    console.log(`Photo validation failed for ${url}:`, error.message);
    return false;
  }
}

/**
 * Batch validate photos in chunks
 */
async function batchValidatePhotos(
  photos: { url: string; room_id: string; lister_id: string }[],
  chunkSize: number = 50
): Promise<PhotoValidationResult[]> {
  const results: PhotoValidationResult[] = [];
  
  for (let i = 0; i < photos.length; i += chunkSize) {
    const chunk = photos.slice(i, i + chunkSize);
    console.log(`Validating chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(photos.length / chunkSize)}`);
    
    const chunkResults = await Promise.all(
      chunk.map(async (photo) => ({
        url: photo.url,
        roomId: photo.room_id,
        listerId: photo.lister_id,
        isValid: await validatePhotoUrl(photo.url),
      }))
    );
    
    results.push(...chunkResults);
  }
  
  return results;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Starting photo validation run...');

    // Get 1000 random photos from published listings
    const { data: photos, error: fetchError } = await supabase
      .from('room_photos')
      .select(`
        url,
        room_id,
        rooms!inner (
          listing_id,
          listings!inner (
            owner_id,
            status
          )
        )
      `)
      .eq('rooms.listings.status', 'published')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (fetchError) {
      console.error('Error fetching photos:', fetchError);
      throw fetchError;
    }

    if (!photos || photos.length === 0) {
      console.log('No photos to validate');
      return new Response(
        JSON.stringify({ message: 'No photos to validate', photosChecked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetched ${photos.length} photos for validation`);

    // Transform data for validation
    const photosToValidate = photos.map(p => ({
      url: p.url,
      room_id: p.room_id,
      lister_id: (p.rooms as any).listings.owner_id,
    }));

    // Batch validate photos
    const validationResults = await batchValidatePhotos(photosToValidate);

    // Filter broken photos
    const brokenPhotos = validationResults.filter(r => !r.isValid);
    console.log(`Found ${brokenPhotos.length} broken photos out of ${validationResults.length}`);

    // Log broken photos to database (ignore duplicates)
    if (brokenPhotos.length > 0) {
      const brokenPhotoRecords = brokenPhotos.map(bp => ({
        room_id: bp.roomId,
        photo_url: bp.url,
        lister_id: bp.listerId,
        detected_at: new Date().toISOString(),
      }));

      // Insert in batches to avoid conflicts
      for (let i = 0; i < brokenPhotoRecords.length; i += 100) {
        const batch = brokenPhotoRecords.slice(i, i + 100);
        const { error: insertError } = await supabase
          .from('broken_photos_log')
          .upsert(batch, { 
            onConflict: 'room_id,photo_url',
            ignoreDuplicates: true 
          });

        if (insertError) {
          console.error('Error logging broken photos:', insertError);
        }
      }

      console.log(`Logged ${brokenPhotos.length} broken photos to database`);
    }

    // Record health check status
    const runDuration = Date.now() - startTime;
    const { error: statusError } = await supabase
      .from('photo_health_check_status')
      .insert({
        photos_checked: validationResults.length,
        broken_found: brokenPhotos.length,
        run_duration_ms: runDuration,
        last_run_at: new Date().toISOString(),
      });

    if (statusError) {
      console.error('Error recording health check status:', statusError);
    }

    console.log(`Photo validation completed in ${runDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        photosChecked: validationResults.length,
        brokenFound: brokenPhotos.length,
        durationMs: runDuration,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in validate-listing-photos function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});