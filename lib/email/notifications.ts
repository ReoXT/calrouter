/**
 * Email Notification Utilities
 *
 * Handles sending email notifications for various payment and subscription events.
 * Uses Resend for production email delivery.
 */

import { Resend } from 'resend';
import {
  trialEndingEmailHtml,
  trialExpiredEmailHtml,
  paymentFailedEmailHtml,
  paymentSucceededEmailHtml,
  subscriptionCancelledEmailHtml,
  webhookFailureEmailHtml,
  welcomeEmailHtml,
  subscriptionUpdatedEmailHtml,
} from './templates';

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
  | 'trial_expired'
  | 'payment_succeeded';

interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
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
    const updatePaymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

    const payload: EmailPayload = {
      to: email,
      subject: `Payment Failed - Action Required (Attempt ${attemptNumber}/3)`,
      body: `
Dear CalRouter User,

We were unable to process your payment for your CalRouter Pro subscription.

Attempt: ${attemptNumber} of 3
Previous failures: ${failureCount}

Please update your payment method to continue using CalRouter Pro:
${updatePaymentUrl}

${attemptNumber >= 3 ? 'This is your final notice. Your subscription will be cancelled if payment is not received.' : 'We will automatically retry payment soon.'}

If you believe this is an error, please contact support.

Best regards,
CalRouter Team
      `.trim(),
      html: paymentFailedEmailHtml(attemptNumber, updatePaymentUrl),
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

    const reactivateUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

    const payload: EmailPayload = {
      to: email,
      subject: 'Your CalRouter Subscription Has Been Cancelled',
      body: `
Dear CalRouter User,

Your CalRouter Pro subscription has been cancelled ${reasonText}.

What happens now:
- Your webhook endpoints have been disabled
- Your data will be retained for 30 days
- You can reactivate anytime at: ${reactivateUrl}

We're sorry to see you go! If there's anything we can do to improve, please let us know.

Best regards,
CalRouter Team
      `.trim(),
      html: subscriptionCancelledEmailHtml(reason, reactivateUrl),
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
    const billingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

    const payload: EmailPayload = {
      to: email,
      subject: 'Your CalRouter Subscription Has Been Updated',
      body: `
Dear CalRouter User,

Your CalRouter Pro subscription has been updated.

Previous plan: ${oldPlan}
New plan: ${newPlan}

Your updated billing will be reflected in your next invoice.
View details at: ${billingUrl}

Best regards,
CalRouter Team
      `.trim(),
      html: subscriptionUpdatedEmailHtml(oldPlan, newPlan, billingUrl),
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
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    const setupGuideUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/setup`;

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

Get started: ${dashboardUrl}/endpoints

Need help? Check out our setup guide: ${setupGuideUrl}

Best regards,
CalRouter Team
      `.trim(),
      html: paymentSucceededEmailHtml(planType, amount, dashboardUrl, setupGuideUrl),
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
 * Send trial expiry notification
 */
export async function sendTrialExpiredEmail(email: string): Promise<void> {
  try {
    const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

    const payload: EmailPayload = {
      to: email,
      subject: 'Your CalRouter Trial Has Expired',
      body: `
Dear CalRouter User,

Your 14-day free trial has ended.

What happens now:
- Your webhook endpoints have been disabled
- Your data will be retained for 30 days
- You can upgrade anytime to continue using CalRouter

Upgrade to CalRouter Pro for just $29/month:
${upgradeUrl}

What you'll get:
✓ Unlimited webhook endpoints
✓ Automatic reschedule detection
✓ Custom question parsing
✓ UTM parameter tracking
✓ Advanced analytics
✓ Priority support

We'd love to have you continue using CalRouter!

Best regards,
CalRouter Team
      `.trim(),
      html: trialExpiredEmailHtml(upgradeUrl),
      metadata: {
        type: 'trial_expired',
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send trial expired email:', error);
  }
}

/**
 * Send trial ending soon notification (3 days before)
 */
export async function sendTrialEndingEmail(email: string, daysLeft: number): Promise<void> {
  try {
    const upgradeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;

    const payload: EmailPayload = {
      to: email,
      subject: `Your CalRouter Trial Ends in ${daysLeft} Days`,
      body: `
Dear CalRouter User,

Your CalRouter trial ends in ${daysLeft} days.

Don't lose access to:
✓ Automatic reschedule detection
✓ Custom question parsing
✓ UTM parameter tracking
✓ Advanced analytics

Upgrade now for just $29/month (or $24/month billed annually):
${upgradeUrl}

Questions? We're here to help!

Best regards,
CalRouter Team
      `.trim(),
      html: trialEndingEmailHtml(daysLeft, upgradeUrl),
      metadata: {
        type: 'trial_ending',
        daysLeft,
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send trial ending email:', error);
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
    if (payload.html) {
      console.log('📝 HTML: <HTML content available>');
    }
    return;
  }

  // Production: Send via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      text: payload.body,
      html: payload.html, // Use HTML template if provided
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
 * Send webhook failure alert (after 3+ consecutive failures)
 */
export async function sendWebhookFailureEmail(
  email: string,
  endpointName: string,
  failureCount: number,
  lastError: string
): Promise<void> {
  try {
    const logsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/logs`;

    const payload: EmailPayload = {
      to: email,
      subject: `⚠️ Webhook Failures Detected - ${endpointName}`,
      body: `
Dear CalRouter User,

Your webhook endpoint "${endpointName}" has experienced ${failureCount} consecutive failures.

Last error: ${lastError}

What to check:
✓ Is your destination URL correct and accessible?
✓ Is your webhook service (Zapier/Make/n8n) running?
✓ Are there any authentication or rate limit issues?

View details and fix: ${logsUrl}

Your endpoint will continue receiving webhooks, but enriched data is not being delivered.

Need help? Contact support or check our troubleshooting guide.

Best regards,
CalRouter Team
      `.trim(),
      html: webhookFailureEmailHtml(endpointName, failureCount, lastError, logsUrl),
      metadata: {
        type: 'webhook_failure',
        endpointName,
        failureCount,
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send webhook failure email:', error);
    // Don't throw - email failure shouldn't break webhook processing
  }
}

/**
 * Send welcome email for new users
 */
export async function sendWelcomeEmail(email: string, userName?: string): Promise<void> {
  try {
    const greeting = userName ? `Dear ${userName}` : 'Dear CalRouter User';
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    const setupGuideUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/setup`;

    const payload: EmailPayload = {
      to: email,
      subject: 'Welcome to CalRouter! 🎉',
      body: `
${greeting},

Welcome to CalRouter! We're excited to help you enrich your Calendly webhooks.

You have 14 days to try all Pro features:
✓ Automatic reschedule detection
✓ Custom question parsing
✓ UTM parameter tracking
✓ Advanced analytics

Get started in 3 easy steps:

1. Create your first endpoint
   ${dashboardUrl}/endpoints

2. Add the webhook URL to Calendly
   ${setupGuideUrl}

3. Connect your automation tool (Zapier, Make, n8n, etc.)

Need help? Check out our setup guide:
${setupGuideUrl}

Questions? Just reply to this email - we're here to help!

Best regards,
CalRouter Team
      `.trim(),
      html: welcomeEmailHtml(userName, dashboardUrl, setupGuideUrl),
      metadata: {
        type: 'welcome',
      },
    };

    await sendEmail(payload);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

/**
 * Send email with validation
 */
export async function sendEmailSafe(type: EmailNotificationType, email: string, data?: any): Promise<void> {
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
    case 'trial_expired':
      await sendTrialExpiredEmail(email);
      break;
    case 'trial_ending':
      await sendTrialEndingEmail(email, data.daysLeft);
      break;
    default:
      console.warn('Unknown email notification type:', type);
  }
}
