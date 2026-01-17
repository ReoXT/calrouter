import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function BillingLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Trial Status Card */}
      <Card className="p-6 border-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </Card>

      {/* Plan Toggle */}
      <div className="flex justify-center">
        <Skeleton className="h-12 w-80" />
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-3 pt-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="space-y-3 pt-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Stats */}
      <Card className="p-6 max-w-2xl mx-auto">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
