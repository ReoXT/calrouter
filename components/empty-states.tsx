import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

/**
 * PROMPT 27: Empty States
 * Reusable empty state component pattern for consistent UI across lists
 *
 * OPTIMIZATION: Uses React best practices - component is generic and reusable
 */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center space-y-4">
      <Icon className="w-16 h-16 mx-auto text-muted-foreground" />
      <div className="space-y-2">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
      {children}
    </Card>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */

// OPTIMIZATION: Direct icon imports to reduce bundle size (bundle-barrel-imports)
import Webhook from "lucide-react/dist/esm/icons/webhook";
import Activity from "lucide-react/dist/esm/icons/activity";
import FileText from "lucide-react/dist/esm/icons/file-text";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Search from "lucide-react/dist/esm/icons/search";

export function NoEndpointsEmpty({ onCreateEndpoint }: { onCreateEndpoint: () => void }) {
  return (
    <EmptyState
      icon={Webhook}
      title="No endpoints yet"
      description="Get started by creating your first endpoint to start enriching webhooks"
      action={{
        label: "Create Endpoint",
        onClick: onCreateEndpoint,
      }}
    />
  );
}

export function NoLogsEmpty() {
  return (
    <EmptyState
      icon={Activity}
      title="No webhook logs yet"
      description="Webhook activity will appear here once you start receiving events from Calendly"
    />
  );
}

export function NoAnalyticsDataEmpty() {
  return (
    <EmptyState
      icon={BarChart3}
      title="No analytics data yet"
      description="Data will appear after your first webhook is processed"
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No results found for "${query}". Try adjusting your search or filters.`}
    />
  );
}

export function NoDocumentationEmpty() {
  return (
    <EmptyState
      icon={FileText}
      title="Documentation not found"
      description="The documentation you're looking for doesn't exist or has been moved"
    />
  );
}
