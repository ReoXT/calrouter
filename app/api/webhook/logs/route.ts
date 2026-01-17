import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const endpoint_id = searchParams.get('endpoint_id');
    const status = searchParams.get('status');
    const event_type = searchParams.get('event_type');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build query for logs with endpoint join
    let query = supabaseAdmin
      .from('webhook_logs')
      .select(
        `
        *,
        endpoint:webhook_endpoints!inner(
          id,
          name,
          user_id
        )
      `,
        { count: 'exact' }
      )
      .eq('endpoint.user_id', user.id);

    // Apply filters
    if (endpoint_id && endpoint_id !== 'all') {
      query = query.eq('endpoint_id', endpoint_id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (event_type && event_type !== 'all') {
      query = query.eq('event_type', event_type);
    }

    // Search functionality (search in email, event UUID, or payload)
    if (search) {
      query = query.or(
        `invitee_email.ilike.%${search}%,calendly_event_uuid.ilike.%${search}%,utm_source.ilike.%${search}%`
      );
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Transform data to flatten endpoint info
    const transformedLogs = logs?.map((log: any) => ({
      id: log.id,
      endpoint_id: log.endpoint_id,
      endpoint_name: log.endpoint?.name || 'Unknown',
      calendly_event_uuid: log.calendly_event_uuid,
      invitee_email: log.invitee_email,
      event_type: log.event_type,
      original_payload: log.original_payload,
      enriched_payload: log.enriched_payload,
      is_reschedule: log.is_reschedule,
      utm_source: log.utm_source,
      utm_medium: log.utm_medium,
      utm_campaign: log.utm_campaign,
      status: log.status,
      response_code: log.response_code,
      error_message: log.error_message,
      created_at: log.created_at,
    }));

    return NextResponse.json({
      logs: transformedLogs || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    console.error('Logs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
