import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getOrCreateUser, supabaseAdmin } from '@/lib/supabase/client';
import { AnalyticsContent } from '@/components/analytics-content';
import { subDays, format } from 'date-fns';

async function getAnalyticsData(userId: string, dateRange: string = '30d') {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized');
  }

  // Calculate date range
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[dateRange as keyof typeof daysMap] || 30;
  const startDate = subDays(new Date(), days);

  // Parallelize all data fetching
  const [webhookActivityData, eventTypesData, utmSourcesData, rescheduleData] =
    await Promise.all([
      // 1. Webhook activity over time
      supabaseAdmin
        .from('webhook_logs')
        .select('created_at, status')
        .eq('status', 'success')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })
        .then((result) => {
          if (result.error) throw result.error;
          return result.data || [];
        }),

      // 2. Event type breakdown
      supabaseAdmin
        .from('webhook_logs')
        .select('event_type')
        .gte('created_at', startDate.toISOString())
        .then((result) => {
          if (result.error) throw result.error;
          return result.data || [];
        }),

      // 3. UTM sources
      supabaseAdmin
        .from('webhook_logs')
        .select('utm_source')
        .not('utm_source', 'is', null)
        .gte('created_at', startDate.toISOString())
        .then((result) => {
          if (result.error) throw result.error;
          return result.data || [];
        }),

      // 4. Reschedule stats
      supabaseAdmin
        .from('webhook_logs')
        .select('is_reschedule, event_type')
        .gte('created_at', startDate.toISOString())
        .in('event_type', ['invitee.created', 'invitee.canceled'])
        .then((result) => {
          if (result.error) throw result.error;
          return result.data || [];
        }),
    ]);

  // Process webhook activity data into daily counts
  const activityMap = new Map<string, number>();
  webhookActivityData.forEach((log) => {
    const date = format(new Date(log.created_at), 'MMM dd');
    activityMap.set(date, (activityMap.get(date) || 0) + 1);
  });

  const webhookActivity = Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dateKey = format(date, 'MMM dd');
    return {
      date: dateKey,
      count: activityMap.get(dateKey) || 0,
    };
  });

  // Process event types
  const eventTypeMap = new Map<string, number>();
  eventTypesData.forEach((log) => {
    eventTypeMap.set(log.event_type, (eventTypeMap.get(log.event_type) || 0) + 1);
  });

  const eventTypes = Array.from(eventTypeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Process UTM sources
  const utmMap = new Map<string, number>();
  utmSourcesData.forEach((log) => {
    if (log.utm_source) {
      utmMap.set(log.utm_source, (utmMap.get(log.utm_source) || 0) + 1);
    }
  });

  const utmSources = Array.from(utmMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate reschedule rate
  const totalBookings = rescheduleData.filter(
    (log) => log.event_type === 'invitee.created'
  ).length;
  const rescheduleCount = rescheduleData.filter((log) => log.is_reschedule).length;
  const rescheduleRate =
    totalBookings > 0 ? ((rescheduleCount / totalBookings) * 100).toFixed(1) : '0.0';

  // Get total stats
  const totalEnrichments = webhookActivityData.length;
  const prevPeriodStart = subDays(startDate, days);

  const { count: prevPeriodCount } = await supabaseAdmin
    .from('webhook_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', prevPeriodStart.toISOString())
    .lt('created_at', startDate.toISOString());

  const prevTotal = prevPeriodCount || 0;
  const growthPercentage =
    prevTotal > 0 ? (((totalEnrichments - prevTotal) / prevTotal) * 100).toFixed(1) : '0';

  return {
    webhookActivity,
    eventTypes,
    utmSources,
    rescheduleStats: {
      rate: rescheduleRate,
      count: rescheduleCount,
      total: totalBookings,
    },
    totalEnrichments,
    growthPercentage,
  };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string; endpoint?: string };
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get or create user in database
  const { user: dbUser } = await getOrCreateUser(
    user.id,
    user.emailAddresses[0]?.emailAddress || ''
  );

  const dateRange = searchParams.range || '30d';
  const data = await getAnalyticsData(dbUser.id, dateRange);

  return <AnalyticsContent data={data} initialRange={dateRange} />;
}
