-- Add failure notification tracking to webhook_endpoints
-- This field tracks when the last failure notification was sent
-- to prevent spamming users with repeated alerts

ALTER TABLE webhook_endpoints
ADD COLUMN IF NOT EXISTS failure_notification_sent_at TIMESTAMP;

-- Index for efficient filtering during cron job
CREATE INDEX IF NOT EXISTS idx_endpoints_failure_notification
ON webhook_endpoints(failure_notification_sent_at)
WHERE is_active = true AND deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN webhook_endpoints.failure_notification_sent_at IS
'Timestamp of last webhook failure notification email sent to user. Used to prevent duplicate alerts within cooldown period (24 hours).';
