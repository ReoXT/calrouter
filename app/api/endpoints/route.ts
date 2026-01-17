import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/endpoints - Get all endpoints for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    // Get user from database
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all endpoints with webhook counts
    const { data: endpoints, error } = await supabaseAdmin
      .from('webhook_endpoints')
      .select(`
        *,
        webhook_count:webhook_logs(count)
      `)
      .eq('user_id', dbUser.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching endpoints:', error);
      return NextResponse.json({ error: 'Failed to fetch endpoints' }, { status: 500 });
    }

    // Transform the data to include webhook count
    const transformedEndpoints = (endpoints || []).map(endpoint => ({
      ...endpoint,
      webhook_count: (endpoint.webhook_count as any)?.[0]?.count || 0
    }));

    return NextResponse.json(transformedEndpoints);
  } catch (error) {
    console.error('Error in GET /api/endpoints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/endpoints - Create a new endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.destination_url) {
      return NextResponse.json(
        { error: 'Name and destination URL are required' },
        { status: 400 }
      );
    }

    // Validate destination URL
    try {
      const url = new URL(body.destination_url);
      if (url.protocol !== 'https:') {
        return NextResponse.json(
          { error: 'Destination URL must use HTTPS' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid destination URL' },
        { status: 400 }
      );
    }

    // Get or create user from database
    const { data: dbUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, subscription_status')
      .eq('clerk_user_id', user.id)
      .single();

    if (userError || !dbUser) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      // Create endpoint for new user
      const { data: endpoint, error: endpointError } = await supabaseAdmin
        .from('webhook_endpoints')
        .insert({
          user_id: newUser.id,
          name: body.name,
          destination_url: body.destination_url,
          enable_reschedule_detection: body.enable_reschedule_detection ?? true,
          enable_utm_tracking: body.enable_utm_tracking ?? true,
          enable_question_parsing: body.enable_question_parsing ?? true,
          is_active: body.is_active ?? true,
        })
        .select()
        .single();

      if (endpointError) {
        console.error('Error creating endpoint:', endpointError);
        return NextResponse.json({ error: 'Failed to create endpoint' }, { status: 500 });
      }

      return NextResponse.json(endpoint, { status: 201 });
    }

    // Check subscription status
    if (dbUser.subscription_status === 'expired' || dbUser.subscription_status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription expired. Please upgrade to create endpoints.' },
        { status: 403 }
      );
    }

    // Create endpoint for existing user
    const { data: endpoint, error } = await supabaseAdmin
      .from('webhook_endpoints')
      .insert({
        user_id: dbUser.id,
        name: body.name,
        destination_url: body.destination_url,
        enable_reschedule_detection: body.enable_reschedule_detection ?? true,
        enable_utm_tracking: body.enable_utm_tracking ?? true,
        enable_question_parsing: body.enable_question_parsing ?? true,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating endpoint:', error);
      return NextResponse.json({ error: 'Failed to create endpoint' }, { status: 500 });
    }

    return NextResponse.json(endpoint, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/endpoints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
