/**
 * CalRouter Component Library
 * Centralized exports for easy importing
 */

// Toast Utilities (PROMPT 28)
export * from '@/lib/toast-utils';

// Loading States (PROMPT 27)
export {
  CardLoadingSkeleton,
  StatsCardLoadingSkeleton,
  EndpointCardLoadingSkeleton,
  TableRowLoadingSkeleton,
  FormFieldLoadingSkeleton,
  DashboardLoadingSkeleton,
  EndpointsListLoadingSkeleton,
  LogsTableLoadingSkeleton,
} from './loading-states';

// Empty States (PROMPT 27)
export {
  EmptyState,
  NoEndpointsEmpty,
  NoLogsEmpty,
  NoAnalyticsDataEmpty,
  NoSearchResultsEmpty,
  NoDocumentationEmpty,
} from './empty-states';

// Error States (PROMPT 27)
export {
  ApiErrorAlert,
  CriticalErrorAlert,
  WarningAlert,
  InfoAlert,
  FormFieldError,
  WebhookErrorBadge,
  WebhookSuccessBadge,
  NetworkErrorState,
  NotFoundState,
  PermissionDeniedState,
  TrialExpiredState,
} from './error-states';

// UI Components (shadcn/ui)
export { Button } from './ui/button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Badge } from './ui/badge';
export { Alert, AlertTitle, AlertDescription, AlertAction } from './ui/alert';
export { Skeleton } from './ui/skeleton';
export { Switch } from './ui/switch';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

// Feature Components
export { CreateEndpointDialog } from './create-endpoint-dialog';
export { LogDetailDialog } from './log-detail-dialog';

/**
 * Usage Examples:
 *
 * // Single import
 * import { ApiErrorAlert, DashboardLoadingSkeleton } from '@/components';
 *
 * // Multiple related imports
 * import {
 *   NoEndpointsEmpty,
 *   NoLogsEmpty,
 *   NoAnalyticsDataEmpty
 * } from '@/components';
 */
