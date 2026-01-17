import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/client';
import {
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendSubscriptionUpdatedEmail,
  sendPaymentSucceededEmail,
} from '@/lib/email/notifications';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Disable Next.js body parsing for webhook signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe Webhook Handler
 *
 * Handles subscription lifecycle events from Stripe:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.deleted: Subscription cancelled
 * - customer.subscription.updated: Subscription changed (plan, status, etc)
 * - invoice.payment_failed: Payment failed (retry logic)
 * - invoice.payment_succeeded: Payment succeeded
 *
 * Security:
 * - Verifies Stripe webhook signature
 * - Logs all events for audit trail
 * - Implements idempotency (duplicate event handling)
 * - Always returns 200 OK to Stripe
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log event metadata
    console.log(`[Stripe Webhook] Event received: ${event.type} (ID: ${event.id})`);

    // Check for duplicate events (idempotency)
    const isDuplicate = await checkDuplicateEvent(event.id);
    if (isDuplicate) {
      console.log(`[Stripe Webhook] Duplicate event detected: ${event.id}`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Process event based on type
    let processingResult: ProcessingResult;
    switch (event.type) {
      case 'checkout.session.completed':
        processingResult = await handleCheckoutCompleted(event);
        break;

      case 'customer.subscription.deleted':
        processingResult = await handleSubscriptionDeleted(event);
        break;

      case 'customer.subscription.updated':
        processingResult = await handleSubscriptionUpdated(event);
        break;

      case 'invoice.payment_failed':
        processingResult = await handlePaymentFailed(event);
        break;

      case 'invoice.payment_succeeded':
        processingResult = await handlePaymentSucceeded(event);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        processingResult = {
          status: 'processed',
          message: `Unhandled event type: ${event.type}`,
        };
    }

    // Log event to database
    await logStripeEvent(event, processingResult);

    const processingTime = Date.now() - startTime;
    console.log(
      `[Stripe Webhook] Event processed successfully: ${event.type} (${processingTime}ms)`
    );

    // Always return 200 OK to Stripe
    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      status: processingResult.status,
      processingTime: `${processingTime}ms`,
    });
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error);

    // Still return 200 to prevent Stripe retries for our internal errors
    // Log the error for investigation
    return NextResponse.json({
      received: true,
      error: 'Internal processing error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ======================
// EVENT HANDLERS
// ======================

interface ProcessingResult {
  status: 'processed' | 'failed' | 'skipped';
  message: string;
  errorMessage?: string;
}

/**
 * Handle checkout.session.completed
 * Fires when a customer completes checkout and a subscription is created
 */
async function handleCheckoutCompleted(
  event: Stripe.Event
): Promise<ProcessingResult> {
  const session = event.data.object as Stripe.Checkout.Session;

  try {
    const clerkUserId = session.metadata?.clerk_user_id;
    const planType = session.metadata?.plan_type;

    if (!clerkUserId) {
      console.error('Missing clerk_user_id in checkout session metadata');
      return {
        status: 'failed',
        message: 'Missing user ID in metadata',
        errorMessage: 'clerk_user_id not found',
      };
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin!
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (userError || !user) {
      console.error('User not found:', clerkUserId);
      return {
        status: 'failed',
        message: 'User not found',
        errorMessage: userError?.message,
      };
    }

    // Update user subscription
    const { error: updateError } = await supabaseAdmin!
      .from('users')
      .update({
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_plan_type: planType || 'monthly',
        trial_ends_at: null, // Clear trial end date
        payment_failure_count: 0, // Reset failure count
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    // Send welcome email
    if (session.amount_total) {
      await sendPaymentSucceededEmail(
        user.email,
        planType || 'monthly',
        session.amount_total
      );
    }

    console.log(
      `[Stripe Webhook] Subscription activated for user: ${clerkUserId}`
    );

    return {
      status: 'processed',
      message: 'Subscription activated successfully',
    };
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    return {
      status: 'failed',
      message: 'Failed to activate subscription',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle customer.subscription.deleted
 * Fires when a subscription is cancelled (by user or due to payment failure)
 */
async function handleSubscriptionDeleted(
  event: Stripe.Event
): Promise<ProcessingResult> {
  const subscription = event.data.object as Stripe.Subscription;

  try {
    // Find user by Stripe customer ID
    const { data: user, error: userError } = await supabaseAdmin!
      .from('users')
      .select('*')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (userError || !user) {
      console.error('User not found for customer:', subscription.customer);
      return {
        status: 'failed',
        message: 'User not found',
        errorMessage: userError?.message,
      };
    }

    // Determine cancellation reason
    const reason =
      subscription.cancellation_details?.reason === 'payment_failed'
        ? 'payment_failed'
        : 'user_cancelled';

    // Update user status
    const { error: updateError } = await supabaseAdmin!
      .from('users')
      .update({
        subscription_status: 'cancelled',
        stripe_subscription_id: null,
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    // Disable all user endpoints
    const { error: endpointsError } = await supabaseAdmin!
      .from('webhook_endpoints')
      .update({ is_active: false })
      .eq('user_id', user.id);

    if (endpointsError) {
      console.error('Failed to disable endpoints:', endpointsError);
      // Don't throw - subscription cancellation is more important
    }

    // Send cancellation email
    await sendSubscriptionCancelledEmail(user.email, reason);

    console.log(
      `[Stripe Webhook] Subscription cancelled for user: ${user.clerk_user_id} (reason: ${reason})`
    );

    return {
      status: 'processed',
      message: `Subscription cancelled (${reason})`,
    };
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    return {
      status: 'failed',
      message: 'Failed to cancel subscription',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle customer.subscription.updated
 * Fires when subscription details change (plan, billing cycle, status)
 */
async function handleSubscriptionUpdated(
  event: Stripe.Event
): Promise<ProcessingResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const previousAttributes = event.data.previous_attributes as any;

  try {
    // Find user by Stripe customer ID
    const { data: user, error: userError } = await supabaseAdmin!
      .from('users')
      .select('*')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (userError || !user) {
      console.error('User not found for customer:', subscription.customer);
      return {
        status: 'failed',
        message: 'User not found',
        errorMessage: userError?.message,
      };
    }

    // Map Stripe status to our subscription status
    const subscriptionStatus = mapStripeStatus(subscription.status);

    // Extract plan type from subscription metadata or items
    const planType = subscription.metadata?.plan_type || user.subscription_plan_type;

    // Update user subscription details
    const { error: updateError } = await supabaseAdmin!
      .from('users')
      .update({
        subscription_status: subscriptionStatus,
        subscription_plan_type: planType,
        subscription_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    // Send notification if plan changed
    if (previousAttributes?.items && user.subscription_plan_type !== planType) {
      await sendSubscriptionUpdatedEmail(
        user.email,
        user.subscription_plan_type || 'monthly',
        planType || 'monthly'
      );
    }

    console.log(
      `[Stripe Webhook] Subscription updated for user: ${user.clerk_user_id} (status: ${subscriptionStatus})`
    );

    return {
      status: 'processed',
      message: 'Subscription updated successfully',
    };
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    return {
      status: 'failed',
      message: 'Failed to update subscription',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle invoice.payment_failed
 * Fires when a payment attempt fails
 * Implements retry logic with email notifications
 */
async function handlePaymentFailed(
  event: Stripe.Event
): Promise<ProcessingResult> {
  const invoice = event.data.object as Stripe.Invoice;

  try {
    // Find user by Stripe customer ID
    const { data: user, error: userError } = await supabaseAdmin!
      .from('users')
      .select('*')
      .eq('stripe_customer_id', invoice.customer as string)
      .single();

    if (userError || !user) {
      console.error('User not found for customer:', invoice.customer);
      return {
        status: 'failed',
        message: 'User not found',
        errorMessage: userError?.message,
      };
    }

    // Increment failure count
    const newFailureCount = (user.payment_failure_count || 0) + 1;

    // Update user with failure details
    const { error: updateError } = await supabaseAdmin!
      .from('users')
      .update({
        payment_failure_count: newFailureCount,
        last_payment_failure_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    // Send notification based on attempt number
    await sendPaymentFailedEmail(user.email, newFailureCount, invoice.attempt_count || newFailureCount);

    // After 3 failures, cancel subscription
    if (newFailureCount >= 3) {
      console.warn(
        `[Stripe Webhook] 3 payment failures for user: ${user.clerk_user_id}. Subscription will be cancelled by Stripe.`
      );

      // Note: Stripe will automatically cancel the subscription after multiple failures
      // We'll handle the actual cancellation in customer.subscription.deleted event
    }

    console.log(
      `[Stripe Webhook] Payment failed for user: ${user.clerk_user_id} (attempt ${newFailureCount})`
    );

    return {
      status: 'processed',
      message: `Payment failure recorded (attempt ${newFailureCount})`,
    };
  } catch (error) {
    console.error('Error handling payment failed:', error);
    return {
      status: 'failed',
      message: 'Failed to process payment failure',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle invoice.payment_succeeded
 * Fires when a payment is successfully processed
 * Reset failure counter on successful payment
 */
async function handlePaymentSucceeded(
  event: Stripe.Event
): Promise<ProcessingResult> {
  const invoice = event.data.object as Stripe.Invoice;

  try {
    // Find user by Stripe customer ID
    const { data: user, error: userError } = await supabaseAdmin!
      .from('users')
      .select('*')
      .eq('stripe_customer_id', invoice.customer as string)
      .single();

    if (userError || !user) {
      console.error('User not found for customer:', invoice.customer);
      return {
        status: 'failed',
        message: 'User not found',
        errorMessage: userError?.message,
      };
    }

    // Reset payment failure count on successful payment
    if (user.payment_failure_count && user.payment_failure_count > 0) {
      const { error: updateError } = await supabaseAdmin!
        .from('users')
        .update({
          payment_failure_count: 0,
          last_payment_failure_at: null,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to reset failure count:', updateError);
        // Don't throw - payment succeeded is more important
      }

      console.log(
        `[Stripe Webhook] Payment failure count reset for user: ${user.clerk_user_id}`
      );
    }

    return {
      status: 'processed',
      message: 'Payment succeeded',
    };
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    return {
      status: 'failed',
      message: 'Failed to process payment success',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Check if event has already been processed (idempotency)
 */
async function checkDuplicateEvent(eventId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin!
      .from('stripe_event_logs')
      .select('id')
      .eq('stripe_event_id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Error checking duplicate event:', error);
      return false; // Process anyway on error
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkDuplicateEvent:', error);
    return false;
  }
}

/**
 * Log Stripe event to database for audit trail
 */
async function logStripeEvent(
  event: Stripe.Event,
  result: ProcessingResult
): Promise<void> {
  try {
    const eventData = event.data.object as any;

    await supabaseAdmin!.from('stripe_event_logs').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      customer_id: eventData.customer || null,
      subscription_id: eventData.subscription || null,
      invoice_id: eventData.id && event.type.includes('invoice') ? eventData.id : null,
      payment_intent_id: eventData.payment_intent || null,
      amount: eventData.amount_total || eventData.amount_paid || null,
      currency: eventData.currency || null,
      status: result.status,
      error_message: result.errorMessage || null,
      raw_payload: event as any,
    });
  } catch (error) {
    console.error('Failed to log Stripe event:', error);
    // Don't throw - logging failure shouldn't break webhook processing
  }
}

/**
 * Map Stripe subscription status to our internal status
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: 'active',
    past_due: 'past_due',
    unpaid: 'unpaid',
    canceled: 'cancelled',
    incomplete: 'incomplete',
    incomplete_expired: 'expired',
    trialing: 'trial',
    paused: 'paused',
  };

  return statusMap[stripeStatus] || 'unknown';
}
