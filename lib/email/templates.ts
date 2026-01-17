/**
 * HTML Email Templates
 *
 * Provides simple, responsive HTML email templates for better formatting
 * Falls back to plain text if HTML not supported
 */

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: oklch(0.5854 0.2041 277.1173);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin: 16px 0;
`;

const linkStyles = `
  color: oklch(0.5854 0.2041 277.1173);
  text-decoration: none;
`;

/**
 * Wrap content in basic HTML email structure
 */
function wrapInEmailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CalRouter</title>
</head>
<body style="${baseStyles}">
  ${content}
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="color: #666; font-size: 14px;">
    This email was sent by CalRouter. If you have questions, reply to this email.
  </p>
  <p style="color: #999; font-size: 12px;">
    CalRouter - Webhook enrichment and routing for Calendly
  </p>
</body>
</html>
  `.trim();
}

/**
 * Trial ending reminder email template
 */
export function trialEndingEmailHtml(daysLeft: number, upgradeUrl: string): string {
  return wrapInEmailLayout(`
    <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">
      Your CalRouter Trial Ends in ${daysLeft} Days
    </h1>

    <p>Your CalRouter trial is ending soon. Don't lose access to:</p>

    <ul style="padding-left: 20px;">
      <li>✓ Automatic reschedule detection</li>
      <li>✓ Custom question parsing</li>
      <li>✓ UTM parameter tracking</li>
      <li>✓ Advanced analytics</li>
    </ul>

    <p>
      <a href="${upgradeUrl}" style="${buttonStyles}">
        Upgrade Now - Just $29/month
      </a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Or save 17% with annual billing: $24/month ($288/year)
    </p>

    <p>Questions? We're here to help!</p>
  `);
}

/**
 * Trial expired email template
 */
export function trialExpiredEmailHtml(upgradeUrl: string): string {
  return wrapInEmailLayout(`
    <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">
      Your CalRouter Trial Has Expired
    </h1>

    <p>Your 14-day free trial has ended.</p>

    <h2 style="color: #555; font-size: 18px; margin-top: 24px;">What happens now:</h2>
    <ul style="padding-left: 20px;">
      <li>Your webhook endpoints have been disabled</li>
      <li>Your data will be retained for 30 days</li>
      <li>You can upgrade anytime to continue using CalRouter</li>
    </ul>

    <p>
      <a href="${upgradeUrl}" style="${buttonStyles}">
        Upgrade to CalRouter Pro - $29/month
      </a>
    </p>

    <h2 style="color: #555; font-size: 18px; margin-top: 24px;">What you'll get:</h2>
    <ul style="padding-left: 20px;">
      <li>✓ Unlimited webhook endpoints</li>
      <li>✓ Automatic reschedule detection</li>
      <li>✓ Custom question parsing</li>
      <li>✓ UTM parameter tracking</li>
      <li>✓ Advanced analytics</li>
      <li>✓ Priority support</li>
    </ul>

    <p>We'd love to have you continue using CalRouter!</p>
  `);
}

/**
 * Payment failed email template
 */
export function paymentFailedEmailHtml(
  attemptNumber: number,
  updatePaymentUrl: string
): string {
  const isFinalWarning = attemptNumber >= 3;

  return wrapInEmailLayout(`
    <h1 style="color: #d97706; font-size: 24px; margin-bottom: 16px;">
      ⚠️ Payment Failed - Action Required
    </h1>

    <p>We were unable to process your payment for your CalRouter Pro subscription.</p>

    <p style="font-weight: 600;">Attempt: ${attemptNumber} of 3</p>

    ${isFinalWarning ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">
          This is your final notice. Your subscription will be cancelled if payment is not received.
        </p>
      </div>
    ` : `
      <p>We will automatically retry payment soon.</p>
    `}

    <p>
      <a href="${updatePaymentUrl}" style="${buttonStyles}">
        Update Payment Method
      </a>
    </p>

    <p>If you believe this is an error, please contact support.</p>
  `);
}

/**
 * Payment succeeded email template
 */
export function paymentSucceededEmailHtml(
  planType: string,
  amount: number,
  dashboardUrl: string,
  setupGuideUrl: string
): string {
  return wrapInEmailLayout(`
    <h1 style="color: #16a34a; font-size: 24px; margin-bottom: 16px;">
      Welcome to CalRouter Pro! 🎉
    </h1>

    <p>Your payment has been successfully processed!</p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 16px 0;">
      <p style="margin: 0;"><strong>Plan:</strong> ${planType}</p>
      <p style="margin: 8px 0 0 0;"><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
    </div>

    <h2 style="color: #555; font-size: 18px; margin-top: 24px;">Your webhooks are now being enriched with:</h2>
    <ul style="padding-left: 20px;">
      <li>✓ Automatic reschedule detection</li>
      <li>✓ Custom question parsing</li>
      <li>✓ UTM parameter tracking</li>
      <li>✓ Advanced analytics</li>
    </ul>

    <p>
      <a href="${dashboardUrl}" style="${buttonStyles}">
        Get Started
      </a>
    </p>

    <p>
      Need help? Check out our
      <a href="${setupGuideUrl}" style="${linkStyles}">setup guide</a>
    </p>
  `);
}

/**
 * Subscription cancelled email template
 */
export function subscriptionCancelledEmailHtml(
  reason: 'user_cancelled' | 'payment_failed',
  reactivateUrl: string
): string {
  const reasonText = reason === 'payment_failed'
    ? 'due to multiple failed payment attempts'
    : 'at your request';

  return wrapInEmailLayout(`
    <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">
      Your CalRouter Subscription Has Been Cancelled
    </h1>

    <p>Your CalRouter Pro subscription has been cancelled ${reasonText}.</p>

    <h2 style="color: #555; font-size: 18px; margin-top: 24px;">What happens now:</h2>
    <ul style="padding-left: 20px;">
      <li>Your webhook endpoints have been disabled</li>
      <li>Your data will be retained for 30 days</li>
      <li>You can reactivate anytime</li>
    </ul>

    <p>
      <a href="${reactivateUrl}" style="${buttonStyles}">
        Reactivate Subscription
      </a>
    </p>

    <p>We're sorry to see you go! If there's anything we can do to improve, please let us know.</p>
  `);
}

/**
 * Webhook failure alert email template
 */
export function webhookFailureEmailHtml(
  endpointName: string,
  failureCount: number,
  lastError: string,
  logsUrl: string
): string {
  return wrapInEmailLayout(`
    <h1 style="color: #d97706; font-size: 24px; margin-bottom: 16px;">
      ⚠️ Webhook Failures Detected
    </h1>

    <p>Your webhook endpoint <strong>"${endpointName}"</strong> has experienced ${failureCount} consecutive failures.</p>

    <div style="background-color: #fef3c7; border-left: 4px solid #d97706; padding: 16px; margin: 16px 0;">
      <p style="margin: 0;"><strong>Last error:</strong></p>
      <p style="margin: 8px 0 0 0; font-family: monospace; font-size: 14px;">${lastError}</p>
    </div>

    <h2 style="color: #555; font-size: 18px; margin-top: 24px;">What to check:</h2>
    <ul style="padding-left: 20px;">
      <li>✓ Is your destination URL correct and accessible?</li>
      <li>✓ Is your webhook service (Zapier/Make/n8n) running?</li>
      <li>✓ Are there any authentication or rate limit issues?</li>
    </ul>

    <p>
      <a href="${logsUrl}" style="${buttonStyles}">
        View Details & Fix
      </a>
    </p>

    <p style="color: #666; font-size: 14px;">
      Your endpoint will continue receiving webhooks, but enriched data is not being delivered.
    </p>

    <p>Need help? Contact support or check our troubleshooting guide.</p>
  `);
}

/**
 * Welcome email template
 */
export function welcomeEmailHtml(
  userName: string | undefined,
  dashboardUrl: string,
  setupGuideUrl: string
): string {
  const greeting = userName ? `Dear ${userName}` : 'Dear CalRouter User';

  return wrapInEmailLayout(`
    <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">
      Welcome to CalRouter! 🎉
    </h1>

    <p>${greeting},</p>

    <p>Welcome to CalRouter! We're excited to help you enrich your Calendly webhooks.</p>

    <div style="background-color: #f0f9ff; border-left: 4px solid oklch(0.5854 0.2041 277.1173); padding: 16px; margin: 16px 0;">
      <p style="margin: 0; font-weight: 600;">You have 14 days to try all Pro features:</p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>✓ Automatic reschedule detection</li>
        <li>✓ Custom question parsing</li>
        <li>✓ UTM parameter tracking</li>
        <li>✓ Advanced analytics</li>
      </ul>
    </div>

    <h2 style="color: #555; font-size: 18px; margin-top: 24px;">Get started in 3 easy steps:</h2>

    <ol style="padding-left: 20px;">
      <li style="margin-bottom: 12px;">
        <strong>Create your first endpoint</strong><br>
        <a href="${dashboardUrl}/endpoints" style="${linkStyles}">Go to Endpoints →</a>
      </li>
      <li style="margin-bottom: 12px;">
        <strong>Add the webhook URL to Calendly</strong><br>
        <a href="${setupGuideUrl}" style="${linkStyles}">View Setup Guide →</a>
      </li>
      <li style="margin-bottom: 12px;">
        <strong>Connect your automation tool</strong><br>
        <span style="color: #666;">(Zapier, Make, n8n, etc.)</span>
      </li>
    </ol>

    <p>
      <a href="${dashboardUrl}" style="${buttonStyles}">
        Go to Dashboard
      </a>
    </p>

    <p>Questions? Just reply to this email - we're here to help!</p>
  `);
}

/**
 * Subscription updated email template
 */
export function subscriptionUpdatedEmailHtml(
  oldPlan: string,
  newPlan: string,
  billingUrl: string
): string {
  return wrapInEmailLayout(`
    <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">
      Your CalRouter Subscription Has Been Updated
    </h1>

    <p>Your CalRouter Pro subscription has been updated.</p>

    <div style="background-color: #f0f9ff; border-left: 4px solid oklch(0.5854 0.2041 277.1173); padding: 16px; margin: 16px 0;">
      <p style="margin: 0;"><strong>Previous plan:</strong> ${oldPlan}</p>
      <p style="margin: 8px 0 0 0;"><strong>New plan:</strong> ${newPlan}</p>
    </div>

    <p>Your updated billing will be reflected in your next invoice.</p>

    <p>
      <a href="${billingUrl}" style="${buttonStyles}">
        View Billing Details
      </a>
    </p>
  `);
}
