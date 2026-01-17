'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Download from "lucide-react/dist/esm/icons/download";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Eye from "lucide-react/dist/esm/icons/eye";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LogDetailDialog } from '@/components/log-detail-dialog';
import { WebhookErrorBadge, WebhookSuccessBadge } from '@/components/error-states';

type WebhookLog = {
  id: string;
  endpoint_id: string;
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

type Endpoint = {
  id: string;
  name: string;
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 50;

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch logs
  const fetchLogs = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: logsPerPage.toString(),
        ...(selectedEndpoint !== 'all' && { endpoint_id: selectedEndpoint }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedEventType !== 'all' && { event_type: selectedEventType }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/webhook/logs?${params}`);
      const data = await response.json();

      setLogs(data.logs || []);
      setTotalLogs(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch endpoints for filter
  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints');
      const data = await response.json();
      setEndpoints(data.endpoints || []);
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLogs();
    fetchEndpoints();
  }, [currentPage, selectedEndpoint, selectedStatus, selectedEventType]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setCurrentPage(1);
        fetchLogs();
      } else if (searchQuery === '') {
        fetchLogs();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, selectedEndpoint, selectedStatus, selectedEventType]);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearFilters = () => {
    setSelectedEndpoint('all');
    setSelectedStatus('all');
    setSelectedEventType('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleViewLog = (log: WebhookLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  const totalPages = Math.ceil(totalLogs / logsPerPage);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Monitor incoming webhook events in real-time. Debug payloads and retry failed delivery attempts.
          </p>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="h-8 md:h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 md:h-9">
            <Download className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar - Mobile Responsive */}
      <div className="bg-card border rounded-xl p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Top Row: Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Endpoint Filter */}
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-auto sm:min-w-[140px] h-8 sm:h-9 bg-background border-0 focus:ring-0 focus:ring-offset-0 px-2.5 sm:px-3 text-xs">
                <SelectValue placeholder="Endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Endpoints</SelectItem>
                {endpoints.map((endpoint) => (
                  <SelectItem key={endpoint.id} value={endpoint.id}>
                    {endpoint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Event Type Filter */}
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-auto sm:min-w-[140px] h-8 sm:h-9 bg-background border-0 focus:ring-0 focus:ring-offset-0 px-2.5 sm:px-3 text-xs">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="invitee.created">Booking Created</SelectItem>
                <SelectItem value="invitee.canceled">Booking Canceled</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-auto sm:min-w-[110px] h-8 sm:h-9 bg-background border-0 focus:ring-0 focus:ring-offset-0 px-2.5 sm:px-3 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(selectedEndpoint !== 'all' ||
              selectedStatus !== 'all' ||
              selectedEventType !== 'all' ||
              searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-[calc(50%-0.25rem)] sm:w-auto h-8 sm:h-9 px-2.5 sm:px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Bottom Row: Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, payload, or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 sm:h-9 pl-9 sm:pl-10 pr-3 bg-background border-0 focus-visible:ring-1 focus-visible:ring-ring text-xs"
            />
            <button
              type="button"
              onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()}
              className="hidden lg:inline-flex absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 select-none items-center justify-center rounded border bg-muted hover:bg-muted/80 transition-colors font-mono text-[10px] font-medium text-muted-foreground"
              aria-label="Focus search (press /)"
            >
              /
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-4 md:p-6 space-y-3 md:space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-10 md:h-12 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <Filter className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted-foreground mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No logs found</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              {searchQuery || selectedEndpoint !== 'all' || selectedStatus !== 'all' || selectedEventType !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Webhook activity will appear here once you start receiving events.'}
            </p>
            {(searchQuery || selectedEndpoint !== 'all' || selectedStatus !== 'all' || selectedEventType !== 'all') && (
              <Button variant="outline" onClick={handleClearFilters} className="h-8 md:h-9 text-xs md:text-sm">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[120px]">Timestamp</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[140px]">Endpoint</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[140px]">Event Type</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[100px]">Reschedule</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[100px]">Source</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[120px]">Status</TableHead>
                    <TableHead className="font-semibold text-xs md:text-sm min-w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-mono text-[10px] md:text-sm">
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs md:text-sm">{log.endpoint_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] md:text-xs ${
                            log.event_type === 'invitee.created'
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              : 'bg-orange-500/10 text-orange-600 border-orange-500/20'
                          }`}
                        >
                          {log.event_type === 'invitee.created' ? 'Booking Created' : 'Booking Canceled'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.is_reschedule ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] md:text-xs"
                          >
                            <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs md:text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[10px] md:text-sm text-muted-foreground font-mono">
                        {log.utm_source || 'direct'}
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <div className="flex items-center gap-1">
                            <WebhookSuccessBadge />
                            <span className="text-[10px] md:text-xs text-muted-foreground ml-1">
                              {log.response_code || 200}
                            </span>
                          </div>
                        ) : (
                          <WebhookErrorBadge errorMessage={log.error_message || undefined} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewLog(log)}
                          className="h-7 w-7 md:h-8 md:w-8 p-0"
                        >
                          <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t px-4 md:px-6 py-3 md:py-4">
              <p className="text-xs md:text-sm text-muted-foreground">
                Showing <span className="font-medium">{((currentPage - 1) * logsPerPage) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * logsPerPage, totalLogs)}
                </span> of{' '}
                <span className="font-medium">{totalLogs}</span> results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 md:h-9 text-xs md:text-sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 md:h-9 text-xs md:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
