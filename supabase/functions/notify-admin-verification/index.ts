import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@hommi.gr';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, verification_type, user_email } = await req.json();

    // Send email to admin if Resend is configured
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Hommi <noreply@hommi.gr>',
          to: ADMIN_EMAIL,
          subject: `🆔 Νέα Επαλήθευση: ${verification_type === 'govgr' ? 'Ταυτότητα' : 'Τηλέφωνο'}`,
          html: `
            <h2>Νέο αίτημα επαλήθευσης</h2>
            <p><strong>Χρήστης:</strong> ${user_email}</p>
            <p><strong>User ID:</strong> ${user_id}</p>
            <p><strong>Τύπος:</strong> ${verification_type}</p>
            <p><strong>Ημερομηνία:</strong> ${new Date().toLocaleString('el-GR')}</p>
            <br />
            <a href="https://hommi.gr/admin/verifications" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Δες Επαληθεύσεις
            </a>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email:', await emailResponse.text());
      }
    } else {
      console.log('RESEND_API_KEY not configured, skipping email notification');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
