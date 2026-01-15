import { SupabaseClient } from '@supabase/supabase-js';

export async function detectReschedule(
  calendlyEventUuid: string,
  inviteeEmail: string,
  userId: string,
  supabase: SupabaseClient
): Promise<{ isReschedule: boolean; cancellationId?: string }> {
  try {
    // Validate inputs
    if (!calendlyEventUuid || !inviteeEmail || !userId) {
      return { isReschedule: false };
    }

    // Look for recent cancellation for THIS user only
    const { data: cancellation, error } = await supabase
      .from('webhook_logs')
      .select('id, calendly_event_uuid, endpoint_id')
      .eq('invitee_email', inviteeEmail)
      .eq('event_type', 'invitee.canceled')
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10 min window
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Handle Supabase error (no results or query failed)
    if (error || !cancellation) {
      return { isReschedule: false };
    }

    // Verify the cancellation belongs to this user's endpoints
    const { data: endpointCheck } = await supabase
      .from('webhook_endpoints')
      .select('user_id')
      .eq('id', cancellation.endpoint_id)
      .eq('user_id', userId)
      .single();

    if (!endpointCheck) {
      return { isReschedule: false };
    }

    // Reschedule if:
    // 1. Same email
    // 2. Recent cancellation (within 10 min)
    // 3. Different event UUID (rescheduled to new time)
    const isReschedule = cancellation.calendly_event_uuid !== calendlyEventUuid;

    return {
      isReschedule,
      cancellationId: isReschedule ? cancellation.id : undefined
    };
  } catch (error) {
    console.error('Reschedule detection failed:', error);
    return { isReschedule: false };
  }
}
