import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrCreateUser, getUserStats, supabaseAdmin } from '@/lib/supabase/client';
import { BillingContent } from '@/components/billing-content';

async function getBillingData(userId: string) {
  // Fetch user data
  const { data: user } = await supabaseAdmin!
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Fetch stats
  const stats = await getUserStats(userId);

  // Calculate days remaining in trial
  let daysLeft = 0;
  if (user?.trial_ends_at) {
    const trialEnd = new Date(user.trial_ends_at);
    const today = new Date();
    const diffTime = trialEnd.getTime() - today.getTime();
    daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Mock monthly usage stats
  const monthlyStats = {
    webhooksProcessed: stats?.total_webhooks || 0,
    reschedulesDetected: stats?.total_reschedules || 0,
    questionsParsed: Math.floor((stats?.total_webhooks || 0) * 0.7), // Mock 70% have questions
  };

  return {
    user,
    daysLeft,
    monthlyStats,
  };
}

export default async function BillingPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get or create user in database
  const { user: dbUser } = await getOrCreateUser(
    user.id,
    user.emailAddresses[0]?.emailAddress || ''
  );

  const { user: userData, daysLeft, monthlyStats } = await getBillingData(dbUser.id);

  return (
    <BillingContent
      subscriptionStatus={userData?.subscription_status || 'trial'}
      daysLeft={daysLeft}
      monthlyStats={monthlyStats}
    />
  );
}
