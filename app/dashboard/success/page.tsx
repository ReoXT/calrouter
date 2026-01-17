"use client";

import { useEffect } from "react";
// OPTIMIZATION: Direct icon imports to reduce bundle size (bundle-barrel-imports)
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Webhook from "lucide-react/dist/esm/icons/webhook";
import Book from "lucide-react/dist/esm/icons/book";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// OPTIMIZATION: Hoist static JSX outside component (rendering-hoist-jsx)
const NextStepItem = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
      {number}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {description}
      </p>
    </div>
  </div>
);

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const isMock = searchParams.get("mock") === "true";
  const plan = searchParams.get("plan");

  useEffect(() => {
    // OPTIMIZATION: No external scripts loaded, avoiding bundle-defer-third-party concerns
    console.log("Payment successful!");
  }, []);

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6 relative">
      {/* Ambient background glow - inspired by stitch design */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <Card className="relative z-10 max-w-md mx-auto p-8 text-center space-y-6 border-2 shadow-xl gpu-accelerated">
        {/* Success Icon Area with subtle animation */}
        <div className="relative flex items-center justify-center py-2">
          <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-card border-2 border-primary/20">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
            <CheckCircle2 className="w-10 h-10 text-primary relative z-10" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {isMock ? "Mock Checkout Complete!" : "Welcome to CalRouter Pro!"}
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            {isMock
              ? `Mock ${plan} subscription created. In production, this would process via Stripe.`
              : "Your webhooks are now being enriched. Get started by creating your first endpoint."
            }
          </p>
        </div>

        {/* Next Steps */}
        <div className="space-y-3 text-left pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-center mb-4">Next Steps</h3>

          <NextStepItem
            number={1}
            title="Create your first endpoint"
            description="Set up webhook enrichment and routing"
          />

          <NextStepItem
            number={2}
            title="Add webhook URL to Calendly"
            description="Configure your Calendly event types"
          />

          <NextStepItem
            number={3}
            title="Start receiving enriched bookings"
            description="Watch your automations light up"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
          <Button
            asChild
            className="flex-1 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 btn-smooth"
          >
            <Link href="/dashboard/endpoints" className="flex items-center justify-center gap-2">
              <Webhook className="w-4 h-4" />
              <span>Go to Endpoints</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex-1 h-12"
          >
            <Link href="/dashboard/setup" className="flex items-center justify-center gap-2">
              <Book className="w-4 h-4" />
              <span>View Setup Guide</span>
            </Link>
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          Need help? <Link href="/dashboard/setup" className="text-primary hover:underline underline-offset-4">Contact Support</Link>
        </p>
      </Card>
    </main>
  );
}
