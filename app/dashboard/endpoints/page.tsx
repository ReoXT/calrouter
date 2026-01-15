import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Webhook, Copy, CheckCircle2, MoreHorizontal, Edit, Trash2, TestTube2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreateEndpointDialog } from '@/components/create-endpoint-dialog';

export default async function EndpointsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // For now, just show empty state - we'll add database integration later
  const endpoints: any[] = [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Active Endpoints
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Manage your webhook destinations and filters.
          </p>
        </div>
        <CreateEndpointDialog />
      </div>

      {/* Empty State */}
      {endpoints.length === 0 && (
        <Card className="p-12 text-center border-2 border-dashed">
          <CardContent className="space-y-4 p-0">
            <Webhook className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No endpoints yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Create your first endpoint to start enriching webhooks
              </p>
            </div>
            <div className="mt-4">
              <CreateEndpointDialog />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoints Grid */}
      {endpoints.length > 0 && (
        <div className="grid gap-4">
          {endpoints.map((endpoint) => (
            <Card
              key={endpoint.id}
              className="p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: Icon + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    endpoint.is_active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-medium text-base">{endpoint.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {endpoint.destination_url}
                    </p>
                  </div>
                </div>

                {/* Right: Stats + Actions */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      24h Events
                    </div>
                    <div className="text-sm font-mono">
                      {endpoint.webhook_count || 0}
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Webhook URL */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    Webhook URL
                  </Label>
                  <div className="flex items-center gap-2 p-2.5 bg-muted rounded-lg font-mono text-xs border border-border">
                    <code className="flex-1 truncate text-muted-foreground">
                      https://calrouter.app/api/webhook/calendly/{endpoint.id}
                    </code>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Feature Badges */}
                <div className="flex gap-2 flex-wrap items-center">
                  {endpoint.enable_reschedule_detection && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                      Reschedule Detection
                    </Badge>
                  )}
                  {endpoint.enable_utm_tracking && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                      UTM Tracking
                    </Badge>
                  )}
                  {endpoint.enable_question_parsing && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                      Question Parsing
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <TestTube2 className="w-3.5 h-3.5 mr-1.5" />
                    Test
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
