import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CreateEndpointDialog } from '@/components/create-endpoint-dialog';
import { EndpointsList } from '@/components/endpoints-list';

export default async function EndpointsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // For now, just show empty state - we'll add database integration later
  const endpoints: any[] = [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Active Endpoints
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Manage your webhook destinations and filters.
          </p>
        </div>
        <div className="self-start md:self-auto">
          <CreateEndpointDialog />
        </div>
      </div>

      {/* Endpoints List */}
      <EndpointsList initialEndpoints={endpoints} />
    </div>
  );
}
