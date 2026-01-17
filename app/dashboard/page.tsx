import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrCreateUser, getUserStats, supabaseAdmin } from '@/lib/supabase/client';
import { getCachedUserStats, getCachedRecentLogs } from '@/lib/supabase/cache';
import { DashboardContent } from '@/components/dashboard-content';
import { subDays, format } from 'date-fns';

async function getDashboardData(userId: string) {
  // OPTIMIZATION: Parallelize all independent operations with Promise.all
  const [stats, recentLogs] = await Promise.all([
    getCachedUserStats(userId), // ✅ Cached
    getCachedRecentLogs(userId, 10), // ✅ Cached + optimized query
  ]);

  // OPTIMIZATION: Chart data generation is synchronous, no need to await
  // Move expensive computations into separate function for better code splitting
  const chartData = generateChartData();


  return {
    stats,
    recentLogs,
    chartData,
  };
}

// OPTIMIZATION: Extract chart generation for potential memoization/caching
function generateChartData() {
  return {
    '30d': Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'MMM dd'),
        webhooks: Math.floor(Math.random() * 100) + 50,
      };
    }),
    '7d': Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        webhooks: Math.floor(Math.random() * 120) + 60,
      };
    }),
    '24h': Array.from({ length: 24 }, (_, i) => {
      const hour = 24 - i;
      return {
        date: `${hour}:00`,
        webhooks: Math.floor(Math.random() * 50) + 20,
      };
    }).reverse(),
  };
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get or create user in database
  const { user: dbUser } = await getOrCreateUser(
    user.id,
    user.emailAddresses[0]?.emailAddress || ''
  );

  const { stats, recentLogs, chartData } = await getDashboardData(dbUser.id);

  return <DashboardContent stats={stats} recentLogs={recentLogs} chartData={chartData} />;
}
