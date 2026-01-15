import { SupabaseClient } from '@supabase/supabase-js';
import { parseCustomQuestions } from './question-parser';
import { detectReschedule } from './reschedule-detector';
import { extractUTMParameters } from './utm-extractor';

export async function enrichWebhookPayload(
  payload: any,
  endpoint: any,
  userId: string,
  supabase: SupabaseClient
) {
  // Extract event type (e.g., "invitee.created")
  const eventType = payload?.event;

  // Extract Calendly event UUID from the URI
  // Calendly URIs look like: "https://api.calendly.com/scheduled_events/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
  const eventUri = payload?.payload?.event;
  const calendlyEventUuid = eventUri ? eventUri.split('/').pop() : null;

  // Extract invitee email
  const inviteeEmail = payload?.payload?.email;

  // Run enrichment based on endpoint settings
  const [questions, reschedule, utm] = await Promise.all([
    endpoint.enable_question_parsing
      ? parseCustomQuestions(payload)
      : Promise.resolve(null),
    endpoint.enable_reschedule_detection
      ? detectReschedule(calendlyEventUuid, inviteeEmail, userId, supabase)
      : Promise.resolve({ isReschedule: false }),
    endpoint.enable_utm_tracking
      ? extractUTMParameters(payload)
      : Promise.resolve(null)
  ]);

  return {
    original: payload,
    enriched: {
      parsed_questions: questions,
      reschedule_info: reschedule,
      utm_tracking: utm,
      enriched_at: new Date().toISOString()
    },
    metadata: {
      calendly_event_uuid: calendlyEventUuid,
      invitee_email: inviteeEmail,
      event_type: eventType
    }
  };
}
