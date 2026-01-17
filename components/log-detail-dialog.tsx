'use client';

import { useState } from 'react';
import { format } from 'date-fns';
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Copy from "lucide-react/dist/esm/icons/copy";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Mail from "lucide-react/dist/esm/icons/mail";
import Globe from "lucide-react/dist/esm/icons/globe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type WebhookLog = {
  id: string;
  endpoint_name: string;
  calendly_event_uuid: string;
  invitee_email: string | null;
  event_type: string;
  original_payload: any;
  enriched_payload: any;
  is_reschedule: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: 'success' | 'failed';
  response_code: number | null;
  error_message: string | null;
  created_at: string;
};

type LogDetailDialogProps = {
  log: WebhookLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogDetailDialog({ log, open, onOpenChange }: LogDetailDialogProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopy = async (text: string, tabName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tabName);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  const parsedQuestions = log.enriched_payload?.enriched?.parsed_questions;
  const rescheduleInfo = log.enriched_payload?.enriched?.reschedule_info;
  const utmTracking = log.enriched_payload?.enriched?.utm_tracking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Log Details
            <Badge
              variant="outline"
              className={
                log.status === 'success'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }
            >
              {log.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              {format(new Date(log.created_at), 'MMMM d, yyyy • h:mm:ss a')}
            </div>
            {log.invitee_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" />
                {log.invitee_email}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Metadata Card */}
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Endpoint</p>
              <p className="font-medium">{log.endpoint_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Event Type</p>
              <Badge variant="outline" className="mt-1">
                {log.event_type}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Response Code</p>
              <p className="font-mono font-medium">{log.response_code || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Reschedule</p>
              <p className="font-medium">{log.is_reschedule ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {log.error_message && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Forwarding Failed</AlertTitle>
            <AlertDescription className="font-mono text-xs">
              {log.error_message}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="enriched" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="enriched">Enriched Data</TabsTrigger>
            <TabsTrigger value="original">Original Payload</TabsTrigger>
            <TabsTrigger value="parsed">Parsed Fields</TabsTrigger>
          </TabsList>

          {/* Enriched Payload Tab */}
          <TabsContent value="enriched" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Complete enriched webhook payload sent to your destination
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopy(formatJSON(log.enriched_payload), 'enriched')
                  }
                >
                  {copiedTab === 'enriched' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Card className="p-4 bg-muted">
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
                  {formatJSON(log.enriched_payload)}
                </pre>
              </Card>
            </div>
          </TabsContent>

          {/* Original Payload Tab */}
          <TabsContent value="original" className="flex-1 overflow-auto mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Raw payload received from Calendly
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopy(formatJSON(log.original_payload), 'original')
                  }
                >
                  {copiedTab === 'original' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <Card className="p-4 bg-muted">
                <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words">
                  {formatJSON(log.original_payload)}
                </pre>
              </Card>
            </div>
          </TabsContent>

          {/* Parsed Fields Tab */}
          <TabsContent value="parsed" className="flex-1 overflow-auto mt-4">
            <div className="space-y-6">
              {/* Parsed Questions */}
              {parsedQuestions && Object.keys(parsedQuestions).length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Custom Questions
                  </h3>
                  <Card className="p-4">
                    <div className="space-y-3">
                      {Object.entries(parsedQuestions).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm font-mono bg-muted px-3 py-2 rounded">
                            {value as string}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-3">Custom Questions</h3>
                  <Card className="p-6 text-center text-sm text-muted-foreground">
                    No custom questions in this booking
                  </Card>
                </div>
              )}

              {/* Reschedule Info */}
              {rescheduleInfo && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Reschedule Detection
                  </h3>
                  <Card className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Is Reschedule</p>
                        <Badge
                          variant="outline"
                          className={
                            rescheduleInfo.isReschedule
                              ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                              : 'bg-muted'
                          }
                        >
                          {rescheduleInfo.isReschedule ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {rescheduleInfo.cancellationId && (
                        <div>
                          <p className="text-muted-foreground mb-1">Original Booking ID</p>
                          <p className="font-mono text-xs bg-muted px-2 py-1 rounded">
                            {rescheduleInfo.cancellationId}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* UTM Tracking */}
              {utmTracking && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    UTM Tracking
                  </h3>
                  {utmTracking.utm_source ||
                  utmTracking.utm_medium ||
                  utmTracking.utm_campaign ? (
                    <Card className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {utmTracking.utm_source && (
                          <div>
                            <p className="text-muted-foreground mb-1">Source</p>
                            <p className="font-mono bg-muted px-2 py-1 rounded">
                              {utmTracking.utm_source}
                            </p>
                          </div>
                        )}
                        {utmTracking.utm_medium && (
                          <div>
                            <p className="text-muted-foreground mb-1">Medium</p>
                            <p className="font-mono bg-muted px-2 py-1 rounded">
                              {utmTracking.utm_medium}
                            </p>
                          </div>
                        )}
                        {utmTracking.utm_campaign && (
                          <div>
                            <p className="text-muted-foreground mb-1">Campaign</p>
                            <p className="font-mono bg-muted px-2 py-1 rounded">
                              {utmTracking.utm_campaign}
                            </p>
                          </div>
                        )}
                        {utmTracking.utm_term && (
                          <div>
                            <p className="text-muted-foreground mb-1">Term</p>
                            <p className="font-mono bg-muted px-2 py-1 rounded">
                              {utmTracking.utm_term}
                            </p>
                          </div>
                        )}
                        {utmTracking.utm_content && (
                          <div>
                            <p className="text-muted-foreground mb-1">Content</p>
                            <p className="font-mono bg-muted px-2 py-1 rounded">
                              {utmTracking.utm_content}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-6 text-center text-sm text-muted-foreground">
                      No UTM parameters detected
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
