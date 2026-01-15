import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome, {user.firstName || 'there'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your CalRouter dashboard is ready. Start enriching webhooks.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Placeholder stats cards */}
          <div className="p-6 border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground">Total Endpoints</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground">Webhooks Processed</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground">Reschedules Detected</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="p-6 border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-3xl font-bold mt-2">100%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
