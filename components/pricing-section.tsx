'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// OPTIMIZATION: Direct icon imports to reduce bundle size
import Check from "lucide-react/dist/esm/icons/check";

export function PricingSection() {
  const [showAnnual, setShowAnnual] = useState(true)

  const monthlyPrice = 29
  const annualPrice = 24
  const annualTotal = 288

  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-primary/10 border-primary/20 text-primary font-bold uppercase tracking-widest text-xs"
          >
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to enrich your Calendly webhooks without the enterprise price tag.
          </p>
        </div>

        {/* Billing Toggle with Animated Slider */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative inline-flex items-center gap-1 p-1.5 bg-muted/50 rounded-xl border border-border">
            {/* Animated background slider */}
            <div
              className={`absolute top-1.5 bottom-1.5 bg-card rounded-lg shadow-sm transition-all duration-300 ease-out will-change-transform ${
                showAnnual ? 'left-1/2 right-1.5' : 'left-1.5 right-1/2'
              }`}
            />

            <button
              onClick={() => setShowAnnual(false)}
              className={`relative z-10 w-[140px] py-2.5 rounded-lg text-sm font-semibold btn-smooth text-center ${
                !showAnnual
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setShowAnnual(true)}
              className={`relative z-10 w-[140px] py-2.5 rounded-lg text-sm font-semibold btn-smooth ${
                showAnnual
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
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

        {/* Pricing Card */}
        <div className="max-w-md mx-auto relative group">
          {/* Glow effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-primary/50 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />

          <Card className="relative p-8 border-2 border-primary/20 hover:border-primary/40 btn-smooth space-y-6 text-center shadow-xl">
            {/* Decorative element */}
            <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
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

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight font-sans">
                  ${showAnnual ? annualPrice : monthlyPrice}
                </span>
                <span className="text-lg text-muted-foreground font-medium">
                  /month
                </span>
              </div>
              {showAnnual && (
                <p className="text-sm text-muted-foreground">
                  ${annualTotal} billed annually • Save $60/year
                </p>
              )}
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 font-bold"
            >
              Start Free Trial
            </Button>

            {/* Footer text */}
            <p className="text-sm text-muted-foreground">
              14-day free trial. No credit card required.
            </p>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Features List */}
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  Unlimited Webhook Endpoints
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  Automatic Reschedule Detection
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  Custom Question Parsing
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  Advanced <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">UTM</span> Parameter Tracking
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  Real-time <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">JSON</span> Debugging & Logs
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  Priority Email Support
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">
                  99.9% Uptime SLA
                </span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold">SOC2 Compliant</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold">Low Latency (&lt;50ms)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
