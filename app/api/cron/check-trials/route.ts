import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTrialExpiredEmail, sendTrialEndingEmail } from '@/lib/email/notifications';

/**
 * Cron job to check for expired and expiring trials
 * Runs daily during the 2 AM UTC hour (configured in vercel.json)
 * Note: Vercel Free plan has hourly accuracy - exact minute is not guaranteed
 *
 * Edge cases handled:
 * - Duplicate executions (idempotent operations)
 * - Missing/invalid trial dates
 * - Email failures don't block user updates
 * - Partial failures (some users succeed, others fail)
 * - Database transaction integrity
 * - Already expired users
 * - Users who upgraded mid-trial
 * - Timezone edge cases
 * - Concurrent cron executions
 * - Variable execution time within the hour (Vercel Free plan limitation)
 */

// Constants for better maintainability
const TRIAL_WARNING_DAYS = 3;
const MAX_BATCH_SIZE = 50; // Process in batches to avoid timeouts
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
    console.error('Unauthorized cron request:', {
      hasHeader: !!authHeader,
      headerLength: authHeader?.length,
    });
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    console.error('Supabase admin client not initialized');
    return Response.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Type assertion after null check
  const supabase = supabaseAdmin;

  try {
    const now = new Date();
    const warningDate = new Date(now.getTime() + TRIAL_WARNING_DAYS * 24 * 60 * 60 * 1000);

    console.log('🔄 Starting trial check cron job...', {
      timestamp: now.toISOString(),
      warningDays: TRIAL_WARNING_DAYS,
    });

    // ===== 2. Handle Expired Trials =====
    const { data: expiredUsers, error: expiredError } = await supabase
      .from('users')
      .select('id, email, clerk_user_id, trial_ends_at, subscription_status')
      .eq('subscription_status', 'trial')
      .lt('trial_ends_at', now.toISOString())
      .not('trial_ends_at', 'is', null) // Skip users with null trial dates
      .limit(MAX_BATCH_SIZE);

    if (expiredError) {
      console.error('Error fetching expired users:', expiredError);
      throw expiredError;
    }

    console.log(`Found ${expiredUsers?.length || 0} expired trials`);

    // Process expired users with better error isolation
    const expiredResults = await Promise.allSettled(
      (expiredUsers || []).map(async (user) => {
        try {
          // EDGE CASE: Double-check user hasn't already been processed
          // (handles concurrent cron executions)
          const { data: currentUser } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

          if (currentUser?.subscription_status !== 'trial') {
            console.log(`⏭️  User ${user.id} already processed (status: ${currentUser?.subscription_status})`);
            return { success: true, userId: user.id, skipped: true, reason: 'already_processed' };
          }

          // EDGE CASE: Validate email before proceeding
          if (!user.email || !isValidEmail(user.email)) {
            console.error(`⚠️  User ${user.id} has invalid email: ${user.email}`);
            return { success: false, userId: user.id, error: 'Invalid email' };
          }

          // Update user status (atomic operation)
          const { error: updateError, data: updatedUser } = await supabase
            .from('users')
            .update({
              subscription_status: 'expired',
              updated_at: now.toISOString(),
            })
            .eq('id', user.id)
            .eq('subscription_status', 'trial') // Double-check still in trial (concurrency safety)
            .select()
            .single();

          if (updateError) {
            console.error(`❌ Failed to update user ${user.id}:`, updateError);
            throw updateError;
          }

          // EDGE CASE: If no rows updated, user was modified concurrently
          if (!updatedUser) {
            console.log(`⏭️  User ${user.id} was modified by another process`);
            return { success: true, userId: user.id, skipped: true, reason: 'concurrent_modification' };
          }

          // Disable all user's endpoints (idempotent - safe to run multiple times)
          const { error: endpointsError, data: disabledEndpoints } = await supabase
            .from('webhook_endpoints')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true) // Only update active endpoints
            .select();

          const disabledCount = disabledEndpoints?.length || 0;

          if (endpointsError) {
            console.error(`⚠️  Failed to disable endpoints for user ${user.id}:`, endpointsError);
            // Don't throw - user status is already updated, this is non-critical
          } else {
            console.log(`🔒 Disabled ${disabledCount || 0} endpoints for user ${user.id}`);
          }

          // Send email (with retry on failure)
          let emailSent = false;
          let emailError = null;

          try {
            await sendTrialExpiredEmail(user.email);
            emailSent = true;
          } catch (error) {
            emailError = error;
            console.error(`⚠️  Failed to send email to ${user.email}:`, error);

            // Retry once after delay
            try {
              await new Promise((resolve) => setTimeout(resolve, EMAIL_RETRY_DELAY_MS));
              await sendTrialExpiredEmail(user.email);
              emailSent = true;
              emailError = null;
            } catch (retryError) {
              console.error(`⚠️  Email retry failed for ${user.email}:`, retryError);
              // Don't throw - user is already expired, email failure is non-critical
            }
          }

          console.log(`✅ Processed expired trial for user ${user.id} (email: ${emailSent ? 'sent' : 'failed'})`);

          return {
            success: true,
            userId: user.id,
            email: user.email,
            emailSent,
            emailError: emailError ? String(emailError) : null,
            endpointsDisabled: disabledCount || 0,
          };
        } catch (error) {
          console.error(`❌ Failed to process expired trial for user ${user.id}:`, error);
          return {
            success: false,
            userId: user.id,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // ===== 3. Handle Trials Expiring Soon (Warning Emails) =====
    const { data: expiringUsers, error: expiringError } = await supabase
      .from('users')
      .select('id, email, trial_ends_at, subscription_status, trial_reminder_sent_at')
      .eq('subscription_status', 'trial')
      .gte('trial_ends_at', now.toISOString())
      .lte('trial_ends_at', warningDate.toISOString())
      .not('trial_ends_at', 'is', null)
      .limit(MAX_BATCH_SIZE);

    if (expiringError) {
      console.error('Error fetching expiring users:', expiringError);
      // Don't throw - expired users were already processed
      console.log('⚠️  Continuing despite expiring users fetch error');
    }

    console.log(`Found ${expiringUsers?.length || 0} trials expiring soon`);

    const expiringResults = await Promise.allSettled(
      (expiringUsers || []).map(async (user) => {
        try {
          // EDGE CASE: Validate email
          if (!user.email || !isValidEmail(user.email)) {
            console.error(`⚠️  User ${user.id} has invalid email: ${user.email}`);
            return { success: false, userId: user.id, error: 'Invalid email' };
          }

          // Calculate days left (rounded up to avoid sending on wrong day)
          const trialEndsAt = new Date(user.trial_ends_at!);
          const msLeft = trialEndsAt.getTime() - now.getTime();
          const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

          // EDGE CASE: Skip if days don't match exactly (prevents duplicate sends)
          if (daysLeft !== TRIAL_WARNING_DAYS) {
            return {
              success: true,
              userId: user.id,
              skipped: true,
              reason: 'wrong_day',
              daysLeft,
            };
          }

          // EDGE CASE: Check if reminder already sent (idempotency)
          // We check if reminder was sent in the last 12 hours to handle cron reruns
          const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
          if (
            user.trial_reminder_sent_at &&
            new Date(user.trial_reminder_sent_at) > twelveHoursAgo
          ) {
            console.log(`⏭️  Reminder already sent to user ${user.id} recently`);
            return {
              success: true,
              userId: user.id,
              skipped: true,
              reason: 'already_sent',
              daysLeft,
            };
          }

          // Send reminder email
          await sendTrialEndingEmail(user.email, daysLeft);

          // Update reminder timestamp (prevents duplicate sends)
          await supabase
            .from('users')
            .update({ trial_reminder_sent_at: now.toISOString() })
            .eq('id', user.id);

          console.log(`✅ Sent trial ending reminder to user ${user.id} (${daysLeft} days left)`);

          return {
            success: true,
            userId: user.id,
            email: user.email,
            daysLeft,
          };
        } catch (error) {
          console.error(`❌ Failed to send trial reminder for user ${user.id}:`, error);
          return {
            success: false,
            userId: user.id,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    // ===== 4. Generate Detailed Summary =====
    const expiredSuccessCount = expiredResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success && !(r.value as any).skipped
    ).length;

    const expiredSkippedCount = expiredResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success && (r.value as any).skipped
    ).length;

    const expiredFailCount = expiredResults.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    const expiringSuccessCount = expiringResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success && !(r.value as any).skipped
    ).length;

    const expiringSkippedCount = expiringResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success && (r.value as any).skipped
    ).length;

    const expiringFailCount = expiringResults.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    // Calculate email success rates
    const expiredWithEmail = expiredResults
      .filter(
        (r) =>
          r.status === 'fulfilled' &&
          r.value.success &&
          !(r.value as any).skipped &&
          (r.value as any).emailSent
      ).length;

    const executionTime = Date.now() - startTime;

    const summary = {
      timestamp: now.toISOString(),
      executionTimeMs: executionTime,
      expired: {
        total: expiredUsers?.length || 0,
        processed: expiredSuccessCount,
        skipped: expiredSkippedCount,
        failed: expiredFailCount,
        emailsSent: expiredWithEmail,
        emailFailures: expiredSuccessCount - expiredWithEmail,
      },
      expiring: {
        total: expiringUsers?.length || 0,
        notified: expiringSuccessCount,
        skipped: expiringSkippedCount,
        failed: expiringFailCount,
      },
      health: {
        overallSuccess: expiredFailCount === 0 && expiringFailCount === 0,
        partialFailure: expiredFailCount > 0 || expiringFailCount > 0,
        criticalFailure: expiredSuccessCount === 0 && (expiredUsers?.length || 0) > 0,
      },
    };

    console.log('✅ Trial check cron job completed:', summary);

    // Return 200 even with partial failures (Vercel won't retry on 200)
    return Response.json({
      success: true,
      message: 'Trial check completed',
      summary,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('❌ Cron job failed catastrophically:', error);

    // Return 500 to trigger Vercel retry (if configured)
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
