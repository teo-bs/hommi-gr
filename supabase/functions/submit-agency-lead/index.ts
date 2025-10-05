import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
  user_id?: string; // NEW: Optional user_id
}

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

    // TODO: In production, you might want to:
    // - Send a notification email to admins
    // - Add the lead to a CRM system
    // - Send a confirmation email to the agency

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