import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * Test endpoint to send a mock Calendly webhook to user's endpoints
 * This helps users verify their setup without needing a real Calendly event
 *
 * Usage: POST /api/webhook/test
 * Body: { endpoint_id: "uuid", event_type: "invitee.created" | "invitee.canceled" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint_id, event_type = 'invitee.created' } = body;

    if (!endpoint_id) {
      return NextResponse.json(
        { error: 'endpoint_id is required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Verify endpoint exists
    const { data: endpoint, error } = await supabaseAdmin
      .from('webhook_endpoints')
      .select('id, name, destination_url')
      .eq('id', endpoint_id)
      .single();

    if (error || !endpoint) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404 }
      );
    }

    // Generate mock Calendly webhook payload
    const mockPayload = generateMockCalendlyPayload(event_type);

    // Get the base URL for the webhook
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const webhookUrl = `${protocol}://${host}/api/webhook/calendly/${endpoint_id}`;

    // Send the test webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CalRouter-Test/1.0',
      },
      body: JSON.stringify(mockPayload),
    });

    const responseData = await response.json();

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      endpoint: {
        id: endpoint.id,
        name: endpoint.name,
        destination_url: endpoint.destination_url,
      },
      test_payload: mockPayload,
      webhook_response: responseData,
      message: response.ok
        ? 'Test webhook sent successfully!'
        : 'Test webhook failed. Check logs for details.',
    });

  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test webhook',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Generate realistic mock Calendly webhook payload
 */
function generateMockCalendlyPayload(eventType: string) {
  const timestamp = new Date().toISOString();
  const eventUuid = `test-${crypto.randomUUID()}`;

  const basePayload = {
    event: eventType,
    created_at: timestamp,
    payload: {
      event: `https://api.calendly.com/scheduled_events/${eventUuid}`,
      invitee: `https://api.calendly.com/scheduled_events/${eventUuid}/invitees/test-invitee-uuid`,
      name: 'Test User',
      email: 'test@example.com',
      text_reminder_number: null,
      timezone: 'America/New_York',
      created_at: timestamp,
      updated_at: timestamp,
      questions_and_answers: [
        {
          question: "What's your budget range?",
          answer: '$5,000 - $10,000'
        },
        {
          question: 'Company size?',
          answer: '10-50 employees'
        },
        {
          question: 'How did you hear about us?',
          answer: 'Google Search'
        }
      ],
      tracking: {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'test_campaign_2026',
        utm_term: 'calendly_automation',
        utm_content: 'ad_variant_a'
      },
      cancel_url: `https://calendly.com/cancellations/${eventUuid}`,
      reschedule_url: `https://calendly.com/reschedulings/${eventUuid}`,
    }
  };

  // Add event type specific fields
  if (eventType === 'invitee.canceled') {
    basePayload.payload.canceled_at = timestamp;
    basePayload.payload.canceler_name = 'Test User';
    basePayload.payload.cancel_reason = 'Testing CalRouter';
  }

  return basePayload;
}

// Provide help for GET requests
export async function GET() {
  return NextResponse.json({
    message: 'CalRouter Test Webhook Endpoint',
    description: 'Send a POST request to test your webhook configuration',
    usage: {
      method: 'POST',
      body: {
        endpoint_id: 'uuid-of-your-endpoint',
        event_type: 'invitee.created or invitee.canceled (default: invitee.created)'
      }
    },
    example_payload: {
      endpoint_id: 'abc123-def456-ghi789',
      event_type: 'invitee.created'
    }
  });
}
