import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// ===== CLIENT-SIDE SUPABASE CLIENT =====
// Use this in client components and API routes that need user context
// Respects Row Level Security (RLS) policies
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Clerk for auth
  },
});

// ===== SERVER-SIDE SUPABASE CLIENT (Service Role) =====
// Use this ONLY in API routes and server actions where you need to bypass RLS
// Has full database access - use with caution
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// Throw error if trying to use admin client without service role key
if (!supabaseAdmin) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY not set. Admin operations will be unavailable.'
  );
}

// ===== HELPER FUNCTIONS =====

/**
 * Get or create a user in the database based on Clerk user ID
 */
export async function getOrCreateUser(clerkUserId: string, email: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existingUser) {
    return { user: existingUser, isNew: false };
  }

  // Create new user if doesn't exist
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      clerk_user_id: clerkUserId,
      email,
      subscription_status: 'trial',
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating user:', insertError);
    throw new Error('Failed to create user in database');
  }

  return { user: newUser, isNew: true };
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkUserId: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found"
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }

  return data;
}

/**
 * Update user subscription status
 */
export async function updateUserSubscription(
  clerkUserId: string,
  status: string
) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ subscription_status: status })
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw new Error('Failed to update subscription');
  }

  return data;
}

/**
 * Get user's webhook endpoints
 */
export async function getUserEndpoints(userId: string) {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching endpoints:', error);
    throw new Error('Failed to fetch endpoints');
  }

  return data;
}

/**
 * Get endpoint by ID (with user validation)
 */
export async function getEndpointById(endpointId: string, userId: string) {
  const { data, error } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('id', endpointId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching endpoint:', error);
    return null;
  }

  return data;
}

/**
 * Get user stats (uses the database function)
 */
export async function getUserStats(userId: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  const { data, error } = await supabaseAdmin.rpc('get_user_stats', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error fetching stats:', error);
    return {
      total_endpoints: 0,
      total_webhooks: 0,
      total_reschedules: 0,
      success_rate: 100,
    };
  }

  return data[0];
}

// ===== TYPE DEFINITIONS =====

export type User = {
  id: string;
  clerk_user_id: string;
  email: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
};

export type WebhookEndpoint = {
  id: string;
  user_id: string;
  name: string;
  destination_url: string;
  is_active: boolean;
  enable_reschedule_detection: boolean;
  enable_utm_tracking: boolean;
  enable_question_parsing: boolean;
  created_at: string;
};

export type WebhookLog = {
  id: string;
  endpoint_id: string;
  calendly_event_uuid: string;
  invitee_email: string | null;
  event_type: string;
  original_payload: Record<string, any>;
  enriched_payload: Record<string, any> | null;
  is_reschedule: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
  response_code: number | null;
  error_message: string | null;
  created_at: string;
};
