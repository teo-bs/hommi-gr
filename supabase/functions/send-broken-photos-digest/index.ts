import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ListerWithBrokenPhotos {
  lister_id: string;
  email: string;
  display_name: string;
  broken_count: number;
  listings: {
    listing_id: string;
    title: string;
    broken_photos: string[];
  }[];
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const resend = new Resend(resendApiKey);

  try {
    console.log('Starting broken photos digest email generation...');

    // Get all unresolved broken photos grouped by lister
    const { data: brokenPhotos, error: fetchError } = await supabase
      .from('broken_photos_log')
      .select(`
        lister_id,
        photo_url,
        room_id,
        rooms!inner (
          listing_id,
          listings!inner (
            id,
            title
          )
        ),
        profiles!inner (
          email,
          display_name
        )
      `)
      .is('resolved_at', null);

    if (fetchError) {
      console.error('Error fetching broken photos:', fetchError);
      throw fetchError;
    }

    if (!brokenPhotos || brokenPhotos.length === 0) {
      console.log('No broken photos to report');
      return new Response(
        JSON.stringify({ message: 'No broken photos to report', emailsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${brokenPhotos.length} unresolved broken photos`);

    // Group by lister
    const listerMap = new Map<string, ListerWithBrokenPhotos>();

    for (const photo of brokenPhotos) {
      const listerId = photo.lister_id;
      const profile = (photo as any).profiles;
      const listing = (photo as any).rooms.listings;

      if (!listerMap.has(listerId)) {
        listerMap.set(listerId, {
          lister_id: listerId,
          email: profile.email,
          display_name: profile.display_name,
          broken_count: 0,
          listings: [],
        });
      }

      const lister = listerMap.get(listerId)!;
      lister.broken_count++;

      // Find or create listing entry
      let listingEntry = lister.listings.find(l => l.listing_id === listing.id);
      if (!listingEntry) {
        listingEntry = {
          listing_id: listing.id,
          title: listing.title,
          broken_photos: [],
        };
        lister.listings.push(listingEntry);
      }

      listingEntry.broken_photos.push(photo.photo_url);
    }

    console.log(`Sending digest to ${listerMap.size} listers`);

    // Send email to each lister
    let emailsSent = 0;
    for (const lister of listerMap.values()) {
      try {
        const listingDetails = lister.listings
          .map(l => `
            <li>
              <strong>${l.title}</strong>
              <br>
              ${l.broken_photos.length} broken photo${l.broken_photos.length > 1 ? 's' : ''}
              <br>
              <a href="https://hommi.gr/publish?id=${l.listing_id}&step=4">Fix Photos</a>
            </li>
          `)
          .join('');

        const emailHtml = `
          <h1>⚠️ Broken Photos Detected</h1>
          <p>Hi ${lister.display_name || 'there'},</p>
          <p>We've detected <strong>${lister.broken_count}</strong> broken photo${lister.broken_count > 1 ? 's' : ''} in your listing${lister.listings.length > 1 ? 's' : ''}. Broken photos can negatively impact your listing's performance.</p>
          
          <h2>Affected Listings:</h2>
          <ul style="line-height: 1.8;">
            ${listingDetails}
          </ul>
          
          <p>
            <a href="https://hommi.gr/my-listings" 
               style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View All My Listings
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 24px;">
            💡 <strong>Tip:</strong> Replace broken photos with high-quality images to improve tenant interest.
          </p>
          
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #999; font-size: 12px;">
            This is an automated weekly digest. If you have questions, contact support@hommi.gr
          </p>
        `;

        const { error: emailError } = await resend.emails.send({
          from: 'Hommi <notifications@hommi.gr>',
          to: [lister.email],
          subject: `⚠️ ${lister.broken_count} Broken Photo${lister.broken_count > 1 ? 's' : ''} Detected`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Error sending email to ${lister.email}:`, emailError);
        } else {
          emailsSent++;
          console.log(`Email sent to ${lister.email}`);
        }
      } catch (error) {
        console.error(`Failed to send email to ${lister.email}:`, error);
      }
    }

    console.log(`Digest emails sent successfully: ${emailsSent}/${listerMap.size}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        totalListers: listerMap.size,
        totalBrokenPhotos: brokenPhotos.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-broken-photos-digest function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});