'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Activity, Calendar, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AnalyticsData = {
  webhookActivity: { date: string; count: number }[];
  eventTypes: { type: string; count: number }[];
  utmSources: { source: string; count: number }[];
  rescheduleStats: {
    rate: string;
    count: number;
    total: number;
  };
  totalEnrichments: number;
  growthPercentage: string;
};

export function AnalyticsContent({
  data,
  initialRange,
}: {
  data: AnalyticsData;
  initialRange: string;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState(initialRange);

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    router.push(`/dashboard/analytics?range=${value}`);
  };

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const isPositiveGrowth = parseFloat(data.growthPercentage) >= 0;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
            <p className="text-muted-foreground mt-1">
              Track webhook enrichments and performance metrics
            </p>
          </div>

          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Enrichments */}
          <Card className="relative overflow-hidden group">
            <CardContent className="pt-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-12 h-12 text-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Enrichments</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold tracking-tight">
                  {data.totalEnrichments.toLocaleString()}
                </h3>
                <Badge
                  variant={isPositiveGrowth ? 'default' : 'destructive'}
                  className="gap-1 bg-primary/10 text-primary border-primary/20"
                >
                  {isPositiveGrowth ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(parseFloat(data.growthPercentage))}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs. previous period</p>
            </CardContent>
          </Card>

          {/* Reschedule Rate */}
          <Card className="relative overflow-hidden group">
            <CardContent className="pt-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-12 h-12 text-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Reschedule Rate</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold tracking-tight">{data.rescheduleStats.rate}%</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.rescheduleStats.count} of {data.rescheduleStats.total} bookings
              </p>
            </CardContent>
          </Card>

          {/* UTM Tracked */}
          <Card className="relative overflow-hidden group">
            <CardContent className="pt-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target className="w-12 h-12 text-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">UTM Tracked</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold tracking-tight">
                  {data.utmSources.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.utmSources.length} unique sources
              </p>
            </CardContent>
          </Card>

          {/* Event Types */}
          <Card className="relative overflow-hidden group">
            <CardContent className="pt-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-12 h-12 text-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Event Types</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold tracking-tight">{data.eventTypes.length}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Different event types tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart - Webhook Activity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Activity</CardTitle>
            <CardDescription>Daily webhook enrichments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.webhookActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs text-muted-foreground"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bottom Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Event Type Breakdown</CardTitle>
              <CardDescription>Distribution by Calendly event type</CardDescription>
            </CardHeader>
            <CardContent>
              {data.eventTypes.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.eventTypes}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="type"
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      className="text-xs text-muted-foreground"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No event data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* UTM Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Top UTM Sources</CardTitle>
              <CardDescription>Top 5 traffic sources tracked</CardDescription>
            </CardHeader>
            <CardContent>
              {data.utmSources.length > 0 ? (
                <div className="space-y-4">
                  {data.utmSources.map((source, index) => {
                    const maxCount = data.utmSources[0]?.count || 1;
                    const percentage = (source.count / maxCount) * 100;

                    return (
                      <div key={source.source} className="group">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium font-mono truncate">
                            {source.source}
                          </span>
                          <span className="text-muted-foreground">
                            {source.count.toLocaleString()} req
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 border border-border/50">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No UTM data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
