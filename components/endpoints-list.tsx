"use client";

import { useState, memo, useCallback } from "react";
import { useLatest } from '@/lib/hooks/use-latest';
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Webhook from "lucide-react/dist/esm/icons/webhook";
import Copy from "lucide-react/dist/esm/icons/copy";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import TestTube2 from "lucide-react/dist/esm/icons/test-tube-2";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreateEndpointDialog } from '@/components/create-endpoint-dialog';
import { EditEndpointDialog } from '@/components/edit-endpoint-dialog';
import { DeleteEndpointDialog } from '@/components/delete-endpoint-dialog';
import { toast } from 'sonner';

interface Endpoint {
  id: string;
  name: string;
  destination_url: string;
  is_active: boolean;
  enable_reschedule_detection: boolean;
  enable_utm_tracking: boolean;
  enable_question_parsing: boolean;
  webhook_count?: number;
}

interface EndpointsListProps {
  initialEndpoints: Endpoint[];
}

// OPTIMIZATION: Memoized child component
const EndpointCard = memo(function EndpointCard({ 
  endpoint, 
  onCopy, 
  onUpdate, 
  onDelete 
}: { 
  endpoint: any;
  onCopy: (id: string) => void;
  onUpdate: (endpoint: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card
      key={endpoint.id}
      className="p-3 md:p-4 hover:border-primary/30 transition-all"
    >
      <div className="flex items-center justify-between gap-3 md:gap-4">
        {/* Left: Icon + Info */}
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className={`p-1.5 md:p-2 rounded-lg shrink-0 ${
            endpoint.is_active
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-muted text-muted-foreground'
          }`}>
            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
            <h3 className="font-medium text-sm md:text-base">{endpoint.name}</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground font-mono truncate">
              {endpoint.destination_url}
            </p>
          </div>
        </div>

        {/* Right: Stats + Actions */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
              24h Events
            </div>
            <div className="text-sm font-mono">
              {endpoint.webhook_count || 0}
            </div>
          </div>

          <Button size="sm" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 p-0">
            <MoreHorizontal className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border space-y-3 md:space-y-4">
        {/* Webhook URL */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            Webhook URL
          </Label>
          <div className="flex items-center gap-2 p-2 md:p-2.5 bg-muted rounded-lg font-mono text-[10px] md:text-xs border border-border">
            <code className="flex-1 truncate text-muted-foreground">
              {window.location.origin}/api/webhook/calendly/{endpoint.id}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 md:h-7 md:w-7 p-0 shrink-0"
              onClick={() => onCopy(endpoint.id)}
            >
              <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </Button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex gap-1.5 md:gap-2 flex-wrap items-center">
          {endpoint.enable_reschedule_detection && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs">
              Reschedule Detection
            </Badge>
          )}
          {endpoint.enable_utm_tracking && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs">
              UTM Tracking
            </Badge>
          )}
          {endpoint.enable_question_parsing && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] md:text-xs">
              Question Parsing
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <EditEndpointDialog
            endpoint={endpoint}
            onSuccess={onUpdate}
            trigger={
              <Button size="sm" variant="outline" className="h-7 md:h-8 text-[10px] md:text-xs">
                <Edit className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                Edit
              </Button>
            }
          />
          <Button size="sm" variant="outline" className="h-7 md:h-8 text-[10px] md:text-xs">
            <TestTube2 className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
            Test
          </Button>
          <DeleteEndpointDialog
            endpoint={endpoint}
            onSuccess={() => onDelete(endpoint.id)}
            trigger={
              <Button size="sm" variant="outline" className="h-7 md:h-8 text-[10px] md:text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1 md:mr-1.5" />
                Delete
              </Button>
            }
          />
        </div>
      </div>
    </Card>
  );
});

export function EndpointsList({ initialEndpoints }: EndpointsListProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialEndpoints);

  // OPTIMIZATION: Stable callback with useCallback
const handleCopyWebhookUrl = useCallback((endpointId: string) => {
  const url = `${window.location.origin}/api/webhook/calendly/${endpointId}`;
  navigator.clipboard.writeText(url);
  toast.success('Webhook URL copied to clipboard');
}, []);

  // OPTIMIZATION: Stable callback with functional setState
const handleEndpointUpdate = useCallback((updatedEndpoint: Endpoint) => {
  setEndpoints((prev) =>
    prev.map((ep) => (ep.id === updatedEndpoint.id ? updatedEndpoint : ep))
  );
}, []);

  // OPTIMIZATION: Stable callback with functional setState
const handleEndpointDelete = useCallback((endpointId: string) => {
  setEndpoints((prev) => prev.filter((ep) => ep.id !== endpointId));
}, []);

  if (endpoints.length === 0) {
    return (
      <Card className="p-8 md:p-12 text-center border-2 border-dashed">
        <CardContent className="space-y-3 md:space-y-4 p-0">
          <Webhook className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground" />
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="text-base md:text-lg font-semibold">No endpoints yet</h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
              Create your first endpoint to start enriching webhooks
            </p>
          </div>
          <div className="mt-3 md:mt-4">
            <CreateEndpointDialog onSuccess={(newEndpoint) => setEndpoints([...endpoints, newEndpoint])} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:gap-4">
      {endpoints.map((endpoint) => (
        <EndpointCard
        key={endpoint.id}
        endpoint={endpoint}
        onCopy={handleCopyWebhookUrl}
        onUpdate={handleEndpointUpdate}
        onDelete={handleEndpointDelete}
      />
      ))}
    </div>
  );
}

export default memo(EndpointsList);
