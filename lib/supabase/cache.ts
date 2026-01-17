/**
 * React.cache() wrappers for Supabase queries
 * Provides per-request deduplication for server components
 *
 * OPTIMIZATION: Eliminates duplicate fetches within same request
 * Example: If 3 components call getUserStats(userId), only 1 DB query is made
 */

import { cache } from 'react';
import {
  getUserStats,
  getUserEndpoints,
  getEndpointById,
  getUserByClerkId,
  getOrCreateUser,
  supabaseAdmin
} from './client';

/**
 * Cached user stats - deduplicated per request
 * Usage in server components:
 * const stats = await getCachedUserStats(userId);
 */
export const getCachedUserStats = cache(async (userId: string) => {
  return getUserStats(userId);
});

/**
 * Cached user endpoints - deduplicated per request
 */
export const getCachedUserEndpoints = cache(async (userId: string) => {
  return getUserEndpoints(userId);
});

/**
 * Cached single endpoint lookup - deduplicated per request
 */
export const getCachedEndpointById = cache(async (endpointId: string, userId: string) => {
  return getEndpointById(endpointId, userId);
});

/**
 * Cached user by Clerk ID - deduplicated per request
 */
export const getCachedUserByClerkId = cache(async (clerkUserId: string) => {
  return getUserByClerkId(clerkUserId);
});

/**
 * Cached get or create user - deduplicated per request
 */
export const getCachedOrCreateUser = cache(async (clerkUserId: string, email: string) => {
  return getOrCreateUser(clerkUserId, email);
});

/**
 * Cached webhook logs with endpoint info
 * OPTIMIZATION: Single JOIN query instead of N+1
 */
export const getCachedRecentLogs = cache(async (userId: string, limit: number = 10) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { data, error } = await supabaseAdmin
    .from('webhook_logs')
    .select(`
      id,
      event_type,
      status,
      is_reschedule,
      created_at,
      webhook_endpoints!inner(name, user_id)
    `)
    .eq('webhook_endpoints.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent logs:', error);
    return [];
  }

  // Transform to expected format
  return (data || []).map(log => ({
    id: log.id,
    event_type: log.event_type,
    status: log.status,
    is_reschedule: log.is_reschedule,
    created_at: log.created_at,
    endpoint: {
      name: (log.webhook_endpoints as any)?.name
    }
  }));
});

/**
 * Cached endpoint with webhook count
 * OPTIMIZATION: Aggregate count in single query
 */
export const getCachedEndpointsWithCounts = cache(async (userId: string) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { data, error } = await supabaseAdmin
    .from('webhook_endpoints')
    .select(`
      *,
      webhook_count:webhook_logs(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching endpoints with counts:', error);
    return [];
  }

  return (data || []).map(endpoint => ({
    ...endpoint,
    webhook_count: (endpoint.webhook_count as any)?.[0]?.count || 0
  }));
});

/**
 * LRU Cache for cross-request caching (optional, for high-traffic scenarios)
 * Note: Use with caution - requires cache invalidation strategy
 */
class LRUCache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 100, ttlMs: number = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    // Check TTL
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: K, value: V): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Export LRU cache for advanced use cases
export const statsCache = new LRUCache<string, any>(50, 30000); // 30s TTL
export const endpointsCache = new LRUCache<string, any>(100, 60000); // 60s TTL

/**
 * Stats with LRU caching (cross-request)
 * Use when same user data is frequently accessed
 */
export async function getCachedUserStatsWithLRU(userId: string) {
  const cached = statsCache.get(userId);
  if (cached) return cached;

  const stats = await getUserStats(userId);
  statsCache.set(userId, stats);

  return stats;
}
