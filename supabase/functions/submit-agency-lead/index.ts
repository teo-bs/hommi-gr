import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@4.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AgencyLeadData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  message?: string;
  user_id?: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const leadData: AgencyLeadData = await req.json();

    // Validate required fields
    if (!leadData.company_name || !leadData.contact_name || !leadData.email) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: 'company_name, contact_name, and email are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadData.email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email format' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user_id exists and has an existing lead (UPSERT logic)
    let data, error;
    
    if (leadData.user_id) {
      // Check for existing lead by user_id
      const { data: existingLead } = await supabase
        .from('agency_leads')
        .select('id')
        .eq('user_id', leadData.user_id)
        .maybeSingle();
      
      if (existingLead) {
        // Update existing lead
        const result = await supabase
          .from('agency_leads')
          .update({
            company_name: leadData.company_name.trim(),
            contact_name: leadData.contact_name.trim(),
            email: leadData.email.trim().toLowerCase(),
            phone: leadData.phone?.trim() || null,
            website: leadData.website?.trim() || null,
            message: leadData.message?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLead.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Insert new lead with user_id
        const result = await supabase
          .from('agency_leads')
          .insert({
            company_name: leadData.company_name.trim(),
            contact_name: leadData.contact_name.trim(),
            email: leadData.email.trim().toLowerCase(),
            phone: leadData.phone?.trim() || null,
            website: leadData.website?.trim() || null,
            message: leadData.message?.trim() || null,
            user_id: leadData.user_id,
            status: 'new'
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }
    } else {
      // Insert without user_id (anonymous submission)
      const result = await supabase
        .from('agency_leads')
        .insert({
          company_name: leadData.company_name.trim(),
          contact_name: leadData.contact_name.trim(),
          email: leadData.email.trim().toLowerCase(),
          phone: leadData.phone?.trim() || null,
          website: leadData.website?.trim() || null,
          message: leadData.message?.trim() || null,
          status: 'new'
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error inserting agency lead:', error);
      
      // Handle duplicate email constraint if it exists
      if (error.code === '23505' && error.message.includes('email')) {
        return new Response(
          JSON.stringify({ 
            error: 'An agency lead with this email already exists' 
          }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: 'Failed to submit agency lead',
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`New agency lead submitted: ${data.company_name} (${data.email})`);

    // Send email notification to admin
    try {
      const submissionDate = new Date().toLocaleString('el-GR', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/Athens'
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: 600; color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
              .value { font-size: 16px; color: #1f2937; padding: 10px; background: white; border-radius: 5px; border-left: 3px solid #667eea; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
              .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🏢 Νέο Αίτημα Κτηματομεσίτη</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Hommi Agency Leads</p>
              </div>
              
              <div class="content">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span class="badge">ΝΕΟ ΑΙΤΗΜΑ</span>
                </div>

                <div class="field">
                  <div class="label">Εταιρεία</div>
                  <div class="value">${leadData.company_name}</div>
                </div>

                <div class="field">
                  <div class="label">Όνομα Επικοινωνίας</div>
                  <div class="value">${leadData.contact_name}</div>
                </div>

                <div class="field">
                  <div class="label">Email</div>
                  <div class="value"><a href="mailto:${leadData.email}" style="color: #667eea; text-decoration: none;">${leadData.email}</a></div>
                </div>

                ${leadData.phone ? `
                <div class="field">
                  <div class="label">Τηλέφωνο</div>
                  <div class="value"><a href="tel:${leadData.phone}" style="color: #667eea; text-decoration: none;">${leadData.phone}</a></div>
                </div>
                ` : ''}

                ${leadData.website ? `
                <div class="field">
                  <div class="label">Ιστοσελίδα</div>
                  <div class="value"><a href="${leadData.website}" target="_blank" style="color: #667eea; text-decoration: none;">${leadData.website}</a></div>
                </div>
                ` : ''}

                ${leadData.message ? `
                <div class="field">
                  <div class="label">Μήνυμα</div>
                  <div class="value" style="white-space: pre-wrap;">${leadData.message}</div>
                </div>
                ` : ''}

                <div class="field">
                  <div class="label">Ημερομηνία Υποβολής</div>
                  <div class="value">${submissionDate}</div>
                </div>

                ${leadData.user_id ? `
                <div class="field">
                  <div class="label">User ID (Authenticated)</div>
                  <div class="value" style="font-family: monospace; font-size: 12px;">${leadData.user_id}</div>
                </div>
                ` : ''}
              </div>

              <div class="footer">
                <p>Αυτό το email στάλθηκε αυτόματα από το σύστημα Hommi.<br>
                Απαντήστε απευθείας στον υποψήφιο πελάτη στο ${leadData.email}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      const { error: emailError } = await resend.emails.send({
        from: 'Hommi Agencies <onboarding@resend.dev>',
        to: ['mpoufisth@gmail.com'],
        subject: `Νέο Αίτημα Κτηματομεσίτη από ${leadData.company_name}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails, just log it
      } else {
        console.log('Email notification sent successfully to mpoufisth@gmail.com');
      }
    } catch (emailError) {
      console.error('Unexpected error sending email:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Agency lead submitted successfully',
        lead_id: data.id
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in submit-agency-lead function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
