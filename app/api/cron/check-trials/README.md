# Trial Expiry Cron Job

This cron job automatically manages trial expirations and sends notifications to users.

## Overview

The trial expiry cron runs daily at **2:00 AM UTC** and performs the following tasks:

1. **Expired Trials**: Finds users whose trials have expired and:
   - Updates their subscription status to `expired`
   - Disables all their webhook endpoints
   - Sends a trial expiry email notification

2. **Expiring Trials**: Finds users whose trials expire in 3 days and:
   - Sends a reminder email notification

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Required: Secret to authenticate cron requests
CRON_SECRET=your_random_secret_here

# Required for email notifications
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=CalRouter <noreply@calrouter.app>
ENABLE_EMAILS=true
```

Generate a secure random secret:
```bash
openssl rand -base64 32
```

### 2. Vercel Configuration

The cron schedule is configured in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/check-trials",
    "schedule": "0 2 * * *"
  }]
}
```

**Schedule format**: Cron expression (minute hour day month dayOfWeek)
- `0 2 * * *` = Every day at 2:00 AM UTC

### 3. Vercel Dashboard Setup

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `CRON_SECRET` with your generated secret
4. Deploy your project

### 4. Security

The cron endpoint is protected by:
- Authorization header validation
- Bearer token authentication
- Only accepts requests with valid `CRON_SECRET`

Example authorized request:
```bash
curl -X GET https://your-app.vercel.app/api/cron/check-trials \
  -H "Authorization: Bearer your_cron_secret_here"
```

## Testing Locally

### Manual Testing

Test the cron job locally:

```bash
curl -X GET http://localhost:3000/api/cron/check-trials \
  -H "Authorization: Bearer your_local_cron_secret"
```

### Test with Different Scenarios

1. **Create test users with expired trials**:
   - Set `trial_ends_at` to yesterday
   - Run the cron job
   - Verify status changes to `expired`
   - Verify endpoints are disabled
   - Check email logs

2. **Create test users with expiring trials**:
   - Set `trial_ends_at` to 3 days from now
   - Run the cron job
   - Verify reminder email is sent

## Monitoring

### Success Response

```json
{
  "success": true,
  "message": "Trial check completed successfully",
  "summary": {
    "timestamp": "2024-01-15T02:00:00.000Z",
    "expired": {
      "total": 5,
      "processed": 5,
      "failed": 0
    },
    "expiring": {
      "total": 3,
      "notified": 3,
      "failed": 0
    }
  }
}
```

### Error Response

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing CRON_SECRET"
}
```

### Logs

The cron job logs detailed information:

- `🔄 Starting trial check cron job...`
- `Found X expired trials`
- `Found X trials expiring soon`
- `✅ Processed expired trial for user {id}`
- `✅ Sent trial ending reminder to user {id}`
- `✅ Trial check cron job completed`

Check logs in Vercel Dashboard → **Deployments** → **Function Logs**

## Database Changes

### Users Table

When trial expires:
```sql
UPDATE users
SET subscription_status = 'expired',
    updated_at = NOW()
WHERE subscription_status = 'trial'
  AND trial_ends_at < NOW();
```

### Webhook Endpoints Table

When trial expires:
```sql
UPDATE webhook_endpoints
SET is_active = false
WHERE user_id IN (
  SELECT id FROM users WHERE subscription_status = 'expired'
);
```

## Email Notifications

### Trial Expired Email

Sent when trial expires:
- Subject: "Your CalRouter Trial Has Expired"
- Includes upgrade link
- Lists benefits of upgrading
- Data retention policy (30 days)

### Trial Ending Email

Sent 3 days before expiry:
- Subject: "Your CalRouter Trial Ends in 3 Days"
- Includes upgrade link
- Highlights features at risk
- Call to action to upgrade

## Troubleshooting

### Cron Not Running

1. Check Vercel Dashboard → **Settings** → **Cron Jobs**
2. Verify deployment is successful
3. Check `vercel.json` syntax
4. Ensure project is on a paid Vercel plan (crons require Pro/Enterprise)

### Email Not Sending

1. Verify `RESEND_API_KEY` is set correctly
2. Check `ENABLE_EMAILS=true`
3. Verify domain is verified in Resend dashboard
4. Check function logs for email errors

### Unauthorized Errors

1. Verify `CRON_SECRET` matches in:
   - Environment variables
   - Your test requests
2. Check Authorization header format: `Bearer {secret}`

### Database Errors

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Check database connection
3. Verify table schemas match expected structure

## Best Practices

1. **Monitor regularly**: Check logs daily for first week
2. **Test thoroughly**: Use test data before going live
3. **Backup emails**: Keep logs of all sent emails
4. **Grace period**: Consider adding 1-day grace period
5. **Support**: Have support team ready for user questions

## Customization

### Change Schedule

Edit `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/check-trials",
    "schedule": "0 8 * * *"  // 8 AM UTC instead of 2 AM
  }]
}
```

### Change Warning Days

Edit the cron route file:

```typescript
// Change from 3 days to 7 days
const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
```

### Add Grace Period

```typescript
// Add 1-day grace period
const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

const { data: expiredUsers } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('subscription_status', 'trial')
  .lt('trial_ends_at', oneDayAgo.toISOString());
```

## Related Files

- Email templates: `/lib/email/notifications.ts`
- User database functions: `/lib/supabase/client.ts`
- Vercel config: `/vercel.json`
- Environment variables: `.env.example`
