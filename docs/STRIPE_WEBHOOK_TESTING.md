# Stripe Webhook Testing Guide

This guide explains how to test the Stripe webhook handler locally and in production.

## Prerequisites

1. Stripe CLI installed: `brew install stripe/stripe-cli/stripe` (macOS) or download from [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Stripe account with API keys
3. Local development server running

## Setup

### 1. Environment Variables

Ensure these variables are set in your `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
```

### 2. Database Migration

Run the Stripe fields migration:

```bash
# In Supabase SQL Editor, run:
# lib/supabase/migrations/002_add_stripe_fields.sql
```

This adds:
- `stripe_customer_id`
- `stripe_subscription_id`
- `payment_failure_count`
- `subscription_plan_type`
- `stripe_event_logs` table

## Local Testing with Stripe CLI

### 1. Login to Stripe CLI

```bash
stripe login
```

### 2. Forward Webhooks to Local Server

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret like: `whsec_...`

Add this to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Trigger Test Events

#### Test Successful Checkout

```bash
stripe trigger checkout.session.completed
```

**Expected Result:**
- User subscription_status → 'active'
- trial_ends_at → null
- stripe_customer_id and stripe_subscription_id populated
- Payment success email sent (logged to console)

#### Test Subscription Cancellation

```bash
stripe trigger customer.subscription.deleted
```

**Expected Result:**
- User subscription_status → 'cancelled'
- stripe_subscription_id → null
- All user endpoints disabled (is_active → false)
- Cancellation email sent

#### Test Payment Failure

```bash
stripe trigger invoice.payment_failed
```

**Expected Result:**
- payment_failure_count incremented
- last_payment_failure_at updated
- Payment failure email sent with attempt number

#### Test Payment Success (After Failure)

```bash
stripe trigger invoice.payment_succeeded
```

**Expected Result:**
- payment_failure_count reset to 0
- last_payment_failure_at cleared

#### Test Subscription Update

```bash
stripe trigger customer.subscription.updated
```

**Expected Result:**
- subscription_status updated based on Stripe status
- subscription_period_end updated
- Update email sent if plan changed

## Manual Testing with Stripe Dashboard

### 1. Create Test Subscription

1. Go to Stripe Dashboard → Payments → Create payment
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Webhook should fire `checkout.session.completed`

### 2. Cancel Subscription

1. Go to Subscriptions → Select subscription → Cancel
2. Webhook should fire `customer.subscription.deleted`

### 3. Simulate Payment Failure

1. Go to Subscriptions → Select subscription
2. Update payment method to failing card: `4000 0000 0000 0341`
3. Wait for next billing cycle or manually create invoice
4. Webhook should fire `invoice.payment_failed`

## Monitoring Webhook Events

### Check Logs in Database

```sql
-- View all processed events
SELECT
  event_type,
  status,
  customer_id,
  error_message,
  processed_at
FROM stripe_event_logs
ORDER BY processed_at DESC
LIMIT 20;

-- Check user subscription status
SELECT
  clerk_user_id,
  email,
  subscription_status,
  stripe_customer_id,
  payment_failure_count,
  subscription_plan_type
FROM users
WHERE subscription_status != 'trial';
```

### Check Stripe Dashboard

1. Go to Developers → Webhooks → Select endpoint
2. View event logs and responses
3. Check for failed events

## Production Setup

### 1. Create Webhook Endpoint in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`

### 2. Update Production Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # From webhook endpoint
STRIPE_MONTHLY_PRICE_ID=price_... # Live price ID
STRIPE_ANNUAL_PRICE_ID=price_... # Live price ID
```

### 3. Test Production Webhooks

Use Stripe Dashboard's "Send test webhook" feature to verify:
1. Webhook endpoint is reachable
2. Signature verification works
3. Events are processed correctly

## Common Issues

### Issue: Signature Verification Failed

**Cause:** Wrong webhook secret or body parsing issue

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches webhook endpoint
2. Ensure raw body is used (no JSON parsing before verification)
3. Check Stripe CLI is forwarding to correct port

### Issue: User Not Found

**Cause:** Missing `clerk_user_id` in checkout metadata

**Solution:**
Ensure checkout session includes metadata:
```typescript
metadata: {
  clerk_user_id: user.id,
  plan_type: 'monthly' // or 'annual'
}
```

### Issue: Duplicate Events

**Cause:** Stripe retries failed webhooks

**Solution:**
- Handler implements idempotency check
- Events are logged with unique `stripe_event_id`
- Duplicates return early with `duplicate: true`

### Issue: Payment Failure Not Incrementing

**Cause:** Multiple `invoice.payment_failed` events for same invoice

**Solution:**
- Counter increments on each event
- Check if same invoice is firing multiple events
- Consider debouncing based on `invoice.id`

## Testing Checklist

- [ ] Checkout completed activates subscription
- [ ] Subscription cancellation disables endpoints
- [ ] Payment failure increments counter
- [ ] 3rd payment failure sends final warning
- [ ] Payment success resets failure counter
- [ ] Subscription update changes plan type
- [ ] All events logged to database
- [ ] Email notifications sent (check console in dev)
- [ ] Duplicate events handled gracefully
- [ ] Invalid signatures rejected

## Email Notification Testing

Currently, emails are logged to console. To test with real emails:

1. Integrate email service (Resend recommended)
2. Update `lib/email/notifications.ts`
3. Add `RESEND_API_KEY` to environment variables
4. Uncomment production email sending code

Example Resend integration:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'CalRouter <noreply@calrouter.app>',
  to: payload.to,
  subject: payload.subject,
  text: payload.body,
});
```

## Troubleshooting Commands

```bash
# Check Stripe CLI version
stripe --version

# View webhook signing secret
stripe listen --print-secret

# View recent events
stripe events list --limit 10

# Resend a specific event
stripe events resend evt_...

# Test connection to webhook endpoint
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Security Best Practices

1. **Never expose webhook secret**: Keep in environment variables only
2. **Always verify signatures**: Never skip signature verification in production
3. **Return 200 OK always**: Prevents Stripe retry loops
4. **Log all events**: Maintain audit trail in `stripe_event_logs`
5. **Implement idempotency**: Prevent duplicate processing
6. **Use service role key carefully**: Only in webhook handler, never client-side
7. **Rate limit if needed**: Consider rate limiting webhook endpoint (though Stripe is trusted)

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Event Types](https://stripe.com/docs/api/events/types)
