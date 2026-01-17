import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// OPTIMIZATION: Direct icon imports to reduce bundle size (bundle-barrel-imports)
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Info from "lucide-react/dist/esm/icons/info";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";

/**
 * PROMPT 27: Error States
 * Reusable error state components with consistent styling
 */

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Generic API Error Alert
 * Use for failed API requests, network errors, etc.
 */
export function ApiErrorAlert({
  title = "Error",
  message,
  onRetry,
  onDismiss,
}: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message || "Something went wrong. Please try again."}
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-3 text-destructive border-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Critical Error Alert
 * Use for errors that require immediate attention
 */
export function CriticalErrorAlert({ title = "Critical Error", message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="border-destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message || "A critical error occurred. Please contact support if this persists."}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Warning Alert
 * Use for non-critical issues that users should be aware of
 */
export function WarningAlert({ title = "Warning", message }: { title?: string; message: string }) {
  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <AlertTriangle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">{title}</AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        {message}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Info Alert
 * Use for informational messages
 */
export function InfoAlert({ title, message }: { title?: string; message: string }) {
  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      {title && <AlertTitle className="text-primary">{title}</AlertTitle>}
      <AlertDescription className="text-foreground/80">
        {message}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Form Field Error
 * Use inline below form fields for validation errors
 */
export function FormFieldError({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3" />
      {error}
    </p>
  );
}

/**
 * Webhook Forwarding Error Badge
 * Use in logs table to show webhook delivery failures
 */
export function WebhookErrorBadge({ errorMessage }: { errorMessage?: string }) {
  return (
    <div className="space-y-1">
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        Failed
      </Badge>
      {errorMessage && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

/**
 * Success Badge
 * Use in logs table for successful webhook deliveries
 */
export function WebhookSuccessBadge() {
  return (
    <Badge className="bg-primary/10 text-primary border-primary/20">
      Success
    </Badge>
  );
}

/**
 * Network Error State
 * Use when unable to connect to server
 */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Connection Error</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Unable to connect to the server. Please check your internet connection and try again.
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}

/**
 * 404 Not Found State
 * Use when resource doesn't exist
 */
export function NotFoundState({ resourceName = "Resource" }: { resourceName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="text-6xl font-bold text-muted-foreground">404</div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold">{resourceName} Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The {resourceName.toLowerCase()} you're looking for doesn't exist or has been removed.
        </p>
      </div>
    </div>
  );
}

/**
 * Permission Denied State
 * Use when user lacks access
 */
export function PermissionDeniedState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold">Access Denied</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          You don't have permission to access this resource. Please contact your administrator.
        </p>
      </div>
    </div>
  );
}

/**
 * Trial Expired State
 * Use when user's trial has ended
 */
export function TrialExpiredState({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <Alert className="border-primary/50 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">Trial Expired</AlertTitle>
      <AlertDescription>
        <p className="mb-3">
          Your free trial has ended. Upgrade to continue using CalRouter's webhook enrichment features.
        </p>
        <Button onClick={onUpgrade} className="bg-primary hover:bg-primary/90">
          Upgrade to Pro
        </Button>
      </AlertDescription>
    </Alert>
  );
}
