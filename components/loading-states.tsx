import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * PROMPT 27: Loading States
 * Reusable loading state components using Skeleton for various UI patterns
 */

// Generic Card Loading State
export function CardLoadingSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-48" />
    </Card>
  );
}

// Stats Card Loading State
export function StatsCardLoadingSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </Card>
  );
}

// Endpoint Card Loading State
export function EndpointCardLoadingSkeleton() {
  return (
    <Card className="p-6 space-y-4 border-2">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-5 w-36 rounded-full" />
      </div>

      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  );
}

// Table Row Loading State
export function TableRowLoadingSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

// Form Field Loading State
export function FormFieldLoadingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

// Dashboard Overview Loading State
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardLoadingSkeleton key={i} />
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48 flex-1" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Endpoints List Loading State
export function EndpointsListLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <EndpointCardLoadingSkeleton key={i} />
      ))}
    </div>
  );
}

// Logs Table Loading State
export function LogsTableLoadingSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="bg-muted p-4">
        <div className="flex gap-4">
          {['Timestamp', 'Endpoint', 'Event', 'Status', 'Action'].map((header) => (
            <Skeleton key={header} className="h-4 w-24" />
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowLoadingSkeleton key={i} columns={5} />
        ))}
      </div>
    </div>
  );
}
