# Supabase Database Setup

This guide will help you set up the Supabase PostgreSQL database for CalRouter.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Choose your organization
4. Set project details:
   - **Name**: CalRouter
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
5. Wait for project to be created (~2 minutes)

## 2. Get Your API Keys

From your Supabase project dashboard:

1. Go to **Settings** → **API** in the sidebar
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys") - Click "Reveal" first

## 3. Add Environment Variables

Add these to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Important**:
- The `service_role` key bypasses Row Level Security - keep it secret!
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Only `NEXT_PUBLIC_*` variables are exposed to the browser

## 4. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `lib/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

You should see: `Success. No rows returned`

## 5. Verify Tables Were Created

1. Go to **Table Editor** in the sidebar
2. You should see 3 tables:
   - `users`
   - `webhook_endpoints`
   - `webhook_logs`

Click on each table to verify the columns match the schema.

## 6. Configure Row Level Security (RLS)

RLS is automatically enabled by the schema. Verify it's working:

1. Go to **Authentication** → **Policies**
2. You should see policies for:
   - `users` (view/update own data)
   - `webhook_endpoints` (full CRUD for own endpoints)
   - `webhook_logs` (view own logs, service insert)

## 7. Test the Connection

I've created a comprehensive test suite for you!

### Option 1: Visual Test Page (Recommended)

1. Start your dev server: `npm run dev`
2. Visit: `http://localhost:3000/dashboard/test-supabase`
3. The page will automatically run all tests and show results

### Option 2: API Test

```bash
# Via curl
curl http://localhost:3000/api/test/supabase

# Or visit in browser
http://localhost:3000/api/test/supabase
```

The test verifies:
- ✅ Environment variables are set
- ✅ Client connection works
- ✅ Admin connection works
- ✅ All 3 tables exist
- ✅ Helper functions work

See [TESTING.md](TESTING.md) for detailed instructions and troubleshooting.

## What's Been Set Up

### Tables

✅ **users** - Stores user data synced from Clerk
- Links to Clerk via `clerk_user_id`
- Tracks subscription status and trial period
- One user = one Clerk account

✅ **webhook_endpoints** - User-configured webhook destinations
- Each user can have multiple endpoints
- Stores enrichment settings per endpoint
- Soft-delete via `is_active` flag

✅ **webhook_logs** - Complete audit trail of all webhooks
- Stores original and enriched payloads
- Tracks success/failure with error messages
- Optimized indexes for fast queries

### Indexes

All tables have optimized indexes for:
- User lookups (by Clerk ID)
- Endpoint queries (by user, by active status)
- Log filtering (by date, email, event type)
- Reschedule detection (email + event type + timestamp)

### Row Level Security (RLS)

- Users can only access their own data
- Service role can insert logs (for webhook processing)
- Protects against unauthorized access

### Helper Functions

✅ `get_user_stats(user_id)` - Returns aggregated stats:
- Total active endpoints
- Webhooks processed (last 30 days)
- Reschedules detected (last 30 days)
- Success rate percentage

## Client Usage

### In Client Components

```typescript
import { supabase } from '@/lib/supabase/client';

// Fetch user's endpoints
const { data, error } = await supabase
  .from('webhook_endpoints')
  .select('*')
  .eq('user_id', userId);
```

### In API Routes (with admin access)

```typescript
import { supabaseAdmin } from '@/lib/supabase/client';

// Bypass RLS for system operations
const { data, error } = await supabaseAdmin
  .from('webhook_logs')
  .insert({ ... });
```

### Helper Functions

```typescript
import {
  getOrCreateUser,
  getUserStats,
  getUserEndpoints
} from '@/lib/supabase/client';

// Get or create user
const { user, isNew } = await getOrCreateUser(clerkUserId, email);

// Get user stats for dashboard
const stats = await getUserStats(userId);

// Get user's endpoints
const endpoints = await getUserEndpoints(userId);
```

## Webhook Flow

1. **User signs up** → Clerk creates account
2. **Webhook received** → Check/create user in Supabase
3. **User creates endpoint** → Stored in `webhook_endpoints`
4. **Calendly webhook arrives** → Logged to `webhook_logs`
5. **Data enriched** → Both payloads stored
6. **User views dashboard** → Stats from `get_user_stats()`

## Maintenance

### View Recent Logs

```sql
SELECT
  wl.created_at,
  we.name as endpoint_name,
  wl.event_type,
  wl.status,
  wl.is_reschedule
FROM webhook_logs wl
JOIN webhook_endpoints we ON wl.endpoint_id = we.id
ORDER BY wl.created_at DESC
LIMIT 100;
```

### Check Trial Expiries

```sql
SELECT
  email,
  trial_ends_at,
  trial_ends_at - now() as time_remaining
FROM users
WHERE subscription_status = 'trial'
  AND trial_ends_at < now() + interval '3 days'
ORDER BY trial_ends_at;
```

### Clean Old Logs (optional)

```sql
-- Delete logs older than 90 days
DELETE FROM webhook_logs
WHERE created_at < now() - interval '90 days';
```

## Troubleshooting

**Issue**: "relation 'users' does not exist"
**Solution**: Run the schema.sql file in SQL Editor

**Issue**: "JWT expired" or "Invalid JWT"
**Solution**: This is expected - we're using Clerk for auth. Use service role key for server operations.

**Issue**: "new row violates row-level security policy"
**Solution**: Make sure you're using `supabaseAdmin` (service role) for inserting logs

**Issue**: Slow queries
**Solution**: All necessary indexes are created. Check query plans in SQL Editor.

## Security Best Practices

1. ✅ Never commit `.env.local` to git
2. ✅ Service role key only in server-side code
3. ✅ RLS enabled on all tables
4. ✅ Use prepared statements (Supabase does this automatically)
5. ✅ Validate all user input before database operations
6. ✅ Regular backups (Supabase does daily backups automatically)

## Next Steps

After Supabase setup:

1. ✅ Test database connection in your app
2. ✅ Create Clerk webhook to sync users
3. ✅ Build dashboard to display stats
4. ✅ Create endpoints management UI
5. ✅ Build webhook receiver API

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
