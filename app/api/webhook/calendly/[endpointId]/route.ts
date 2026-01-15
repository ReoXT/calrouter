import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { supabaseAdmin } from '@/lib/supabase/client';
import { enrichWebhookPayload } from '@/lib/parsers/enricher';

// Initialize rate limiter: 100 requests per minute per endpoint
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'calrouter:ratelimit',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { endpointId: string } }
) {
  const endpointId = params.endpointId;
  const startTime = Date.now();

  try {
    // 1. RATE LIMITING
    const rateLimitResult = await ratelimit.limit(`endpoint:${endpointId}`);

    if (!rateLimitResult.success) {
      console.log(`Rate limit exceeded for endpoint ${endpointId}`);
      return NextResponse.json(
        {
          ok: false,
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset
        },
        { status: 429 }
      );
    }

    // 2. PARSE REQUEST BODY
    let payload: any;
    try {
      payload = await request.json();
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      // Return 200 to prevent Calendly retries
      return NextResponse.json({ ok: true, error: 'Invalid JSON payload' });
    }

    // Validate basic Calendly webhook structure
    if (!payload?.event || !payload?.payload) {
      console.error('Invalid Calendly webhook structure');
      return NextResponse.json({ ok: true, error: 'Invalid webhook structure' });
    }

    // 3. LOOKUP ENDPOINT
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized');
      return NextResponse.json({ ok: true, error: 'Service unavailable' }, { status: 503 });
    }

    const { data: endpoint, error: endpointError } = await supabaseAdmin
      .from('webhook_endpoints')
      .select('*, user:users!inner(*)')
      .eq('id', endpointId)
      .single();

    if (endpointError || !endpoint) {
      console.error(`Endpoint not found: ${endpointId}`, endpointError);
      return NextResponse.json({ ok: false, error: 'Endpoint not found' }, { status: 404 });
    }

    // 4. CHECK ENDPOINT ACTIVE STATUS
    if (!endpoint.is_active) {
      console.log(`Endpoint ${endpointId} is inactive, skipping`);
      return NextResponse.json({ ok: true, message: 'Endpoint inactive' });
    }

    // 5. CHECK SUBSCRIPTION STATUS
    const user = endpoint.user;
    const isSubscriptionValid =
      user.subscription_status === 'active' ||
      user.subscription_status === 'trial';

    if (!isSubscriptionValid) {
      console.log(`User subscription invalid for endpoint ${endpointId}`);
      return NextResponse.json({
        ok: true,
        message: 'Subscription expired or cancelled'
      });
    }

    // Check trial expiration
    if (user.subscription_status === 'trial' && user.trial_ends_at) {
      const trialEndsAt = new Date(user.trial_ends_at);
      if (trialEndsAt < new Date()) {
        console.log(`Trial expired for endpoint ${endpointId}`);
        return NextResponse.json({
          ok: true,
          message: 'Trial expired'
        });
      }
    }

    // 6. EXTRACT METADATA
    const eventType = payload.event;
    const eventUri = payload?.payload?.event;
    const calendlyEventUuid = eventUri ? eventUri.split('/').pop() : 'unknown';
    const inviteeEmail = payload?.payload?.email || null;

    // 7. DUPLICATE DETECTION
    const { data: existing } = await supabaseAdmin
      .from('webhook_logs')
      .select('id')
      .eq('endpoint_id', endpointId)
      .eq('calendly_event_uuid', calendlyEventUuid)
      .eq('event_type', eventType)
      .maybeSingle();

    if (existing) {
      console.log(`Duplicate webhook detected: ${calendlyEventUuid} - ${eventType}`);
      return NextResponse.json({ ok: true, duplicate: true });
    }

    // 8. ENRICH PAYLOAD
    let enrichedData: any;
    try {
      enrichedData = await enrichWebhookPayload(
        payload,
        endpoint,
        user.id,
        supabaseAdmin
      );
    } catch (error) {
      console.error('Enrichment failed:', error);
      // Continue with original payload if enrichment fails
      enrichedData = {
        original: payload,
        enriched: {
          parsed_questions: null,
          reschedule_info: { isReschedule: false },
          utm_tracking: null,
          enriched_at: new Date().toISOString()
        },
        metadata: {
          calendly_event_uuid: calendlyEventUuid,
          invitee_email: inviteeEmail,
          event_type: eventType
        }
      };
    }

    // 9. FORWARD TO DESTINATION URL
    let forwardStatus = 'success';
    let responseCode: number | null = null;
    let errorMessage: string | null = null;

    try {
      const forwardResponse = await fetch(endpoint.destination_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CalRouter/1.0',
          'X-CalRouter-Endpoint-Id': endpointId,
          'X-CalRouter-Event-Type': eventType,
        },
        body: JSON.stringify(enrichedData),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      responseCode = forwardResponse.status;

      if (!forwardResponse.ok) {
        forwardStatus = 'failed';
        errorMessage = `Destination returned ${forwardResponse.status}`;

        // Try to get error message from response
        try {
          const errorBody = await forwardResponse.text();
          if (errorBody) {
            errorMessage += `: ${errorBody.substring(0, 500)}`;
          }
        } catch (e) {
          // Ignore if can't read error body
        }
      }

    } catch (error: any) {
      forwardStatus = 'failed';
      responseCode = null;

      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        errorMessage = 'Request timeout (>10s)';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Destination URL not found (DNS error)';
      } else {
        errorMessage = error.message || 'Network error';
      }

      console.error(`Failed to forward webhook to ${endpoint.destination_url}:`, error);
    }

    // 10. LOG TO DATABASE
    const processingTime = Date.now() - startTime;

    const { error: logError } = await supabaseAdmin
      .from('webhook_logs')
      .insert({
        endpoint_id: endpointId,
        calendly_event_uuid: calendlyEventUuid,
        invitee_email: inviteeEmail,
        event_type: eventType,
        original_payload: payload,
        enriched_payload: enrichedData,
        is_reschedule: enrichedData.enriched?.reschedule_info?.isReschedule || false,
        utm_source: enrichedData.enriched?.utm_tracking?.utm_source || null,
        utm_medium: enrichedData.enriched?.utm_tracking?.utm_medium || null,
        utm_campaign: enrichedData.enriched?.utm_tracking?.utm_campaign || null,
        status: forwardStatus,
        response_code: responseCode,
        error_message: errorMessage,
      });

    if (logError) {
      console.error('Failed to log webhook:', logError);
      // Don't fail the request if logging fails
    }

    // 11. RETURN SUCCESS (ALWAYS 200 FOR CALENDLY)
    return NextResponse.json({
      ok: true,
      endpoint_id: endpointId,
      event_type: eventType,
      calendly_event_uuid: calendlyEventUuid,
      enriched: true,
      forwarded: forwardStatus === 'success',
      processing_time_ms: processingTime,
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);

    // Always return 200 to prevent Calendly retries
    return NextResponse.json({
      ok: true,
      error: 'Internal processing error',
      message: error.message || 'Unknown error'
    });
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. This endpoint only accepts POST requests.' },
    { status: 405 }
  );
}
