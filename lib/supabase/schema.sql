-- CalRouter Database Schema
-- Run this in your Supabase SQL Editor

-- ======================
-- 1. USERS TABLE
-- ======================
-- Stores user information synced from Clerk
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP DEFAULT now()
);

-- Index for fast lookups by Clerk user ID
CREATE INDEX idx_users_clerk ON users(clerk_user_id);

-- Index for filtering by subscription status
CREATE INDEX idx_users_subscription ON users(subscription_status);


-- ======================
-- 2. WEBHOOK ENDPOINTS TABLE
-- ======================
-- Stores user-configured webhook endpoints
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  enable_reschedule_detection BOOLEAN DEFAULT true,
  enable_utm_tracking BOOLEAN DEFAULT true,
  enable_question_parsing BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Index for user's endpoints
CREATE INDEX idx_endpoints_user ON webhook_endpoints(user_id);

-- Index for active endpoints (used in webhook processing)
CREATE INDEX idx_endpoints_active ON webhook_endpoints(is_active);

-- Combined index for common query pattern
CREATE INDEX idx_endpoints_user_active ON webhook_endpoints(user_id, is_active);


-- ======================
-- 3. WEBHOOK LOGS TABLE
-- ======================
-- Stores all webhook processing logs and results
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  calendly_event_uuid TEXT NOT NULL,
  invitee_email TEXT,
  event_type TEXT NOT NULL,
  original_payload JSONB NOT NULL,
  enriched_payload JSONB,
  is_reschedule BOOLEAN DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL,
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Index for endpoint logs lookup
CREATE INDEX idx_logs_endpoint ON webhook_logs(endpoint_id);

-- Index for duplicate detection and reschedule detection
CREATE INDEX idx_logs_calendly_event ON webhook_logs(calendly_event_uuid);

-- Index for time-based queries (analytics, recent logs)
CREATE INDEX idx_logs_created ON webhook_logs(created_at DESC);

-- Index for email-based reschedule detection
CREATE INDEX idx_logs_email ON webhook_logs(invitee_email);

-- Index for filtering by status (success/failed)
CREATE INDEX idx_logs_status ON webhook_logs(status);

-- Combined index for reschedule detection query
CREATE INDEX idx_logs_reschedule_detection ON webhook_logs(invitee_email, event_type, created_at DESC);


-- ======================
-- 4. ROW LEVEL SECURITY (RLS)
-- ======================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can manage their own endpoints
CREATE POLICY "Users can view own endpoints" ON webhook_endpoints
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert own endpoints" ON webhook_endpoints
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update own endpoints" ON webhook_endpoints
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete own endpoints" ON webhook_endpoints
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Users can view logs for their endpoints
CREATE POLICY "Users can view own logs" ON webhook_logs
  FOR SELECT USING (
    endpoint_id IN (
      SELECT we.id FROM webhook_endpoints we
      INNER JOIN users u ON we.user_id = u.id
      WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Service role can insert logs (for webhook processing)
CREATE POLICY "Service can insert logs" ON webhook_logs
  FOR INSERT WITH CHECK (true);


-- ======================
-- 5. HELPER FUNCTIONS
-- ======================
-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_endpoints BIGINT,
  total_webhooks BIGINT,
  total_reschedules BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM webhook_endpoints WHERE user_id = p_user_id AND is_active = true) as total_endpoints,
    (SELECT COUNT(*) FROM webhook_logs wl
     INNER JOIN webhook_endpoints we ON wl.endpoint_id = we.id
     WHERE we.user_id = p_user_id
     AND wl.created_at > now() - interval '30 days') as total_webhooks,
    (SELECT COUNT(*) FROM webhook_logs wl
     INNER JOIN webhook_endpoints we ON wl.endpoint_id = we.id
     WHERE we.user_id = p_user_id
     AND wl.is_reschedule = true
     AND wl.created_at > now() - interval '30 days') as total_reschedules,
    (SELECT CASE
       WHEN COUNT(*) = 0 THEN 100
       ELSE ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*) * 100), 2)
     END
     FROM webhook_logs wl
     INNER JOIN webhook_endpoints we ON wl.endpoint_id = we.id
     WHERE we.user_id = p_user_id
     AND wl.created_at > now() - interval '30 days') as success_rate;
END;
$$ LANGUAGE plpgsql;


-- ======================
-- 6. SAMPLE DATA (for testing)
-- ======================
-- Uncomment to insert sample data

-- INSERT INTO users (clerk_user_id, email, subscription_status)
-- VALUES ('user_test123', 'test@example.com', 'trial');

-- INSERT INTO webhook_endpoints (user_id, name, destination_url)
-- VALUES (
--   (SELECT id FROM users WHERE clerk_user_id = 'user_test123'),
--   'Test Endpoint',
--   'https://webhook.site/unique-id'
-- );
