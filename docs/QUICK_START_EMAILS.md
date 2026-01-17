# Email Notifications - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Create API key in dashboard
4. Copy the key (starts with `re_`)

### Step 2: Configure Resend Domain
1. Add your domain in Resend dashboard
2. Add DNS records (or use Resend's domain)
3. Verify domain
4. Set sender email (e.g., `noreply@calrouter.app`)

### Step 3: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=CalRouter <noreply@calrouter.app>
ENABLE_EMAILS=true
CRON_SECRET=your_random_secret_here
```

Generate random secret:
```bash
openssl rand -hex 32
```

### Step 4: Run Database Migration
In Supabase SQL Editor, run:
```sql
-- File: lib/supabase/migrations/add_failure_notification_field.sql
ALTER TABLE webhook_endpoints
ADD COLUMN IF NOT EXISTS failure_notification_sent_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_endpoints_failure_notification
ON webhook_endpoints(failure_notification_sent_at)
WHERE is_active = true AND deleted_at IS NULL;
```

### Step 5: Deploy to Vercel
```bash
git add .
git commit -m "Add email notification system"
git push
```

Vercel will automatically:
- Deploy your code
- Set up cron jobs (from `vercel.json`)
- Use environment variables

### Step 6: Test Cron Jobs
Wait 5 minutes after deployment, then:

```bash
# Get your deployed URL
VERCEL_URL="https://your-app.vercel.app"
CRON_SECRET="your_secret_here"

# Test trial check cron
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$VERCEL_URL/api/cron/check-trials"

# Test webhook failure cron
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$VERCEL_URL/api/cron/check-webhook-failures"
```

Expected response:
```json
{
  "success": true,
  "message": "Trial check completed",
  "summary": {
    "checked": 0,
    "notified": 0,
    "skipped": 0
  }
}
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Cron jobs appear in Vercel dashboard (Functions → Cron)
- [ ] Manual cron test returns 200 OK
- [ ] Resend dashboard shows domain verified
- [ ] Environment variables set correctly
- [ ] Database migration ran successfully

---

## 🧪 Test Email Sending

Create a test API route to send yourself an email:

```typescript
// app/api/test-email/route.ts
import { sendWelcomeEmail } from '@/lib/email/notifications';

export async function GET() {
  await sendWelcomeEmail('your-email@example.com', 'Test User');
  return Response.json({ success: true });
}
```

Visit: `https://your-app.vercel.app/api/test-email`

Check:
- Email arrives in inbox (or spam folder)
- HTML formatting looks good
- Links work correctly

---

## 🐛 Troubleshooting

### Emails not sending?

**Check 1: Is RESEND_API_KEY set?**
```bash
# In Vercel dashboard, verify environment variable exists
# Should start with "re_"
```

**Check 2: Is domain verified in Resend?**
- Login to Resend dashboard
- Go to Domains
- Check for green checkmark

**Check 3: Check Resend logs**
- Go to Resend dashboard → Emails
- Look for failed sends
- Check error messages

**Check 4: Check Vercel function logs**
```bash
# In Vercel dashboard → Functions
# Look for cron job executions
# Check for error logs
```

**Check 5: Is ENABLE_EMAILS=false?**
```bash
# If set to false, emails won't send
# Should be "true" or unset
```

### Cron jobs not running?

**Check 1: Is vercel.json deployed?**
```bash
git status
# Make sure vercel.json is committed
```

**Check 2: Check Vercel dashboard**
- Go to Functions → Cron
- Should see both cron jobs listed
- Check last execution time

**Check 3: Is CRON_SECRET set?**
```bash
# Must be set in Vercel environment variables
```

**Check 4: Manual test**
```bash
# Try manual curl to see specific error
curl -v -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app.vercel.app/api/cron/check-trials
```

### Getting 401 Unauthorized?

Check:
1. `CRON_SECRET` matches in Vercel env and your curl command
2. Header format: `Authorization: Bearer {secret}`
3. No extra spaces in secret

### Emails going to spam?

**Fix:**
1. Verify domain in Resend (adds SPF/DKIM records)
2. Use a custom domain (not @gmail.com)
3. Add email to safe senders list
4. Check Resend domain reputation

**Test spam score:**
- Send email to [mail-tester.com](https://www.mail-tester.com)
- Get spam score
- Follow recommendations

---

## 📊 Monitoring

### Daily Checks (First Week)

1. **Resend Dashboard**
   - Check delivery rate (should be >95%)
   - Check bounce rate (should be <5%)
   - Look for spam complaints

2. **Vercel Cron Logs**
   - Check both crons ran successfully
   - Look for errors or warnings

3. **Database**
   ```sql
   -- Check trial reminders sent
   SELECT COUNT(*) FROM users
   WHERE trial_reminder_sent_at IS NOT NULL;

   -- Check webhook failure notifications
   SELECT COUNT(*) FROM webhook_endpoints
   WHERE failure_notification_sent_at IS NOT NULL;
   ```

### Weekly Checks (After First Week)

1. Email delivery trends
2. User feedback on email frequency
3. Cron job execution time (should be <5s)

---

## 🎯 Success Metrics

After 30 days, you should see:

- **Delivery Rate**: 95%+ (Resend dashboard)
- **Bounce Rate**: <5% (Resend dashboard)
- **Cron Success Rate**: 100% (Vercel logs)
- **Trial Conversion**: Track via Stripe
- **Webhook Recovery**: Track in webhook_logs table

---

## 🔄 Updating Email Templates

To change email content:

1. Edit `lib/email/templates.ts` (for HTML)
2. Edit `lib/email/notifications.ts` (for plain text)
3. Test locally first (emails will log to console)
4. Deploy changes
5. Send test email to yourself

---

## 💰 Resend Pricing

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for <100 users

**Growth Plan ($20/month):**
- 50,000 emails/month
- 1,000 emails/day
- Recommended for 100-500 users

**Pro Plan ($80/month):**
- 100,000 emails/month
- Unlimited daily
- For 500+ users

**Estimate your needs:**
- Trial reminder: 1 email per user (3 days before)
- Trial expired: 1 email per user
- Webhook failures: ~0.1 emails per user per month
- Payment emails: ~1 email per user per month

**Example:** 100 users = ~230 emails/month (well within free tier)

---

## 🆘 Support

If stuck:

1. Check [Email Notifications Guide](./EMAIL_NOTIFICATIONS.md) for details
2. Check Resend docs: [resend.com/docs](https://resend.com/docs)
3. Check Vercel cron docs: [vercel.com/docs/cron-jobs](https://vercel.com/docs/cron-jobs)
4. Open GitHub issue with error logs

---

**That's it! Your email notification system is ready to go.** 🎉
