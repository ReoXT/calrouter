-- Migration: Add deleted_at column to webhook_endpoints table
-- This migration adds support for soft deletes

-- Add deleted_at column
ALTER TABLE webhook_endpoints
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for filtering deleted endpoints
CREATE INDEX IF NOT EXISTS idx_endpoints_deleted ON webhook_endpoints(deleted_at);

-- Update the get_user_stats function to exclude deleted endpoints
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
    (SELECT COUNT(*) FROM webhook_endpoints WHERE user_id = p_user_id AND is_active = true AND deleted_at IS NULL) as total_endpoints,
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
