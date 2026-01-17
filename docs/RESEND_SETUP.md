# Resend Email Setup Guide

This guide shows you how to set up Resend for sending transactional emails (payment notifications, subscription updates, etc.).

## Why Resend?

- ✅ Simple API and great DX
- ✅ 3,000 free emails per month
- ✅ Built for developers
- ✅ Fast delivery
- ✅ Great documentation

## Setup Steps

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 2. Get API Key

1. Go to [Resend Dashboard → API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it: "CalRouter Production" (or "CalRouter Development")
4. Select permission: "Sending access"
5. Copy the API key (starts with `re_`)

### 3. Add to Environment Variables

#### Local Development (.env.local):
```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=CalRouter <noreply@calrouter.app>
ENABLE_EMAILS=true
```

#### Production (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `RESEND_API_KEY` = `re_xxxxx`
   - `RESEND_FROM_EMAIL` = `CalRouter <noreply@calrouter.app>`
   - `ENABLE_EMAILS` = `true`
3. Redeploy your app

### 4. Verify Domain (Production Only)

For production emails to work properly:

1. Go to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `calrouter.app`)
4. Add DNS records to your domain registrar:
   - **TXT record** for domain verification
   - **DKIM records** for email authentication
   - **CNAME records** for tracking

Example DNS records:
```
Type: TXT
Name: @
Value: resend-verification=abc123...

Type: TXT
Name: _resend._domainkey
Value: k=rsa; p=MIGfMA0GCS...

Type: MX
Name: @
Value: feedback-smtp.resend.com (Priority: 10)
```

5. Wait for verification (usually 1-5 minutes)
6. Update `RESEND_FROM_EMAIL` to use your domain:
   ```env
   RESEND_FROM_EMAIL=CalRouter <noreply@calrouter.app>
   ```

### 5. Test Email Sending

#### Test Locally:

1. Start your dev server: `npm run dev`
2. Trigger a test payment event with Stripe CLI
3. Check console for email logs

**Without Resend configured:**
```
📧 [Dev Mode] Email:
  to: user@example.com
  subject: Payment Failed - Action Required

📝 Body: [email content]
```

**With Resend configured:**
```
✅ Email sent successfully:
  to: user@example.com
  subject: Payment Failed - Action Required
  emailId: re_abc123xyz
```

#### Test in Production:

1. Go to Stripe Dashboard → Webhooks
2. Send test webhook event
3. Check Resend Dashboard → Logs to see email delivery

## Email Types Sent by CalRouter

### 1. Payment Failed
**Trigger:** `invoice.payment_failed` webhook
**Recipients:** Users with failed payments
**Content:** Warning with retry attempt count (1/3, 2/3, 3/3)

### 2. Subscription Cancelled
**Trigger:** `customer.subscription.deleted` webhook
**Recipients:** Users whose subscription ended
**Content:** Cancellation notice with reason (user cancelled vs. payment failed)

### 3. Subscription Updated
**Trigger:** `customer.subscription.updated` webhook
**Recipients:** Users who changed plans
**Content:** Notification of plan change (monthly ↔ annual)

### 4. Payment Succeeded
**Trigger:** `checkout.session.completed` webhook
**Recipients:** New subscribers
**Content:** Welcome message with feature overview

## Development Mode

If `RESEND_API_KEY` is not set, emails will be logged to console instead:

```typescript
// lib/email/notifications.ts will automatically:
if (!resend) {
  console.log('📧 [Dev Mode] Email:', {...});
  return; // No actual email sent
}
```

This is perfect for local development and testing!

## Email Deliverability Best Practices

### 1. Use Verified Domain
- Emails from verified domains have higher deliverability
- Avoid using `@gmail.com` or `@outlook.com` in production

### 2. Set Up SPF/DKIM/DMARC
- Resend provides these automatically when you verify your domain
- Prevents emails from going to spam

### 3. Monitor Bounce Rate
- Check Resend Dashboard → Logs for bounced emails
- Remove invalid email addresses from your system

### 4. Avoid Spam Triggers
- Don't use ALL CAPS in subject lines
- Avoid excessive exclamation marks
- Include unsubscribe link for marketing emails (not needed for transactional)

## Troubleshooting

### Issue: Emails not sending

**Check:**
1. Is `RESEND_API_KEY` set correctly?
   ```bash
   echo $RESEND_API_KEY  # Should start with re_
   ```

2. Is `ENABLE_EMAILS=true`?

3. Check Resend Dashboard → Logs for errors

### Issue: Emails going to spam

**Solutions:**
1. Verify your domain in Resend
2. Add all DNS records (SPF, DKIM, DMARC)
3. Wait 24-48 hours for DNS propagation
4. Avoid spam trigger words in content

### Issue: "Domain not verified" error

**Solution:**
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Use Resend's verification tool to check status

### Issue: Rate limit exceeded

**Free tier limits:**
- 3,000 emails/month
- 100 emails/day

**Solutions:**
- Upgrade to paid plan if needed
- Monitor usage in Resend Dashboard

## Testing Checklist

- [ ] Resend account created
- [ ] API key generated and added to `.env.local`
- [ ] Test payment failure email sends
- [ ] Test subscription cancelled email sends
- [ ] Test welcome email sends
- [ ] Domain verified (production only)
- [ ] DNS records added (production only)
- [ ] Emails not going to spam

## Cost Estimates

### Free Tier:
- 3,000 emails/month = **$0**
- Perfect for starting out

### Paid Plans:
- **$20/month**: 50,000 emails
- **$80/month**: 250,000 emails
- **$240/month**: 1,000,000 emails

For most SaaS apps, free tier is enough to start!

## Alternative: Console Logging Only

If you don't want to set up email yet:

```env
# Don't set RESEND_API_KEY
# Or set ENABLE_EMAILS=false
ENABLE_EMAILS=false
```

Emails will be logged to console instead. Great for development!

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/introduction)
- [Resend React Email](https://react.email) - For HTML email templates
- [Resend Status Page](https://status.resend.com)

## Next Steps

After email is working:

1. **Add HTML templates** - Use [React Email](https://react.email) for beautiful emails
2. **Add email preferences** - Let users opt out of non-critical emails
3. **Monitor deliverability** - Check bounce/complaint rates
4. **Set up webhooks** - Get notified of bounces/complaints from Resend
