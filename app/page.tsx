import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Webhook,
  ArrowRight,
  Check,
  X,
  Filter,
  Calendar,
  ListChecks,
  Target,
  Link2,
  Settings,
  Zap,
} from "lucide-react";
import { PricingSection } from "@/components/pricing-section";
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== NAVIGATION HEADER ===== */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary">
                <Webhook className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold tracking-tight">CalRouter</h2>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
              <nav className="flex items-center gap-6">
                <a
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  href="#features"
                >
                  Features
                </a>
                <a
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  href="#pricing"
                >
                  Pricing
                </a>
                <a
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  href="#docs"
                >
                  Docs
                </a>
              </nav>

              <div className="flex items-center gap-4 border-l border-border pl-6">
                <SignedOut>
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent transition-colors"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <main className="relative flex-1 overflow-hidden">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column: Content */}
            <div className="flex flex-col gap-10 max-w-2xl lg:max-w-none">
              <div className="space-y-8">
                {/* Status Badge */}
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border-primary/20 text-primary w-fit"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Webhook Enrichment Engine
                  </span>
                </Badge>

                {/* Hero Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                  Stop wasting time parsing{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-purple-400">
                    Calendly webhooks
                  </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Automatically detect reschedules, parse custom questions, and
                  track lead sources. Get clean, enriched data—not messy JSON.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group relative bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  See How It Works
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Column: Code Visual */}
            <div className="relative w-full">
              {/* Decorative Background Blobs */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

              {/* Code Card Container */}
              <div className="relative rounded-xl bg-card border border-border shadow-2xl overflow-hidden btn-smooth hover:scale-[1.01]">
                {/* Window Title Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    webhook-transformation.json
                  </div>
                  <div className="w-10" />
                </div>

                {/* Code Panels - Before/After Split */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                  {/* Before Panel */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Before
                      </span>
                      <Badge variant="outline" className="text-[10px] h-5 bg-muted">
                        Raw
                      </Badge>
                    </div>
                    <pre className="font-mono text-xs leading-relaxed text-muted-foreground overflow-x-auto">
{`{
  "event": "invitee.created",
  "payload": {
    "email": "alex@company.com",
    "questions_and_answers": [
      {
        "question": "Budget?",
        "answer": "$5k"
      }
    ]
  }
}`}
                    </pre>
                  </div>

                  {/* After Panel */}
                  <div className="p-6 relative bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        After <ArrowRight className="w-3 h-3" />
                      </span>
                      <Badge className="text-[10px] h-5 bg-primary/20 text-primary border-primary/20">
                        Enriched
                      </Badge>
                    </div>
                    <pre className="font-mono text-xs leading-relaxed text-foreground overflow-x-auto">
{`{
  "enriched": {
    "parsed_questions": {
      "budget": "$5k"
    },
    "utm_tracking": {
      "source": "google"
    },
    "is_reschedule": false
  }
}`}
                    </pre>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="bg-muted px-4 py-2.5 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>
                      Latency: <span className="text-primary font-semibold">32ms</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="font-semibold">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fade Transition */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </main>

      {/* ===== PROBLEM/SOLUTION SECTION ===== */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {/* Left Card - Before CalRouter */}
            <Card className="p-8 lg:p-10 space-y-6 border-2 border-border hover:border-destructive/50 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Before CalRouter</h3>
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20"
                >
                  Problem
                </Badge>
              </div>

              <ul className="space-y-5 pt-2">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Messy nested JSON
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Hours building Zapier formatters
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    Lost attribution data
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <X className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-base text-muted-foreground leading-relaxed">
                    No reschedule detection
                  </span>
                </li>
              </ul>
            </Card>

            {/* Right Card - After CalRouter */}
            <Card className="p-8 lg:p-10 space-y-6 border-2 border-border hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold">After CalRouter</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Solution
                  </Badge>
                </div>

                <ul className="space-y-5 pt-2 mt-6">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-base text-foreground leading-relaxed">
                      Clean, structured data
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-base text-foreground leading-relaxed">
                      Ready to use instantly
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-base text-foreground leading-relaxed">
                      Never lose lead source
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-base text-foreground leading-relaxed">
                      Automatic reschedule flags
                    </span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID SECTION ===== */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 relative">
            {/* Decorative blur behind title */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="relative text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground">
              Supercharge your scheduling
            </h2>
            <p className="relative text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Unlock the full potential of your meeting data with advanced enrichment tools designed for power users and developers.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {/* Feature 1: Smart Filtering */}
            <Card className="group relative flex flex-col p-6 rounded-[1.25rem] bg-card border border-border hover:border-primary/50 btn-smooth hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 btn-smooth">
                <Filter className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Filtering</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Route events based on meeting type, status, or custom logic to keep your CRM clean.
              </p>
            </Card>

            {/* Feature 2: Reschedule Sync */}
            <Card className="group relative flex flex-col p-6 rounded-[1.25rem] bg-card border border-border hover:border-primary/50 btn-smooth hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 btn-smooth">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Reschedule Sync</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatically detect and link rescheduled events to their originals to prevent duplicates.
              </p>
            </Card>

            {/* Feature 3: Q&A Parsing */}
            <Card className="group relative flex flex-col p-6 rounded-[1.25rem] bg-card border border-border hover:border-primary/50 btn-smooth hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 btn-smooth">
                <ListChecks className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Q&A Parsing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Extract structured data from invitee answers. No more regex parsing in your backend.
              </p>
            </Card>

            {/* Feature 4: UTM Tracking */}
            <Card className="group relative flex flex-col p-6 rounded-[1.25rem] bg-card border border-border hover:border-primary/50 btn-smooth hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 btn-smooth">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">UTM Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Capture campaign source, medium, and term data and forward it to your destination.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW / HOW IT WORKS SECTION ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 bg-primary/10 border-primary/20 text-primary font-bold uppercase tracking-widest text-xs"
            >
              Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How CalRouter Works
            </h2>
            <p className="text-muted-foreground">
              Set up your enrichment pipeline in minutes.
            </p>
          </div>

          {/* Timeline Container */}
          <div className="max-w-5xl mx-auto relative workflow-connector">
            {/* Step 1 - Left Side (Desktop) */}
            <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-8 mb-16 group">
              {/* Left Content (Desktop) / Second on Mobile */}
              <div className="order-2 md:order-1 w-full md:w-[45%] md:text-right">
                <Card className="p-6 rounded-2xl border-2 border-border shadow-lg hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-10">
                    <Link2 className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Connect your Calendly webhook</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Point your Calendly webhook to CalRouter. We'll receive all booking events and start processing them instantly.
                  </p>
                </Card>
              </div>

              {/* Center Node */}
              <div className="order-1 md:order-2 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg relative z-20 shadow-lg shadow-primary/20 ring-4 ring-primary/20">
                1
              </div>

              {/* Right Spacer (Desktop) */}
              <div className="order-3 w-full md:w-[45%] hidden md:block" />
            </div>

            {/* Step 2 - Right Side (Desktop) */}
            <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-8 mb-16 group">
              {/* Left Spacer (Desktop) */}
              <div className="order-3 md:order-1 w-full md:w-[45%] hidden md:block" />

              {/* Center Node */}
              <div className="order-1 md:order-2 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-card border-2 border-primary text-primary font-bold text-lg relative z-20 shadow-lg">
                2
              </div>

              {/* Right Content (Desktop) / Second on Mobile */}
              <div className="order-2 md:order-3 w-full md:w-[45%] text-left">
                <Card className="p-6 rounded-2xl border-2 border-border shadow-lg hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-10">
                    <Settings className="w-16 h-16" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold mb-2">Configure enrichment rules</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Choose which features to enable: reschedule detection, question parsing, UTM tracking, or all three.
                    </p>
                    <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-xs text-muted-foreground border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-foreground">Enrichment Active</span>
                      </div>
                      <code>
                        enable_reschedule_detection: true<br />
                        enable_question_parsing: true<br />
                        enable_utm_tracking: true
                      </code>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Step 3 - Left Side (Desktop) */}
            <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-8 mb-16 group">
              {/* Left Content (Desktop) / Second on Mobile */}
              <div className="order-2 md:order-1 w-full md:w-[45%] md:text-right">
                <Card className="p-6 rounded-2xl border-2 border-border shadow-lg hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-10">
                    <Webhook className="w-16 h-16" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Add destination URLs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Forward enriched data to Zapier, Make, n8n, or your own API. Multiple destinations supported per endpoint.
                  </p>
                </Card>
              </div>

              {/* Center Node */}
              <div className="order-1 md:order-2 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-card border-2 border-primary text-primary font-bold text-lg relative z-20 shadow-lg">
                3
              </div>

              {/* Right Spacer (Desktop) */}
              <div className="order-3 w-full md:w-[45%] hidden md:block" />
            </div>

            {/* Step 4 - Right Side (Desktop) */}
            <div className="relative flex flex-col md:flex-row items-center md:justify-between gap-8 group">
              {/* Left Spacer (Desktop) */}
              <div className="order-3 md:order-1 w-full md:w-[45%] hidden md:block" />

              {/* Center Node */}
              <div className="order-1 md:order-2 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg relative z-20 shadow-lg shadow-primary/20 ring-4 ring-primary/20">
                4
              </div>

              {/* Right Content (Desktop) / Second on Mobile */}
              <div className="order-2 md:order-3 w-full md:w-[45%] text-left">
                <Card className="p-6 rounded-2xl border-2 border-border shadow-lg hover:border-primary/50 transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-10">
                    <Zap className="w-16 h-16" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold mb-2">Receive enriched data automatically</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Watch clean, structured data flow to your destination in real-time. Full logging and monitoring included.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                      <span className="text-xs font-mono text-green-500 uppercase font-semibold">
                        System Active
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <PricingSection />
    </div>
  );
}
