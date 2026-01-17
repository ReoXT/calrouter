"use client";

import { useState } from "react";
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Check from "lucide-react/dist/esm/icons/check";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Zap from "lucide-react/dist/esm/icons/zap";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Shield from "lucide-react/dist/esm/icons/shield";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BillingContentProps {
  subscriptionStatus: string;
  daysLeft: number;
  monthlyStats: {
    webhooksProcessed: number;
    reschedulesDetected: number;
    questionsParsed: number;
  };
}

const MONTHLY_PRICE = 29;
const ANNUAL_PRICE = 24;
const ANNUAL_TOTAL = 288;
const ANNUAL_SAVINGS = 60;

const FEATURES = [
  "Unlimited Webhook Endpoints",
  "Automatic Reschedule Detection",
  "Custom Question Parsing",
  {
    text: "Advanced ",
    highlight: "UTM",
    suffix: " Parameter Tracking",
  },
  {
    text: "Real-time ",
    highlight: "JSON",
    suffix: " Debugging & Logs",
  },
  "Priority Email Support",
  "99.9% Uptime SLA",
];

export function BillingContent({
  subscriptionStatus,
  daysLeft,
  monthlyStats,
}: BillingContentProps) {
  const [showAnnual, setShowAnnual] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const planType = showAnnual ? "annual" : "monthly";
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planType }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to start upgrade process. Please try again.");
      setIsUpgrading(false);
    }
  };

  const isPro = subscriptionStatus === "active";
  const isTrial = subscriptionStatus === "trial";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage statistics.
        </p>
      </div>

      {/* Trial Status Card */}
      {isTrial && (
        <Card className="p-6 border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              </div>
              <p className="text-2xl font-bold">Free Trial</p>
              <p className="text-sm text-muted-foreground mt-1">
                {daysLeft > 0 ? (
                  <>
                    <span className="font-semibold text-primary">{daysLeft}</span> days remaining
                  </>
                ) : (
                  <span className="text-destructive font-semibold">Trial expired</span>
                )}
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 btn-smooth"
              onClick={handleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Processing..." : "Upgrade to Pro"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Pro Status Card */}
      {isPro && (
        <Card className="p-6 border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">Pro Plan</p>
                <Badge className="bg-primary/20 text-primary border-primary/30">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                All features unlocked
              </p>
            </div>
            <Button variant="outline" disabled>
              Manage Billing
            </Button>
          </div>
        </Card>
      )}

      {/* Billing Toggle with Animated Slider */}
      <div className="flex flex-col items-center">
        <div className="relative inline-flex items-center gap-1 p-1.5 bg-muted rounded-xl border border-border shadow-sm">
          {/* Animated background slider */}
          <div
            className={cn(
              "absolute top-1.5 bottom-1.5 bg-card rounded-lg shadow-md transition-all duration-300 ease-out will-change-transform",
              showAnnual ? "left-1/2 right-1.5" : "left-1.5 right-1/2"
            )}
          />

          <button
            onClick={() => setShowAnnual(false)}
            className={cn(
              "relative z-10 w-[140px] py-2.5 rounded-lg text-sm font-semibold btn-smooth text-center transition-colors",
              !showAnnual
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setShowAnnual(true)}
            className={cn(
              "relative z-10 w-[140px] py-2.5 rounded-lg text-sm font-semibold btn-smooth transition-colors",
              showAnnual
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
              <span>Annual</span>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 leading-none">
                Save 17%
              </Badge>
            </div>
          </button>
        </div>
      </div>

      {/* Pricing Card - Single Card that Swaps */}
      <div className="relative group">
        {/* Glow effect on hover */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-primary/50 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

        <Card className="relative p-8 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] space-y-6 text-center shadow-xl">
          {/* Decorative element */}
          <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
            </svg>
          </div>

          {/* Header */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-left">Pro Plan</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold uppercase tracking-wider">
                Most Popular
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground text-left">
              For power users & growing teams
            </p>
          </div>

          {/* Pricing - Animated swap */}
          <div className="space-y-2 min-h-[100px] flex flex-col justify-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold tracking-tight font-sans transition-all duration-300">
                ${showAnnual ? ANNUAL_PRICE : MONTHLY_PRICE}
              </span>
              <span className="text-lg text-muted-foreground font-medium">
                /month
              </span>
            </div>
            <div className="h-6">
              {showAnnual && (
                <p className="text-sm text-muted-foreground animate-in fade-in duration-300">
                  ${ANNUAL_TOTAL} billed annually • Save ${ANNUAL_SAVINGS}/year
                </p>
              )}
              {!showAnnual && (
                <p className="text-sm text-muted-foreground animate-in fade-in duration-300">
                  Billed monthly
                </p>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 font-bold btn-smooth"
            onClick={handleUpgrade}
            disabled={isUpgrading || isPro}
          >
            {isPro ? "Current Plan" : isUpgrading ? "Processing..." : "Start 14-Day Free Trial"}
          </Button>

          {/* Footer text */}
          <p className="text-sm text-muted-foreground">
            No credit card required • Cancel anytime
          </p>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Features List */}
          <ul className="space-y-4 text-left">
            {FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                {typeof feature === "string" ? (
                  <span className="text-sm text-foreground">{feature}</span>
                ) : (
                  <span className="text-sm text-foreground">
                    {feature.text}
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                      {feature.highlight}
                    </span>
                    {feature.suffix}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Usage Stats Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">This Month's Activity</h3>
        </div>

        <div className="grid gap-4">
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Webhooks Processed</span>
            <span className="font-semibold text-lg font-mono">
              {monthlyStats.webhooksProcessed.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Reschedules Detected</span>
            <span className="font-semibold text-lg font-mono">
              {monthlyStats.reschedulesDetected.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Questions Parsed</span>
            <span className="font-semibold text-lg font-mono">
              {monthlyStats.questionsParsed.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            All features included with Pro plan - no usage limits
          </p>
        </div>
      </Card>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground py-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="font-semibold">SOC2 Compliant</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="font-semibold">Low Latency (&lt;50ms)</span>
        </div>
      </div>
    </div>
  );
}
