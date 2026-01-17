# Email Notification System

CalRouter uses Resend to send automated email notifications to users for important events.

## 📧 Email Types

### 1. Trial & Subscription Emails

#### **Trial Ending Reminder** (3 days before expiry)
- **Trigger:** Cron job runs daily at 2 AM UTC
- **Condition:** User is on trial AND trial ends in exactly 3 days
- **Edge Cases Handled:**
  - Prevents duplicate sends (tracks `trial_reminder_sent_at` timestamp)
  - Validates email format before sending
  - Skips users who already upgraded
  - Handles timezone edge cases with ceiling calculation

#### **Trial Expired**
- **Trigger:** Cron job runs daily at 2 AM UTC
- **Condition:** User is on trial AND trial_ends_at < now
- **Actions:**
  - Disables all user endpoints
  - Updates subscription_status to 'expired'
  - Sends email notification
- **Edge Cases Handled:**
  - Concurrent execution safety (atomic updates)
  - Email retry on failure
  - Partial failures (some users succeed, others fail)
  - Already processed users (idempotency)

### 2. Payment Emails

#### **Payment Failed**
- **Trigger:** Stripe webhook (`invoice.payment_failed`)
- **Includes:**
  - Attempt number (1/2/3)
  - Total failure count
  - Link to update payment method
  - Warning on final attempt
- **Edge Cases Handled:**
  - Multiple payment method failures
  - Stripe retry delays
  - Grace period handling

#### **Payment Succeeded**
- **Trigger:** Stripe webhook (`checkout.session.completed`)
- **Includes:**
  - Welcome message
  - Plan details (monthly/annual)
  - Amount charged
  - Next steps (create endpoint, setup guide)
- **Edge Cases Handled:**
  - Plan type detection from metadata
  - First payment vs renewal

#### **Subscription Cancelled**
- **Trigger:** Stripe webhook (`customer.subscription.deleted`)
- **Includes:**
  - Cancellation reason (user_cancelled vs payment_failed)
  - What happens next (endpoints disabled, data retained 30 days)
  - Reactivation link
- **Edge Cases Handled:**
  - Voluntary vs involuntary cancellation
  - Grace period handling
  - Data retention policy

#### **Subscription Updated**
- **Trigger:** Stripe webhook (`customer.subscription.updated`)
- **Includes:**
  - Old plan vs new plan
  - Next billing date
- **Edge Cases Handled:**
  - Upgrade vs downgrade
  - Mid-cycle changes
  - Prorated billing

### 3. Webhook Failure Alerts

#### **Webhook Failures Detected**
- **Trigger:** Cron job runs every hour
- **Condition:** Endpoint has 3+ consecutive failures
- **Includes:**
  - Endpoint name
  - Number of consecutive failures
  - Last error message
  - Troubleshooting checklist
  - Link to logs page
- **Edge Cases Handled:**
  - Cooldown period (24 hours between notifications per endpoint)
  - Intermittent failures (only consecutive count)
  - Endpoint recovery (stops sending when success)
  - Inactive/deleted endpoints (skipped)
  - Missing user email validation

### 4. Welcome Email

#### **Welcome to CalRouter**
- **Trigger:** User signs up (Clerk webhook)
- **Includes:**
  - Personalized greeting (if name available)
  - Trial duration (14 days)
  - Feature list
  - Step-by-step getting started guide
  - Links to dashboard, setup guide
- **Edge Cases Handled:**
  - Missing user name (generic greeting)
  - Email already sent (idempotency)

---

## 🔧 Configuration

### Environment Variables

```bash
# Required for production
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=CalRouter <noreply@calrouter.app>

# Optional (defaults shown)
ENABLE_EMAILS=true  # Set to false to disable all emails
NEXT_PUBLIC_APP_URL=https://calrouter.app
```

### Development Mode

When `RESEND_API_KEY` is not set:
- Emails are logged to console instead of sent
- Includes full email body in logs
- Useful for testing without Resend account

When `ENABLE_EMAILS=false`:
- All email sends are skipped (with log message)
- Database updates still happen
- Useful for testing webhooks without email spam

---

## 📁 File Structure

```
lib/email/
  └── notifications.ts          # All email functions

app/api/cron/
  ├── check-trials/route.ts     # Trial expiry cron (daily)
  └── check-webhook-failures/   # Webhook failure cron (hourly)
      └── route.ts

vercel.json                     # Cron job configuration
```

---

## 🚀 Usage

### Sending Emails Directly

```typescript
import {
  sendTrialEndingEmail,
  sendTrialExpiredEmail,
  sendPaymentFailedEmail,
  sendWebhookFailureEmail,
  sendWelcomeEmail
} from '@/lib/email/notifications';

// Trial reminder (3 days before expiry)
await sendTrialEndingEmail('user@example.com', 3);

// Trial expired
await sendTrialExpiredEmail('user@example.com');

// Payment failed
await sendPaymentFailedEmail('user@example.com', 2, 3); // 2 failures, attempt 3

// Webhook failures
await sendWebhookFailureEmail(
  'user@example.com',
  'My Endpoint',
  5, // consecutive failures
  'Connection timeout'
);

// Welcome email
await sendWelcomeEmail('user@example.com', 'John Doe');
```

### Using the Safe Wrapper

```typescript
import { sendEmailSafe, EmailNotificationType } from '@/lib/email/notifications';

// Validates email format before sending
await sendEmailSafe('trial_ending', 'user@example.com', { daysLeft: 3 });
await sendEmailSafe('payment_failed', 'user@example.com', {
  failureCount: 2,
  attemptNumber: 3
});
```

---

## 🛡️ Error Handling

All email functions:
1. **Never throw errors** - Email failures shouldn't break app functionality
2. **Log errors** - All failures logged to console for debugging
3. **Retry once** - Failed sends are retried after 1 second delay
4. **Validate inputs** - Email format, required fields checked
5. **Graceful degradation** - Missing/invalid data doesn't break send

Example error handling:

```typescript
try {
  await sendTrialExpiredEmail(user.email);
  emailSent = true;
} catch (error) {
  console.error('Email send failed:', error);

  // Retry once
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await sendTrialExpiredEmail(user.email);
    emailSent = true;
  } catch (retryError) {
    console.error('Email retry failed:', retryError);
    // Don't throw - continue processing
  }
}
```

---

## ⏰ Cron Jobs

### Trial Check (Daily at 2 AM UTC)
- Path: `/api/cron/check-trials`
- Frequency: `0 2 * * *` (daily)
- Actions:
  - Find expired trials → expire users, disable endpoints, send emails
  - Find trials ending in 3 days → send reminder emails
- Performance: Processes 50 users per run (batched)
- Idempotency: Safe to run multiple times

### Webhook Failure Check (Every Hour)
- Path: `/api/cron/check-webhook-failures`
- Frequency: `0 * * * *` (hourly)
- Actions:
  - Check recent logs for each active endpoint
  - Count consecutive failures
  - Send alert if ≥3 consecutive failures AND not notified in last 24h
- Performance: Processes 50 endpoints per run (batched)
- Idempotency: Safe to run multiple times

---

## 🔐 Security

### Authentication
Cron endpoints require `Authorization: Bearer {CRON_SECRET}` header.

```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Email Validation
All emails validated before sending:

```typescript
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
```

### Rate Limiting
Webhook failure emails limited to 1 per endpoint per 24 hours via `failure_notification_sent_at` timestamp.

---

## 📊 Monitoring

### Success Metrics
Each cron job returns detailed summary:

```json
{
  "success": true,
  "summary": {
    "timestamp": "2026-01-17T02:00:00.000Z",
    "executionTimeMs": 1234,
    "checked": 50,
    "notified": 3,
    "skipped": 45,
    "failed": 2,
    "health": {
      "overallSuccess": false,
      "partialFailure": true,
      "criticalFailure": false
    }
  }
}
```

### Logs
All cron jobs log detailed progress:
- ✅ Success (green check)
- ⚠️ Warning (yellow warning)
- ❌ Error (red X)
- ⏭️ Skipped (skip arrow)
- 🔒 Security action (lock)
- 📧 Email action (envelope)

---

## 🧪 Testing

### Local Testing (Console Logs)
```bash
# Don't set RESEND_API_KEY
# Emails will be logged to console
npm run dev
```

### Production Testing (Real Emails)
```bash
# Set RESEND_API_KEY
# Use your personal email for testing
RESEND_FROM_EMAIL="CalRouter Test <your-email@resend.dev>"
```

### Manual Cron Trigger
```bash
# Test trial check cron
curl -H "Authorization: Bearer your_cron_secret" \
  https://your-app.vercel.app/api/cron/check-trials

# Test webhook failure cron
curl -H "Authorization: Bearer your_cron_secret" \
  https://your-app.vercel.app/api/cron/check-webhook-failures
```

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check RESEND_API_KEY is set**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Check ENABLE_EMAILS is true**
   ```bash
   echo $ENABLE_EMAILS  # Should be 'true' or unset
   ```

3. **Check Resend dashboard** for delivery errors
   - Go to https://resend.com/emails
   - Look for bounces, spam complaints

4. **Check console logs** for error messages
   ```
   ❌ Resend error: { message: "..." }
   ```

### Duplicate Emails

1. **Trial reminders duplicating?**
   - Check `trial_reminder_sent_at` is being updated
   - Check cron job isn't running multiple times
   - Verify 12-hour cooldown logic

2. **Webhook failure emails duplicating?**
   - Check `failure_notification_sent_at` is being updated
   - Verify 24-hour cooldown logic

### Cron Jobs Not Running

1. **Check vercel.json is deployed**
   ```bash
   git status  # Make sure vercel.json is committed
   ```

2. **Check Vercel logs** for cron execution
   - Go to Vercel dashboard → Functions → Cron
   - Look for execution logs

3. **Check CRON_SECRET is set** in Vercel environment variables

---

## 📝 Best Practices

1. **Always use try-catch** - Email failures shouldn't break app
2. **Never throw errors** - Log and continue processing
3. **Validate inputs** - Check email format, required fields
4. **Use retries** - Retry failed sends once with delay
5. **Add cooldowns** - Prevent email spam with timestamps
6. **Log everything** - Detailed logs for debugging
7. **Test locally first** - Use console logs before production
8. **Monitor delivery** - Check Resend dashboard regularly

---

## 🔄 Migration Checklist

When deploying the email notification system:

- [ ] Set `RESEND_API_KEY` in Vercel environment variables
- [ ] Set `RESEND_FROM_EMAIL` in Vercel environment variables
- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Run database migration: `add_failure_notification_field.sql`
- [ ] Deploy `vercel.json` with cron configuration
- [ ] Test trial check cron manually
- [ ] Test webhook failure cron manually
- [ ] Verify emails arrive in inbox (not spam)
- [ ] Monitor Resend dashboard for delivery issues
- [ ] Check Vercel cron logs for execution

---

## 📚 Related Documentation

- [Resend API Docs](https://resend.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Database Schema](../lib/supabase/schema.sql)
- [Cron Improvements](./CRON_IMPROVEMENTS.md)
