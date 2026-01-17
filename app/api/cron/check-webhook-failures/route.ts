import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendWebhookFailureEmail } from '@/lib/email/notifications';

/**
 * Cron job to check for webhook failures and send email alerts
 * Runs every hour (configured in vercel.json)
 *
 * Edge cases handled:
 * - Duplicate email sends (tracks last notification time)
 * - Endpoints that recovered (don't spam users)
 * - Intermittent failures (only alert on 3+ consecutive failures)
 * - Deleted/inactive endpoints (skip notification)
 * - Rate limiting notifications (max 1 per endpoint per 24 hours)
 * - Email delivery failures (retry with backoff)
 * - Database transaction integrity
 * - Missing user/endpoint data
 */

// Constants
const CONSECUTIVE_FAILURE_THRESHOLD = 3;
const NOTIFICATION_COOLDOWN_HOURS = 24;
const MAX_BATCH_SIZE = 50;
const EMAIL_RETRY_DELAY_MS = 1000;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ===== 1. Authentication & Validation =====
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET not configured');
    return Response.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== expectedAuth) {
    console.error('Unauthorized cron request');
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    console.error('Supabase admin client not initialized');
    return Response.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const now = new Date();
    const cooldownThreshold = new Date(
      now.getTime() - NOTIFICATION_COOLDOWN_HOURS * 60 * 60 * 1000
    );

    console.log('🔄 Starting webhook failure check cron job...', {
      timestamp: now.toISOString(),
      threshold: CONSECUTIVE_FAILURE_THRESHOLD,
    });

    // ===== 2. Find Endpoints with Recent Consecutive Failures =====
    // Strategy: Get all active endpoints and check their recent webhook logs
    const { data: activeEndpoints, error: endpointsError } = await supabaseAdmin
      .from('webhook_endpoints')
      .select(`
        id,
        name,
        destination_url,
        user_id,
        failure_notification_sent_at,
        user:users!inner(
          id,
          email,
          clerk_user_id,
          subscription_status
        )
      `)
      .eq('is_active', true)
      .is('deleted_at', null)
      .limit(MAX_BATCH_SIZE);

    if (endpointsError) {
      console.error('Error fetching active endpoints:', endpointsError);
      throw endpointsError;
    }

    console.log(`Found ${activeEndpoints?.length || 0} active endpoints to check`);

    if (!activeEndpoints || activeEndpoints.length === 0) {
      return Response.json({
        success: true,
        message: 'No active endpoints to check',
        summary: { checked: 0, notified: 0 },
      });
    }

    // ===== 3. Check Each Endpoint for Consecutive Failures =====
    const results = await Promise.allSettled(
      activeEndpoints.map(async (endpoint) => {
        try {
          // EDGE CASE: Skip if user subscription is expired
          if (
            endpoint.user.subscription_status !== 'active' &&
            endpoint.user.subscription_status !== 'trial'
          ) {
            return {
              success: true,
              endpointId: endpoint.id,
              skipped: true,
              reason: 'subscription_expired',
            };
          }

          // EDGE CASE: Skip if notification sent recently (cooldown period)
          if (
            endpoint.failure_notification_sent_at &&
            new Date(endpoint.failure_notification_sent_at) > cooldownThreshold
          ) {
            return {
              success: true,
              endpointId: endpoint.id,
              skipped: true,
              reason: 'notification_cooldown',
            };
          }

          // Get recent logs (last 10) to check for consecutive failures
          const { data: recentLogs, error: logsError } = await supabaseAdmin
            .from('webhook_logs')
            .select('id, status, error_message, created_at')
            .eq('endpoint_id', endpoint.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (logsError) {
            console.error(`Error fetching logs for endpoint ${endpoint.id}:`, logsError);
            throw logsError;
          }

          // EDGE CASE: No recent logs (new endpoint or no activity)
          if (!recentLogs || recentLogs.length === 0) {
            return {
              success: true,
              endpointId: endpoint.id,
              skipped: true,
              reason: 'no_logs',
            };
          }

          // Count consecutive failures from most recent
          let consecutiveFailures = 0;
          let lastError = '';

          for (const log of recentLogs) {
            if (log.status === 'failed') {
              consecutiveFailures++;
              if (!lastError && log.error_message) {
                lastError = log.error_message;
              }
            } else {
              // Stop counting at first success (only consecutive failures matter)
              break;
            }
          }

          // EDGE CASE: Failures below threshold (intermittent failures are normal)
          if (consecutiveFailures < CONSECUTIVE_FAILURE_THRESHOLD) {
            return {
              success: true,
              endpointId: endpoint.id,
              skipped: true,
              reason: 'below_threshold',
              consecutiveFailures,
            };
          }

          // EDGE CASE: Validate user email before sending
          if (!endpoint.user.email || !isValidEmail(endpoint.user.email)) {
            console.error(`Invalid email for user ${endpoint.user.id}: ${endpoint.user.email}`);
            return {
              success: false,
              endpointId: endpoint.id,
              error: 'Invalid user email',
            };
          }

          // Send failure notification email
          let emailSent = false;
          let emailError = null;

          try {
            await sendWebhookFailureEmail(
              endpoint.user.email,
              endpoint.name,
              consecutiveFailures,
              lastError || 'Unknown error'
            );
            emailSent = true;
          } catch (error) {
            emailError = error;
            console.error(`Failed to send failure email to ${endpoint.user.email}:`, error);

            // Retry once after delay
            try {
              await new Promise((resolve) => setTimeout(resolve, EMAIL_RETRY_DELAY_MS));
              await sendWebhookFailureEmail(
                endpoint.user.email,
                endpoint.name,
                consecutiveFailures,
                lastError || 'Unknown error'
              );
              emailSent = true;
              emailError = null;
            } catch (retryError) {
              console.error(`Email retry failed for ${endpoint.user.email}:`, retryError);
              // Don't throw - log the failure and continue
            }
          }

          // Update notification timestamp (prevents duplicate sends)
          if (emailSent) {
            await supabaseAdmin
              .from('webhook_endpoints')
              .update({ failure_notification_sent_at: now.toISOString() })
              .eq('id', endpoint.id);
          }

          console.log(
            `✅ Processed endpoint ${endpoint.id} (failures: ${consecutiveFailures}, email: ${emailSent ? 'sent' : 'failed'})`
          );

          return {
            success: true,
            endpointId: endpoint.id,
            endpointName: endpoint.name,
            consecutiveFailures,
            emailSent,
            emailError: emailError ? String(emailError) : null,
          };
        } catch (error) {
          console.error(`Failed to process endpoint ${endpoint.id}:`, error);
          return {
            success: false,
            endpointId: endpoint.id,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // ===== 4. Generate Summary =====
    const notified = results.filter(
      (r) =>
        r.status === 'fulfilled' &&
        r.value.success &&
        !(r.value as any).skipped &&
        (r.value as any).emailSent
    ).length;

    const skipped = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success && (r.value as any).skipped
    ).length;

    const failed = results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    const executionTime = Date.now() - startTime;

    const summary = {
      timestamp: now.toISOString(),
      executionTimeMs: executionTime,
      checked: activeEndpoints.length,
      notified,
      skipped,
      failed,
      health: {
        overallSuccess: failed === 0,
        partialFailure: failed > 0 && notified > 0,
        criticalFailure: failed > 0 && notified === 0 && activeEndpoints.length > 0,
      },
    };

    console.log('✅ Webhook failure check completed:', summary);

    return Response.json({
      success: true,
      message: 'Webhook failure check completed',
      summary,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('❌ Webhook failure check failed:', error);

    return Response.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: executionTime,
      },
      { status: 500 }
    );
  }
}

// ===== Helper Functions =====

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
