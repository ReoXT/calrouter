/**
 * Email Notification Utilities
 *
 * Handles sending email notifications for various payment and subscription events.
 * Uses Resend for production email delivery.
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'CalRouter <noreply@calrouter.app>';
const ENABLE_EMAILS = process.env.ENABLE_EMAILS !== 'false'; // Default to true

export type EmailNotificationType =
  | 'payment_failed'
  | 'subscription_cancelled'
  | 'subscription_updated'
  | 'trial_ending'
  | 'payment_succeeded';

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, any>;
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(
  email: string,
  failureCount: number,
  attemptNumber: number
): Promise<void> {
  try {
    const payload: EmailPayload = {
      to: email,
      subject: `Payment Failed - Action Required (Attempt ${attemptNumber}/3)`,
      body: `
Dear CalRouter User,

We were unable to process your payment for your CalRouter Pro subscription.

Attempt: ${attemptNumber} of 3
Previous failures: ${failureCount}

Please update your payment method to continue using CalRouter Pro:
${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing

${attemptNumber >= 3 ? 'This is your final notice. Your subscription will be cancelled if payment is not received.' : 'We will automatically retry payment soon.'}

If you believe this is an error, please contact support.

Best regards,
CalRouter Team
      `.trim(),
      metadata: {
        type: 'payment_failed',
        failureCount,
        attemptNumber,
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    // Don't throw - email failure shouldn't break webhook processing
  }
}

/**
 * Send subscription cancelled notification
 */
export async function sendSubscriptionCancelledEmail(
  email: string,
  reason: 'user_cancelled' | 'payment_failed'
): Promise<void> {
  try {
    const reasonText = reason === 'payment_failed'
      ? 'due to multiple failed payment attempts'
      : 'at your request';

    const payload: EmailPayload = {
      to: email,
      subject: 'Your CalRouter Subscription Has Been Cancelled',
      body: `
Dear CalRouter User,

Your CalRouter Pro subscription has been cancelled ${reasonText}.

What happens now:
- Your webhook endpoints have been disabled
- Your data will be retained for 30 days
- You can reactivate anytime at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing

We're sorry to see you go! If there's anything we can do to improve, please let us know.

Best regards,
CalRouter Team
      `.trim(),
      metadata: {
        type: 'subscription_cancelled',
        reason,
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send subscription cancelled email:', error);
  }
}

/**
 * Send subscription updated notification
 */
export async function sendSubscriptionUpdatedEmail(
  email: string,
  oldPlan: string,
  newPlan: string
): Promise<void> {
  try {
    const payload: EmailPayload = {
      to: email,
      subject: 'Your CalRouter Subscription Has Been Updated',
      body: `
Dear CalRouter User,

Your CalRouter Pro subscription has been updated.

Previous plan: ${oldPlan}
New plan: ${newPlan}

Your updated billing will be reflected in your next invoice.
View details at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing

Best regards,
CalRouter Team
      `.trim(),
      metadata: {
        type: 'subscription_updated',
        oldPlan,
        newPlan,
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send subscription updated email:', error);
  }
}

/**
 * Send payment succeeded notification (optional - for first payment)
 */
export async function sendPaymentSucceededEmail(
  email: string,
  planType: string,
  amount: number
): Promise<void> {
  try {
    const payload: EmailPayload = {
      to: email,
      subject: 'Welcome to CalRouter Pro! 🎉',
      body: `
Dear CalRouter User,

Your payment has been successfully processed! Welcome to CalRouter Pro.

Plan: ${planType}
Amount: $${(amount / 100).toFixed(2)}

Your webhooks are now being enriched with:
✓ Automatic reschedule detection
✓ Custom question parsing
✓ UTM parameter tracking
✓ Advanced analytics

Get started: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/endpoints

Need help? Check out our setup guide: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/setup

Best regards,
CalRouter Team
      `.trim(),
      metadata: {
        type: 'payment_succeeded',
        planType,
        amount,
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send payment succeeded email:', error);
  }
}

/**
 * Core email sending function
 * Sends emails via Resend in production, logs to console in development
 */
async function sendEmail(payload: EmailPayload): Promise<void> {
  // Check if emails are enabled
  if (!ENABLE_EMAILS) {
    console.log('📧 [Email Disabled] Would send:', {
      to: payload.to,
      subject: payload.subject,
    });
    return;
  }

  // Development: Log to console if Resend not configured
  if (!resend) {
    console.log('📧 [Dev Mode] Email:', {
      to: payload.to,
      subject: payload.subject,
      metadata: payload.metadata,
    });
    console.log('📝 Body:', payload.body);
    return;
  }

  // Production: Send via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
      // Optional: Add HTML version for better formatting
      // html: convertToHtml(payload.body),
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error(`Email failed: ${error.message}`);
    }

    console.log('✅ Email sent successfully:', {
      to: payload.to,
      subject: payload.subject,
      emailId: data?.id,
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    // Re-throw to allow caller to handle
    throw error;
  }
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Send email with validation
 */
async function sendEmailSafe(type: EmailNotificationType, email: string, data: any): Promise<void> {
  if (!isValidEmail(email)) {
    console.error('Invalid email address:', email);
    return;
  }

  switch (type) {
    case 'payment_failed':
      await sendPaymentFailedEmail(email, data.failureCount, data.attemptNumber);
      break;
    case 'subscription_cancelled':
      await sendSubscriptionCancelledEmail(email, data.reason);
      break;
    case 'subscription_updated':
      await sendSubscriptionUpdatedEmail(email, data.oldPlan, data.newPlan);
      break;
    case 'payment_succeeded':
      await sendPaymentSucceededEmail(email, data.planType, data.amount);
      break;
    default:
      console.warn('Unknown email notification type:', type);
  }
}
