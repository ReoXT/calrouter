export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted animate-pulse" />
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
              <div className="h-9 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="space-y-4">
              <div className="h-12 w-full bg-muted rounded animate-pulse" />
              <div className="h-12 w-5/6 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-20 w-full bg-muted rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-12 w-36 bg-muted rounded animate-pulse" />
              <div className="h-12 w-36 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
