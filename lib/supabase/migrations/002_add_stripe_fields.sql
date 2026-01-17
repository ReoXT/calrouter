-- Migration: Add Stripe-related fields to users table
-- Run this after the initial schema setup

-- Add Stripe customer ID and payment failure tracking
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_failure_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_payment_failure_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS subscription_plan_type TEXT, -- 'monthly' or 'annual'
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Create index for fast Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Create index for subscription management queries
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription ON users(stripe_subscription_id);

-- ======================
-- STRIPE EVENT LOGS TABLE
-- ======================
-- Stores all Stripe webhook events for audit trail and debugging
CREATE TABLE IF NOT EXISTS stripe_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  invoice_id TEXT,
  payment_intent_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT NOT NULL, -- 'processed', 'failed', 'duplicate'
  error_message TEXT,
  raw_payload JSONB NOT NULL,
  processed_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Index for event deduplication
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_event_logs(stripe_event_id);

-- Index for customer event lookup
CREATE INDEX IF NOT EXISTS idx_stripe_events_customer ON stripe_event_logs(customer_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_stripe_events_created ON stripe_event_logs(created_at DESC);

-- Enable RLS on stripe_event_logs
ALTER TABLE stripe_event_logs ENABLE ROW LEVEL SECURITY;

-- Service role can manage all event logs
CREATE POLICY "Service can manage event logs" ON stripe_event_logs
  FOR ALL USING (true);

-- ======================
-- UPDATE TRIGGER FOR USERS
-- ======================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ======================
-- HELPER FUNCTION: Get User by Stripe Customer ID
-- ======================
CREATE OR REPLACE FUNCTION get_user_by_stripe_customer_id(p_customer_id TEXT)
RETURNS TABLE (
  id UUID,
  clerk_user_id TEXT,
  email TEXT,
  subscription_status TEXT,
  stripe_subscription_id TEXT,
  payment_failure_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.clerk_user_id,
    u.email,
    u.subscription_status,
    u.stripe_subscription_id,
    u.payment_failure_count
  FROM users u
  WHERE u.stripe_customer_id = p_customer_id;
END;
$$ LANGUAGE plpgsql;
