-- Migration: Add trial_reminder_sent_at field to users table
-- Purpose: Track when trial expiry reminder emails were sent to prevent duplicates
-- Date: 2026-01-17

-- Add column to track when trial reminder was sent
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_reminder_sent_at TIMESTAMP;

-- Create index for efficient queries (helps with the 12-hour check)
CREATE INDEX IF NOT EXISTS idx_users_trial_reminder
ON users(trial_reminder_sent_at)
WHERE subscription_status = 'trial';

-- Add comment for documentation
COMMENT ON COLUMN users.trial_reminder_sent_at IS
'Timestamp when trial expiry reminder email was sent (used to prevent duplicate emails)';
