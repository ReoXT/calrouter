'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { formatDistanceToNow } from 'date-fns'
// OPTIMIZATION: Direct icon imports to reduce bundle size
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Activity from "lucide-react/dist/esm/icons/activity";
import Webhook from "lucide-react/dist/esm/icons/webhook";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Link from 'next/link'

interface DashboardContentProps {
  stats: {
    total_webhooks: number
    total_endpoints: number
    total_reschedules: number
    success_rate: number
  }
  recentLogs: any[]
  chartData: {
    '30d': any[]
    '7d': any[]
    '24h': any[]
  }
}

export function DashboardContent({ stats, recentLogs, chartData }: DashboardContentProps) {
  const [timeRange, setTimeRange] = useState<'30d' | '7d' | '24h'>('30d')

  // Get the current chart data based on selected time range
  const currentChartData = chartData[timeRange]

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header with Time Range Selector */}
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold leading-none tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-muted-foreground">
              Real-time metrics for your webhook endpoints.
            </p>
          </div>

          {/* Time Range Selector with animated slider */}
          <div className="relative inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
            {/* Animated background slider */}
            <div
              className={`absolute top-1 bottom-1 rounded-md bg-primary shadow-sm transition-all duration-300 ease-out will-change-transform ${
                timeRange === '30d'
                  ? 'left-1 w-[88px]'
                  : timeRange === '7d'
                  ? 'left-[89px] w-[88px]'
                  : 'left-[177px] w-[88px]'
              }`}
            />

            <button
              onClick={() => setTimeRange('30d')}
              className={`relative z-10 flex items-center justify-center rounded-md py-2 text-sm font-semibold whitespace-nowrap btn-smooth transition-colors w-[88px] ${
                timeRange === '30d'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`relative z-10 flex items-center justify-center rounded-md py-2 text-sm font-semibold whitespace-nowrap btn-smooth transition-colors w-[88px] ${
                timeRange === '7d'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`relative z-10 flex items-center justify-center rounded-md py-2 text-sm font-semibold whitespace-nowrap btn-smooth transition-colors w-[88px] ${
                timeRange === '24h'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              24h
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Webhooks */}
          <Card className="relative overflow-hidden p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Webhook className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>12%</span>
              </span>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Webhooks
              </p>
              <p className="text-3xl font-bold leading-none tracking-tight">
                {stats.total_webhooks.toLocaleString()}
              </p>
            </div>
          </Card>

          {/* Total Endpoints */}
          <Card className="relative overflow-hidden p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>5%</span>
              </span>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Endpoints
              </p>
              <p className="text-3xl font-bold leading-none tracking-tight">
                {stats.total_endpoints}
              </p>
            </div>
          </Card>

          {/* Reschedules Detected */}
          <Card className="relative overflow-hidden p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>2.1%</span>
              </span>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Reschedules
              </p>
              <p className="text-3xl font-bold leading-none tracking-tight">
                {stats.total_reschedules}
              </p>
            </div>
          </Card>

          {/* Success Rate */}
          <Card className="relative overflow-hidden p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                <span>0.1%</span>
              </span>
            </div>
            <div className="mt-6 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Success Rate
              </p>
              <p className="text-3xl font-bold leading-none tracking-tight">
                {stats.success_rate.toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>

        {/* Main Content Grid - Chart and Activity Feed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Activity Trend Chart */}
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold leading-none">Activity Trend</h3>
                <p className="text-sm text-muted-foreground">
                  Webhook delivery performance over time
                </p>
              </div>
              <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent">
                <span className="text-xl leading-none">⋯</span>
              </button>
            </div>

            <ChartContainer
              config={{
                webhooks: {
                  label: 'Webhooks',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[300px] w-full"
            >
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWebhooks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="webhooks"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorWebhooks)"
                  animationDuration={500}
                />
              </AreaChart>
            </ChartContainer>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="overflow-hidden">
            <div className="border-b p-6">
              <h3 className="text-lg font-bold leading-none">Recent Activity</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest webhook events
              </p>
            </div>

            <div className="flex flex-col">
              {recentLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Webhooks will appear here
                  </p>
                </div>
              ) : (
                recentLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 border-b px-6 py-4 last:border-0"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                        log.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : log.status === 'failed'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-bold">!</span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate text-sm font-medium leading-none">
                        {log.event_type}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground leading-none">
                        {log.endpoint?.name || 'Unknown endpoint'}
                      </p>
                      {log.is_reschedule && (
                        <Badge
                          variant="outline"
                          className="mt-1 w-fit bg-accent/50 text-xs"
                        >
                          Reschedule
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t p-4">
              <Link href="/dashboard/logs">
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-center gap-2 text-primary transition-colors hover:bg-primary/5"
                >
                  View All Logs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
