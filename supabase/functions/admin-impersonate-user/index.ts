import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the calling user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Admin access required');
    }

    // Parse request body
    const { target_user_id, reason } = await req.json();

    if (!target_user_id || !reason) {
      throw new Error('target_user_id and reason are required');
    }

    // Prevent impersonating other admins
    const { data: targetRole, error: targetRoleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', target_user_id)
      .eq('role', 'admin')
      .maybeSingle();

    if (targetRole) {
      throw new Error('Cannot impersonate other admins');
    }

    // Get client IP and user agent
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    const user_agent = req.headers.get('user-agent');

    // Log the impersonation
    const { error: logError } = await supabaseClient
      .from('admin_impersonations')
      .insert({
        admin_user_id: user.id,
        target_user_id,
        reason,
        ip_address,
        user_agent,
      });

    if (logError) {
      console.error('Failed to log impersonation:', logError);
    }

    // Generate a session for the target user
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
      user_id: target_user_id,
      session_duration: 1800, // 30 minutes
    });

    if (sessionError) {
      throw sessionError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: sessionData,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Impersonation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
