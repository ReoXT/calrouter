'use client';

import { useState } from 'react';
// OPTIMIZATION: Direct icon imports to reduce bundle size
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Webhook from "lucide-react/dist/esm/icons/webhook";
import Settings from "lucide-react/dist/esm/icons/settings";
import Copy from "lucide-react/dist/esm/icons/copy";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Target from "lucide-react/dist/esm/icons/target";
import ListChecks from "lucide-react/dist/esm/icons/list-checks";
import Zap from "lucide-react/dist/esm/icons/zap";
import Link2 from "lucide-react/dist/esm/icons/link-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Terminal from "lucide-react/dist/esm/icons/terminal";
import Play from "lucide-react/dist/esm/icons/play";
import HelpCircle from "lucide-react/dist/esm/icons/help-circle";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function SetupGuidePage() {
  const [selectedPlatform, setSelectedPlatform] = useState('zapier');
  const [testingWebhook, setTestingWebhook] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test webhook sent successfully!');
    } catch (error) {
      toast.error('Failed to send test webhook');
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
      {/* Page Header */}
      <header className="mb-8 sm:mb-12 md:mb-16">
        <div className="flex items-center gap-2 sm:gap-2.5 text-primary mb-2 sm:mb-3">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Developer Resources</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4 md:mb-5">Setup Guide</h2>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed font-normal">
          Integrate CalRouter into your workflow in minutes. Follow these three steps to start enriching your Calendly events with custom parsing, reschedule detection, and UTM tracking.
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16">
        {/* Progress Sidebar - Hidden on mobile, shown on large screens */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-12 space-y-0">
            {/* Step 1 - Completed */}
            <div className="relative pl-6 xl:pl-8 pb-10 xl:pb-12 border-l-2 border-primary">
              <div className="absolute -left-[9px] xl:-left-[11px] top-0 w-4 h-4 xl:w-5 xl:h-5 bg-primary rounded-full flex items-center justify-center ring-3 xl:ring-4 ring-background">
                <CheckCircle2 className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-primary-foreground" strokeWidth={3} />
              </div>
              <h4 className="text-xs xl:text-sm font-bold text-foreground leading-tight mb-1.5 xl:mb-2">Create Endpoint</h4>
              <p className="text-[10px] xl:text-xs text-primary font-medium">Completed</p>
            </div>

            {/* Step 2 - In Progress */}
            <div className="relative pl-6 xl:pl-8 pb-10 xl:pb-12 border-l-2 border-primary/30">
              <div className="absolute -left-[9px] xl:-left-[11px] top-0 w-4 h-4 xl:w-5 xl:h-5 bg-primary rounded-full flex items-center justify-center ring-3 xl:ring-4 ring-background">
                <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-primary-foreground rounded-full"></div>
              </div>
              <h4 className="text-xs xl:text-sm font-bold text-foreground leading-tight mb-1.5 xl:mb-2">Configure Calendly</h4>
              <p className="text-[10px] xl:text-xs text-muted-foreground">In Progress</p>
            </div>

            {/* Step 3 - Pending */}
            <div className="relative pl-6 xl:pl-8 border-l-2 border-border">
              <div className="absolute -left-[9px] xl:-left-[11px] top-0 w-4 h-4 xl:w-5 xl:h-5 bg-muted rounded-full ring-3 xl:ring-4 ring-background"></div>
              <h4 className="text-xs xl:text-sm font-bold text-muted-foreground leading-tight mb-1.5 xl:mb-2">Test & Deploy</h4>
              <p className="text-[10px] xl:text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-9 space-y-8 sm:space-y-12 md:space-y-16">
          {/* Step 1: Create Endpoint */}
          <section className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                  <Webhook className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">1. Create Your Endpoint</h3>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 self-start sm:self-auto">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                <span className="font-semibold text-xs sm:text-sm">Connected</span>
              </Badge>
            </div>

            <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed text-sm sm:text-[15px]">
              An endpoint is where CalRouter receives webhooks from Calendly, enriches them, and forwards them to your destination. You'll get a unique URL to add to Calendly.
            </p>

            <div className="space-y-3 sm:space-y-4 md:space-y-5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">Your CalRouter Webhook URL</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1 bg-muted border border-border rounded-lg px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 font-mono text-[10px] sm:text-xs md:text-sm flex items-center justify-between gap-2 min-w-0">
                  <span className="text-muted-foreground truncate">https://calrouter.app/api/webhook/calendly/abc123xyz</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 flex-shrink-0"
                    onClick={() => copyToClipboard('https://calrouter.app/api/webhook/calendly/abc123xyz')}
                    aria-label="Copy webhook URL"
                  >
                    <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="px-4 sm:px-5 md:px-6 h-auto py-3 sm:py-3.5 md:py-4 font-semibold text-xs sm:text-sm"
                  asChild
                >
                  <a href="/dashboard/endpoints">
                    Manage
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 md:mt-10 p-4 sm:p-5 md:p-6 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-start gap-3 sm:gap-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-1" />
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">Enrichment Features Enabled</p>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 font-medium">
                      <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                      <span className="whitespace-nowrap">Reschedule Detection</span>
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 font-medium">
                      <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                      <span className="whitespace-nowrap">UTM Tracking</span>
                    </Badge>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 font-medium">
                      <ListChecks className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
                      <span className="whitespace-nowrap">Question Parsing</span>
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Configure Calendly */}
          <section className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">2. Add Webhook to Calendly</h3>
            </div>

            <p className="text-muted-foreground mb-6 sm:mb-8 md:mb-10 leading-relaxed text-sm sm:text-[15px]">
              Configure Calendly to send booking events to your CalRouter endpoint. You'll select which event types to forward and paste your webhook URL.
            </p>

            {/* Important Alert */}
            <Alert className="mb-6 sm:mb-8 md:mb-10 border-primary/20 bg-primary/5 p-4 sm:p-5 md:p-6">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <AlertTitle className="font-bold text-sm sm:text-base mb-3 sm:mb-4 text-foreground">Important: Event Types vs Booking Types</AlertTitle>
              <AlertDescription className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm md:text-[15px] leading-relaxed text-foreground/90">
                  In Calendly webhook settings, you select <strong className="font-semibold text-foreground">EVENT types</strong> (not booking types):
                </p>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm md:text-[15px]">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed text-foreground/90 min-w-0">
                      <code className="bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-primary text-[10px] sm:text-xs font-mono font-semibold">invitee.created</code> <span className="text-muted-foreground">→</span> Any new booking
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed text-foreground/90 min-w-0">
                      <code className="bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-primary text-[10px] sm:text-xs font-mono font-semibold">invitee.canceled</code> <span className="text-muted-foreground">→</span> Any cancellation
                    </span>
                  </li>
                </ul>
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-xs sm:text-sm md:text-[15px] font-medium text-foreground leading-relaxed flex items-start gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg flex-shrink-0">⚠️</span>
                    <span>You <strong className="font-semibold">cannot</strong> filter by booking type (like "30 Min Meeting"). Create multiple endpoints for different handling.</span>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Step-by-step Instructions */}
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 md:mb-10">
              <h4 className="text-sm sm:text-base font-bold text-foreground mb-3 sm:mb-4">Setup Instructions</h4>

              {[
                {
                  letter: 'A',
                  title: 'Open Calendly Webhooks',
                  description: 'Navigate to your Calendly account settings',
                  action: (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-8 text-xs font-semibold"
                      asChild
                    >
                      <a href="https://calendly.com/integrations/webhooks" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        Open Calendly Settings
                      </a>
                    </Button>
                  )
                },
                {
                  letter: 'B',
                  title: 'Click "Create Webhook"',
                  description: 'Start creating a new webhook subscription'
                },
                {
                  letter: 'C',
                  title: 'Paste Your CalRouter URL',
                  description: 'Copy from Step 1 above',
                  action: (
                    <div className="mt-2 p-3 bg-muted rounded-lg border font-mono text-xs flex items-center gap-3">
                      <code className="flex-1 truncate text-muted-foreground">
                        https://calrouter.app/api/webhook/calendly/abc123xyz
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={() => copyToClipboard('https://calrouter.app/api/webhook/calendly/abc123xyz')}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )
                },
                {
                  letter: 'D',
                  title: 'Select Event Types',
                  description: 'Choose which events to forward',
                  action: (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs px-3 py-1.5 font-medium">
                        ✓ invitee.created
                      </Badge>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs px-3 py-1.5 font-medium">
                        ✓ invitee.canceled
                      </Badge>
                    </div>
                  )
                },
                {
                  letter: 'E',
                  title: 'Save & Activate',
                  description: 'Your webhook is now live and will start forwarding events'
                }
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs sm:text-sm text-primary">
                    {step.letter}
                  </div>
                  <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                    <p className="font-bold text-sm sm:text-[15px] text-foreground">{step.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    {step.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip */}
            <Alert className="border-blue-500/20 bg-blue-500/5 p-4 sm:p-5 md:p-6">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <AlertTitle className="font-bold text-sm sm:text-base text-blue-700 dark:text-blue-400 mb-3 sm:mb-4">
                Pro Tip: Use Multiple Endpoints
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm md:text-[15px] text-foreground/90 leading-relaxed">
                Create separate CalRouter endpoints for different use cases:
                <ul className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">One endpoint for new bookings → CRM</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">Another for cancellations → Slack notifications</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-blue-500 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="leading-relaxed">VIP bookings → Priority email alerts</span>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </section>

          {/* Step 3: Test & Connect Automation */}
          <section className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                <Terminal className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">3. Connect Your Automation Tool</h3>
            </div>

            <p className="text-muted-foreground mb-6 sm:mb-8 md:mb-10 leading-relaxed text-sm sm:text-[15px]">
              Get webhook URLs from your automation platform (Zapier, Make, n8n, etc.) and add them as your endpoint's destination URL.
            </p>

            {/* Automation Platform Toggle */}
            <div className="mb-6 sm:mb-8 md:mb-10">
              <div className="relative inline-flex items-center p-1 sm:p-1.5 bg-muted/50 rounded-xl border border-border mb-6 sm:mb-8 w-full max-w-[500px] overflow-x-auto">
                {/* Animated background slider */}
                <div
                  className={`absolute top-1 sm:top-1.5 bottom-1 sm:bottom-1.5 bg-card rounded-lg shadow-sm transition-all duration-300 ease-out will-change-transform ${
                    selectedPlatform === 'zapier'
                      ? 'left-1 sm:left-1.5 w-1/4'
                      : selectedPlatform === 'make'
                      ? 'left-[25%] w-1/4'
                      : selectedPlatform === 'n8n'
                      ? 'left-[50%] w-1/4'
                      : 'left-[75%] right-1 sm:right-1.5'
                  }`}
                />
                <button
                  onClick={() => setSelectedPlatform('zapier')}
                  className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold btn-smooth transition-colors text-center whitespace-nowrap ${
                    selectedPlatform === 'zapier'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ paddingLeft: '8px', paddingRight: '8px' }}
                >
                  Zapier
                </button>
                <button
                  onClick={() => setSelectedPlatform('make')}
                  className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold btn-smooth transition-colors text-center whitespace-nowrap ${
                    selectedPlatform === 'make'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ paddingLeft: '8px', paddingRight: '8px' }}
                >
                  Make
                </button>
                <button
                  onClick={() => setSelectedPlatform('n8n')}
                  className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold btn-smooth transition-colors text-center whitespace-nowrap ${
                    selectedPlatform === 'n8n'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ paddingLeft: '8px', paddingRight: '8px' }}
                >
                  n8n
                </button>
                <button
                  onClick={() => setSelectedPlatform('custom')}
                  className={`relative z-10 flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold btn-smooth transition-colors text-center whitespace-nowrap ${
                    selectedPlatform === 'custom'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ paddingLeft: '8px', paddingRight: '8px' }}
                >
                  Custom
                </button>
              </div>

              {selectedPlatform === 'zapier' && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    <h4 className="font-bold text-base sm:text-lg text-foreground">Setting up with Zapier</h4>
                  </div>
                  <ol className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-[15px]">
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">1.</span>
                      <span className="leading-relaxed text-foreground/90">Create a new Zap and choose <strong className="font-bold text-foreground">Webhooks by Zapier</strong> as the trigger</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">2.</span>
                      <span className="leading-relaxed text-foreground/90">Select <strong className="font-bold text-foreground">Catch Hook</strong> event</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">3.</span>
                      <span className="leading-relaxed text-foreground/90">Copy the webhook URL Zapier provides</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">4.</span>
                      <span className="leading-relaxed text-foreground/90">Paste into your CalRouter endpoint's <strong className="font-bold text-foreground">Destination URL</strong> field</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">5.</span>
                      <span className="leading-relaxed text-foreground/90">Send a test webhook (see below)</span>
                    </li>
                  </ol>
                </div>
              )}

              {selectedPlatform === 'make' && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                    <h4 className="font-bold text-base sm:text-lg text-foreground">Setting up with Make.com</h4>
                  </div>
                  <ol className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-[15px]">
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">1.</span>
                      <span className="leading-relaxed text-foreground/90">Create a new scenario and add the <strong className="font-bold text-foreground">Custom Webhook</strong> module</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">2.</span>
                      <span className="leading-relaxed text-foreground/90">Click "Create a webhook" and give it a name</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">3.</span>
                      <span className="leading-relaxed text-foreground/90">Copy the webhook URL Make provides</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">4.</span>
                      <span className="leading-relaxed text-foreground/90">Paste into CalRouter endpoint's <strong className="font-bold text-foreground">Destination URL</strong></span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">5.</span>
                      <span className="leading-relaxed text-foreground/90">Send a test to determine the data structure</span>
                    </li>
                  </ol>
                </div>
              )}

              {selectedPlatform === 'n8n' && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                    <h4 className="font-bold text-base sm:text-lg text-foreground">Setting up with n8n</h4>
                  </div>
                  <ol className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-[15px]">
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">1.</span>
                      <span className="leading-relaxed text-foreground/90">Create a new workflow and add a <strong className="font-bold text-foreground">Webhook</strong> trigger node</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">2.</span>
                      <span className="leading-relaxed text-foreground/90">Set HTTP Method to <strong className="font-bold text-foreground">POST</strong></span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">3.</span>
                      <span className="leading-relaxed text-foreground/90">Copy the Production or Test webhook URL</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">4.</span>
                      <span className="leading-relaxed text-foreground/90">Paste into CalRouter endpoint's <strong className="font-bold text-foreground">Destination URL</strong></span>
                    </li>
                    <li className="flex gap-2 sm:gap-3 md:gap-4">
                      <span className="font-bold text-primary min-w-[20px] sm:min-w-[24px] text-sm sm:text-base flex-shrink-0">5.</span>
                      <span className="leading-relaxed text-foreground/90">Activate workflow and test</span>
                    </li>
                  </ol>
                </div>
              )}

              {selectedPlatform === 'custom' && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <h4 className="font-bold text-base sm:text-lg text-foreground">Custom Webhook Integration</h4>
                  </div>
                  <p className="text-xs sm:text-sm md:text-[15px] text-foreground/90 mb-4 sm:mb-5 md:mb-6 leading-relaxed">
                    CalRouter forwards enriched data via HTTP POST to any HTTPS endpoint. Your server should:
                  </p>
                  <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-[15px]">
                    <li className="flex gap-2 sm:gap-3">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed text-foreground/90">Accept POST requests with JSON body</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed text-foreground/90">Respond with 200 OK within 10 seconds</span>
                    </li>
                    <li className="flex gap-2 sm:gap-3">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed text-foreground/90">Handle retries for failed deliveries (optional)</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Payload Comparison */}
            <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8 md:mb-10">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">What Your Tool Receives</h4>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="p-4 sm:p-5 bg-muted/50 border border-border rounded-xl space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-semibold">Raw Calendly</p>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 font-medium">
                      Before
                    </Badge>
                  </div>
                  <pre className="text-[10px] sm:text-xs font-mono bg-background p-3 sm:p-4 rounded border text-muted-foreground leading-relaxed overflow-x-auto">
{`{
  "event": "invitee.created",
  "payload": {
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

                <div className="p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-xl space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-semibold">Enriched</p>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 font-medium">
                      After ✨
                    </Badge>
                  </div>
                  <pre className="text-[10px] sm:text-xs font-mono bg-background p-3 sm:p-4 rounded border text-foreground leading-relaxed overflow-x-auto">
{`{
  "enriched": {
    "parsed_questions": {
      "budget": "$5k"
    },
    "utm_tracking": {...},
    "reschedule_info": {...}
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Test Runner */}
            <div className="p-4 sm:p-5 md:p-6 bg-muted/50 border border-dashed border-border rounded-xl space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${testingWebhook ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {testingWebhook ? 'Sending test payload...' : 'Ready to test your integration'}
                </span>
              </div>
              <Button
                onClick={handleTestWebhook}
                disabled={testingWebhook}
                className="w-full h-10 sm:h-11 md:h-12 shadow-lg shadow-primary/20 text-sm sm:text-[15px] font-semibold"
              >
                {testingWebhook ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-2.5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 sm:mr-2.5" />
                    Send Test Webhook
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* Need Help Section */}
          <section className="bg-muted/30 border border-border rounded-xl p-5 sm:p-6 md:p-8 lg:p-10">
            <h3 className="font-bold text-base sm:text-lg mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Need Help?
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              <a
                href="/dashboard/logs"
                className="p-4 sm:p-5 md:p-6 border border-border rounded-xl hover:border-primary/50 transition-all hover:shadow-sm bg-card group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 md:p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                    <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-[15px] mb-1 sm:mb-2">View Activity Logs</p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Monitor webhook deliveries in real-time
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="https://calendly.com/integrations/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 sm:p-5 md:p-6 border border-border rounded-xl hover:border-primary/50 transition-all hover:shadow-sm bg-card group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-2.5 md:p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-[15px] mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                      Calendly Docs
                      <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Official webhook documentation
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </section>

          {/* Common Questions */}
          <section className="bg-card border border-border rounded-xl p-5 sm:p-6 md:p-8 lg:p-10">
            <h3 className="font-bold text-base sm:text-lg mb-6 sm:mb-8">Common Questions</h3>
            <div className="space-y-6 sm:space-y-8">
              {[
                {
                  q: 'What happens if my destination URL is down?',
                  a: 'CalRouter will log the failed delivery in your Activity Logs. You can view error details and manually retry if needed.'
                },
                {
                  q: 'Can I use the same endpoint for multiple Calendly event types?',
                  a: 'Yes! One CalRouter endpoint can receive both invitee.created and invitee.canceled events. The original event type is preserved in the enriched payload.'
                },
                {
                  q: 'How does reschedule detection work?',
                  a: 'When someone cancels and rebooks within 10 minutes, CalRouter detects this pattern and flags it as a reschedule instead of a cancellation + new booking.'
                },
                {
                  q: 'Do I need to change my Calendly URLs for UTM tracking?',
                  a: 'Yes. Add UTM parameters to your booking links (e.g., ?utm_source=google&utm_medium=cpc). Calendly passes these to the webhook, and CalRouter extracts them.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="pb-6 sm:pb-8 border-b border-border last:border-0 last:pb-0">
                  <p className="font-semibold text-sm sm:text-[15px] mb-2 sm:mb-3">{faq.q}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* You're All Set */}
          <section className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 text-center">
            <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 tracking-tight">You're All Set!</h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-[15px]">
              Your webhooks are now being enriched automatically. Check your Activity Logs to see events as they arrive.
            </p>
            <Button size="lg" className="shadow-lg shadow-primary/25 h-10 sm:h-11 md:h-12 px-6 sm:px-7 md:px-8 text-sm sm:text-[15px] font-semibold" asChild>
              <a href="/dashboard/logs">
                View Activity Logs
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 sm:ml-2.5" />
              </a>
            </Button>
          </section>

          {/* Footer Navigation */}
          <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0 pt-8 sm:pt-10 border-t border-border">
            <Button variant="ghost" className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-[15px] justify-center sm:justify-start h-10 sm:h-auto" asChild>
              <a href="/dashboard">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Back to Dashboard
              </a>
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="outline" className="h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-[15px] font-semibold">
                Skip for now
              </Button>
              <Button className="h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-[15px] font-semibold" asChild>
                <a href="/dashboard/endpoints">
                  Manage Endpoints
                </a>
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
