# Upstash Redis Setup Guide for CalRouter

## Why Upstash?

CalRouter uses **Upstash Redis** for rate limiting webhook requests. This prevents abuse and ensures fair usage across all endpoints.

**Rate Limit:** 100 requests per minute per endpoint

## What You'll Need

- Upstash account (free tier available)
- 5 minutes of setup time

---

## Step 1: Create Upstash Account

1. Go to [https://upstash.com/](https://upstash.com/)
2. Click **"Sign Up"** in the top right
3. Sign up with:
   - GitHub (recommended - one click)
   - Email
   - Google

**Free Tier Includes:**
- 10,000 commands per day
- Max 256 MB storage
- Multiple databases
- More than enough for CalRouter!

---

## Step 2: Create a Redis Database

1. After logging in, click **"Create Database"** on the dashboard
2. Configure your database:

   **Name:** `calrouter-ratelimit`

   **Type:** Select **"Regional"** (faster, cheaper)

   **Region:** Choose closest to your Vercel deployment region:
   - US East (N. Virginia) → `us-east-1`
   - US West (Oregon) → `us-west-1`
   - Europe (Ireland) → `eu-west-1`
   - Asia Pacific (Tokyo) → `ap-northeast-1`

   **Primary Region:** Select your chosen region

   **Read Regions:** Leave empty for now (not needed for rate limiting)

   **Eviction:** Choose **"No eviction"** (we want to keep rate limit data)

3. Click **"Create"**

---

## Step 3: Get Your Credentials

After creating the database, you'll see the database dashboard.

### Option A: REST API (Recommended)

Scroll to **"REST API"** section and copy:

1. **UPSTASH_REDIS_REST_URL**
   ```
   https://your-db-name-12345.upstash.io
   ```

2. **UPSTASH_REDIS_REST_TOKEN**
   ```
   AXkasdASDASDKJaslkdj...
   ```

### Option B: Redis URL (Alternative)

If you prefer the standard Redis protocol:

1. **UPSTASH_REDIS_URL**
   ```
   rediss://:your-password@your-db.upstash.io:6379
   ```

**Note:** CalRouter uses the REST API by default (better for serverless).

---

## Step 4: Add to Your Environment Variables

### Local Development (.env.local)

Create or update `.env.local` in your project root:

```bash
# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-db-name-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXkasdASDASDKJaslkdjALKSDJlkasjd...
```

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add both variables:

   **Variable 1:**
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: `https://your-db-name-12345.upstash.io`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `UPSTASH_REDIS_REST_TOKEN`
   - Value: `AXkasdASDASDKJaslkdjALKSDJlkasjd...`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

4. Click **"Save"**
5. **Redeploy** your application for changes to take effect

---

## Step 5: Verify Setup

### Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Create a test endpoint in your CalRouter dashboard

3. Send a test webhook:
   ```bash
   curl -X POST http://localhost:3000/api/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"endpoint_id": "your-endpoint-id"}'
   ```

4. Check your terminal logs - you should see rate limit info:
   ```
   Rate limit check: success
   Remaining requests: 99/100
   ```

### Test Rate Limiting

Send 101 requests rapidly to trigger rate limit:

```bash
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/webhook/calendly/your-endpoint-id \
    -H "Content-Type: application/json" \
    -d '{"event":"invitee.created","payload":{}}' &
done
```

The 101st request should return:
```json
{
  "ok": false,
  "error": "Rate limit exceeded",
  "limit": 100,
  "reset": 1674567890
}
```

---

## Understanding the Rate Limit Implementation

CalRouter uses **sliding window** rate limiting:

```typescript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'calrouter:ratelimit',
});
```

**What this means:**
- ✅ **100 requests per minute** per endpoint
- ✅ **Sliding window** - resets gradually, not all at once
- ✅ **Per endpoint** - each endpoint has its own limit
- ✅ **Analytics enabled** - track usage in Upstash dashboard

### Example Scenarios

**Scenario 1: Normal Usage**
- 50 webhooks in first 30 seconds → ✅ All accepted
- 50 webhooks in next 30 seconds → ✅ All accepted
- Total: 100 webhooks in 1 minute

**Scenario 2: Burst Traffic**
- 100 webhooks in 5 seconds → ✅ All accepted
- 1 more webhook 2 seconds later → ❌ Rate limited
- Wait 1 minute → ✅ Limit resets

**Scenario 3: Multiple Endpoints**
- Endpoint A: 100 webhooks/min → ✅ All accepted
- Endpoint B: 100 webhooks/min → ✅ All accepted
- Each endpoint has independent limits!

---

## Monitoring Rate Limits

### Upstash Dashboard

1. Go to your database in Upstash
2. Click **"Data Browser"** tab
3. Search for keys starting with `calrouter:ratelimit:`
4. You'll see entries like:
   ```
   calrouter:ratelimit:endpoint:abc-123-def
   ```

### CalRouter Logs

Check your webhook logs for rate limit events:

```typescript
console.log(`Rate limit exceeded for endpoint ${endpointId}`);
```

These appear in:
- Local: Terminal output
- Production: Vercel logs (Runtime Logs section)

---

## Troubleshooting

### Error: "Redis client not initialized"

**Problem:** Environment variables not set correctly

**Solution:**
1. Verify `.env.local` exists and has both variables
2. Restart your dev server after adding variables
3. Check for typos in variable names (must be exact)

### Error: "Connection timeout"

**Problem:** Wrong Redis URL or network issue

**Solution:**
1. Verify URL in Upstash dashboard matches `.env.local`
2. Check if URL starts with `https://` (not `http://`)
3. Try creating a new database if issue persists

### Error: "Invalid token"

**Problem:** Token expired or incorrect

**Solution:**
1. Go to Upstash database dashboard
2. Click **"Details"** tab
3. Click **"Show"** next to REST Token
4. Copy fresh token to `.env.local`
5. Restart server

### Rate Limits Not Working

**Symptoms:** Can send unlimited requests

**Possible Causes:**
1. Environment variables not loaded
2. Using wrong endpoint URL
3. Different endpoint IDs (each has separate limit)

**Debug Steps:**
```typescript
// Add to route.ts temporarily
console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing');
console.log('Redis Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing');
console.log('Rate limit result:', rateLimitResult);
```

---

## Cost & Scaling

### Free Tier Limits

- **10,000 commands/day** = ~7 commands per minute 24/7
- Each rate limit check = 2-3 commands (read + write)
- Supports: **~3,000 webhook requests per day**

### When to Upgrade

If you hit these limits:
- Multiple endpoints (20+)
- High-traffic users (1,000+ bookings/day)
- 24/7 production usage

**Paid Tier ($10/month):**
- 100,000 commands/day
- Supports: **~30,000 webhook requests per day**

### Optimize Command Usage

Current implementation is already optimized:
- Uses sliding window (fewer Redis calls than fixed window)
- Analytics batched (reduces writes)
- Single rate limit per request (not multiple checks)

---

## Advanced Configuration

### Adjust Rate Limits

Edit `/app/api/webhook/calendly/[endpointId]/route.ts`:

```typescript
// Default: 100 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'calrouter:ratelimit',
});

// Custom examples:
// 50 per minute: Ratelimit.slidingWindow(50, '1 m')
// 200 per hour: Ratelimit.slidingWindow(200, '1 h')
// 1000 per day: Ratelimit.slidingWindow(1000, '1 d')
```

### Per-User Rate Limits

To add different limits for different subscription tiers:

```typescript
// Determine limit based on user subscription
const limit = user.subscription_status === 'pro' ? 500 : 100;

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(limit, '1 m'),
  analytics: true,
  prefix: `calrouter:ratelimit:${user.subscription_status}`,
});
```

### Multiple Rate Limit Windows

Implement both per-minute AND per-day limits:

```typescript
// Per-minute limit
const minuteLimit = await ratelimitMinute.limit(`endpoint:${endpointId}`);
if (!minuteLimit.success) {
  return NextResponse.json({ error: 'Too many requests per minute' }, { status: 429 });
}

// Per-day limit
const dayLimit = await ratelimitDay.limit(`endpoint:${endpointId}`);
if (!dayLimit.success) {
  return NextResponse.json({ error: 'Daily quota exceeded' }, { status: 429 });
}
```

---

## Security Best Practices

### ✅ DO

- Keep REST token secret (never commit to git)
- Use environment variables for all credentials
- Enable analytics to monitor usage
- Set up alerts in Upstash for high usage

### ❌ DON'T

- Share tokens publicly
- Hardcode credentials in source code
- Use same database for multiple apps
- Disable rate limiting in production

---

## Alternative: No Upstash Setup

If you want to skip Upstash temporarily (NOT recommended for production):

### Option 1: In-Memory Rate Limiting

```typescript
// Simple in-memory rate limiter (loses state on restart)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(endpointId: string): boolean {
  const now = Date.now();
  const key = `endpoint:${endpointId}`;
  const limit = requestCounts.get(key);

  if (!limit || now > limit.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (limit.count >= 100) {
    return false;
  }

  limit.count++;
  return true;
}
```

**Limitations:**
- Resets on every deployment
- Doesn't work with multiple serverless instances
- No persistence across requests

### Option 2: Disable Rate Limiting

```typescript
// Comment out rate limit check (NOT RECOMMENDED)
/*
const rateLimitResult = await ratelimit.limit(`endpoint:${endpointId}`);
if (!rateLimitResult.success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
*/
```

**⚠️ Warning:** Only do this for local testing. Production MUST have rate limiting!

---

## Support

### Upstash Support

- Documentation: [https://docs.upstash.com/redis](https://docs.upstash.com/redis)
- Discord: [https://discord.gg/upstash](https://discord.gg/upstash)
- Email: support@upstash.com

### CalRouter Issues

If you're still having trouble:
1. Check CalRouter GitHub issues
2. Verify all environment variables are set
3. Test with Upstash REST API directly (use Postman)
4. Enable verbose logging in route.ts

---

## Checklist

Before going to production, verify:

- [ ] Upstash account created
- [ ] Redis database created in correct region
- [ ] Environment variables set in Vercel
- [ ] Tested rate limiting locally
- [ ] Tested rate limiting in production
- [ ] Monitoring setup in Upstash dashboard
- [ ] Alerts configured for high usage
- [ ] Backup plan if Upstash goes down

---

## Next Steps

✅ Upstash is set up!

Now you can:
1. Create webhook endpoints in CalRouter dashboard
2. Add webhook URLs to Calendly
3. Start receiving enriched webhook data
4. Monitor rate limits in Upstash dashboard

**Happy automating! 🚀**
