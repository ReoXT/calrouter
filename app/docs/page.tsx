'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Book,
  Webhook,
  Code,
  Zap,
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Home,
  Filter,
  Calendar,
  Target,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    subsections: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: `CalRouter is a webhook enrichment and routing service specifically designed for Calendly. It solves common pain points when integrating Calendly with automation tools like Zapier, Make, and n8n.

**What CalRouter Does:**
- Parses custom questions into clean key-value pairs
- Detects rescheduled meetings automatically
- Extracts and preserves UTM tracking parameters
- Routes webhooks to multiple destinations based on rules
- Provides detailed logging and analytics

**Why Use CalRouter?**
Calendly's native webhooks send raw, nested JSON that requires complex parsing. CalRouter enriches this data automatically, saving you hours of building custom formatters and preventing lost attribution data.`,
      },
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        content: `Get started with CalRouter in under 5 minutes:

**Step 1: Create an Endpoint**
1. Sign in to your CalRouter dashboard
2. Click "Create Endpoint" in the Endpoints section
3. Give it a descriptive name (e.g., "VIP Consultations")
4. Enable desired enrichment features
5. Click "Create"

**Step 2: Get Your Webhook URL**
After creating an endpoint, you'll receive a unique webhook URL:
\`https://calrouter.app/api/webhook/calendly/[your-endpoint-id]\`

**Step 3: Add to Calendly**
1. Go to Calendly Settings → Webhooks
2. Click "Add Webhook Subscription"
3. Paste your CalRouter webhook URL
4. Select event types to monitor (invitee.created, invitee.canceled, etc.)
5. Save

**Step 4: Configure Destination**
1. Get your destination webhook URL from Zapier/Make/n8n
2. Add it to your CalRouter endpoint's "Destination URL" field
3. Save changes

You're done! CalRouter will now enrich and forward all Calendly webhooks automatically.`,
      },
      {
        id: 'installation',
        title: 'Installation & Setup',
        content: `**Account Creation:**
1. Visit [calrouter.app](https://calrouter.app)
2. Sign up with email or Google
3. Verify your email address
4. You'll start with a 14-day free trial (no credit card required)

**First-Time Configuration:**
Before creating endpoints, ensure you have:
- Active Calendly account with webhook access
- Destination tool setup (Zapier, Make, n8n, or custom webhook receiver)
- Understanding of which Calendly event types you want to monitor

**Subscription Plans:**
- **Free Trial**: 14 days, all features included
- **Pro Plan**: $29/month or $24/month (annual)
  - Unlimited endpoints
  - Unlimited webhook processing
  - All enrichment features
  - 90-day log retention
  - Priority support`,
      },
    ],
  },
  {
    id: 'enrichment-features',
    title: 'Enrichment Features',
    icon: Zap,
    subsections: [
      {
        id: 'reschedule-detection',
        title: 'Reschedule Detection',
        content: `CalRouter automatically identifies when someone reschedules a meeting instead of simply canceling.

**How It Works:**
When a booking is canceled and a new one is created by the same email within 10 minutes, CalRouter flags the new booking as a reschedule.

**Detection Logic:**
1. User cancels meeting → CalRouter logs cancellation
2. Same user books new time within 10 minutes
3. CalRouter checks for recent cancellation by email
4. Different event UUID = reschedule detected
5. Original cancellation ID linked in enriched data

**Example Enriched Data:**`,
        example: {
          original: {
            event: 'invitee.created',
            payload: {
              email: 'john@example.com',
              event_type: '30 Min Meeting',
            },
          },
          enriched: {
            reschedule_info: {
              isReschedule: true,
              cancellationId: 'abc123',
              detectedAt: '2024-01-15T10:30:00Z',
            },
          },
        },
        notes: `**Use Cases:**
- Identify high-intent leads (reschedulers vs. cancelers)
- Send different follow-up sequences
- Track customer commitment levels
- Improve show-up rate predictions

**Important Notes:**
- 10-minute detection window (configurable on request)
- Works across all endpoints for same user
- Requires email matching (exact match only)
- Won't detect reschedules to different event types`,
      },
      {
        id: 'question-parsing',
        title: 'Question Parsing',
        content: `CalRouter converts Calendly's nested custom questions into clean, flat key-value pairs that are easy to use in automation tools.

**How It Works:**
Calendly sends questions as an array of objects. CalRouter normalizes question text into clean keys and extracts answers.

**Transformation Process:**
1. Extract questions_and_answers array
2. Normalize question text (lowercase, remove special chars)
3. Convert spaces to underscores
4. Truncate to 50 characters max
5. Map to answer values

**Example Transformation:**`,
        example: {
          original: {
            questions_and_answers: [
              { question: 'What is your budget?', answer: '$5,000 - $10,000' },
              { question: 'How did you hear about us?', answer: 'Google Search' },
              {
                question: 'What are your biggest challenges?',
                answer: 'Lead generation and tracking',
              },
            ],
          },
          enriched: {
            parsed_questions: {
              what_is_your_budget: '$5,000 - $10,000',
              how_did_you_hear_about_us: 'Google Search',
              what_are_your_biggest_challenges: 'Lead generation and tracking',
            },
          },
        },
        notes: `**Key Normalization Rules:**
- All lowercase
- Special characters removed
- Spaces replaced with underscores
- Max 50 characters
- Duplicate questions: last answer wins

**Use Cases:**
- Qualify leads automatically
- Route to different destinations based on answers
- Pre-fill CRM fields
- Trigger conditional workflows

**Best Practices:**
- Keep questions short and clear
- Avoid special characters in questions
- Use unique question text
- Test with sample data before going live`,
      },
      {
        id: 'utm-tracking',
        title: 'UTM Tracking',
        content: `CalRouter preserves marketing attribution data from Calendly booking URLs, ensuring you never lose lead source information.

**How It Works:**
When users book via URLs with UTM parameters, Calendly includes tracking data in webhooks. CalRouter extracts and normalizes this data.

**Supported Parameters:**
- utm_source (e.g., google, facebook, newsletter)
- utm_medium (e.g., cpc, email, social)
- utm_campaign (e.g., spring-sale, webinar-2024)
- utm_term (e.g., calendly alternative)
- utm_content (e.g., ad-variant-a)

**Example Enriched Data:**`,
        example: {
          original: {
            payload: {
              tracking: {
                utm_source: 'google',
                utm_medium: 'cpc',
                utm_campaign: 'spring_sale_2024',
              },
            },
          },
          enriched: {
            utm_tracking: {
              utm_source: 'google',
              utm_medium: 'cpc',
              utm_campaign: 'spring_sale_2024',
              utm_term: null,
              utm_content: null,
            },
          },
        },
        notes: `**Setup Requirements:**
1. Add UTM parameters to your Calendly booking URLs
2. Enable UTM tracking in CalRouter endpoint settings
3. Calendly will include tracking data in webhooks

**Example Booking URL:**
\`https://calendly.com/yourname/30min?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale\`

**Use Cases:**
- Attribute conversions to marketing channels
- Calculate ROI per campaign
- Segment leads by source
- Personalize follow-up based on origin

**Important Notes:**
- UTMs must be in booking URL (not visitor's browser)
- Calendly may not include all parameters
- Missing parameters return null (not undefined)
- Case-sensitive parameter names`,
      },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code,
    subsections: [
      {
        id: 'webhook-url-format',
        title: 'Webhook URL Format',
        content: `Each CalRouter endpoint has a unique webhook URL that receives Calendly events.

**URL Structure:**
\`https://calrouter.app/api/webhook/calendly/[endpoint-id]\`

**Components:**
- **Base URL**: \`https://calrouter.app/api/webhook/calendly\`
- **Endpoint ID**: Unique UUID generated when endpoint is created
- **Protocol**: HTTPS only (HTTP not supported)

**Example:**
\`https://calrouter.app/api/webhook/calendly/550e8400-e29b-41d4-a716-446655440000\`

**Security:**
- Each endpoint ID is a random UUID (v4)
- URLs are not guessable
- No authentication required (Calendly doesn't support it)
- Rate limited: 100 requests/minute per endpoint`,
        example: {
          method: 'POST',
          url: 'https://calrouter.app/api/webhook/calendly/550e8400-e29b-41d4-a716-446655440000',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Calendly-Webhook/1.0',
          },
        },
      },
      {
        id: 'payload-structure',
        title: 'Payload Structure',
        content: `CalRouter receives Calendly's original payload and enriches it before forwarding.

**Received from Calendly:**
Standard Calendly webhook format with event type and nested payload data.

**Forwarded to Destination:**
Original payload plus enriched data in a structured format.

**Enriched Payload Structure:**`,
        example: {
          original: {
            event: 'invitee.created',
            time: '2024-01-15T10:30:00Z',
            payload: {
              email: 'john@example.com',
              name: 'John Doe',
              event_type: { name: '30 Min Meeting' },
              questions_and_answers: [
                { question: 'What is your budget?', answer: '$5k' },
              ],
              tracking: {
                utm_source: 'google',
                utm_medium: 'cpc',
              },
            },
          },
          enriched: {
            parsed_questions: {
              what_is_your_budget: '$5k',
            },
            reschedule_info: {
              isReschedule: false,
            },
            utm_tracking: {
              utm_source: 'google',
              utm_medium: 'cpc',
              utm_campaign: null,
              utm_term: null,
              utm_content: null,
            },
            enriched_at: '2024-01-15T10:30:01Z',
          },
          metadata: {
            calendly_event_uuid: 'abc123',
            invitee_email: 'john@example.com',
            event_type: 'invitee.created',
            endpoint_id: '550e8400-e29b-41d4-a716-446655440000',
            endpoint_name: 'VIP Consultations',
          },
        },
        notes: `**Field Descriptions:**
- \`original\`: Unmodified Calendly webhook payload
- \`enriched\`: CalRouter-added data
- \`metadata\`: CalRouter tracking information

**Conditional Fields:**
- \`parsed_questions\`: Only if questions exist and parsing enabled
- \`reschedule_info\`: Only if detection enabled
- \`utm_tracking\`: Only if tracking enabled

**Null vs Missing:**
- Disabled features: field not present
- Enabled but no data: field present with null value`,
      },
      {
        id: 'response-codes',
        title: 'Response Codes',
        content: `CalRouter returns standard HTTP status codes to Calendly and your destination endpoint.

**Success Responses:**`,
        example: {
          '200 OK': {
            description: 'Webhook received and processed successfully',
            body: { ok: true, processed: true },
          },
          '200 OK (Duplicate)': {
            description: 'Duplicate webhook detected (already processed)',
            body: { ok: true, duplicate: true },
          },
        },
        notes: `**Error Responses:**

**404 Not Found**
- Endpoint ID doesn't exist
- Endpoint has been deleted
- Invalid URL format

**429 Too Many Requests**
- Rate limit exceeded (100 req/min)
- Retry after 60 seconds
- Calendly will retry automatically

**500 Internal Server Error**
- Unexpected processing error
- Database connection issues
- CalRouter will investigate automatically

**Important Notes:**
- CalRouter always returns 200 to Calendly (prevents retry loops)
- Errors are logged internally for debugging
- Destination endpoint errors don't affect Calendly response
- Failed forwards are logged with error details`,
      },
    ],
  },
  {
    id: 'integration-guides',
    title: 'Integration Guides',
    icon: Webhook,
    subsections: [
      {
        id: 'zapier-setup',
        title: 'Zapier Integration',
        content: `Connect CalRouter to Zapier to use enriched Calendly data in your Zaps.

**Step 1: Create a Zapier Webhook**
1. In Zapier, create a new Zap
2. Choose "Webhooks by Zapier" as the trigger
3. Select "Catch Hook" event
4. Copy the webhook URL (e.g., \`https://hooks.zapier.com/hooks/catch/123456/abcdef/\`)

**Step 2: Add to CalRouter**
1. Go to CalRouter Endpoints
2. Create new endpoint or edit existing
3. Paste Zapier webhook URL in "Destination URL"
4. Enable desired enrichment features
5. Save endpoint

**Step 3: Test the Connection**
1. Copy your CalRouter webhook URL
2. Use "Test Webhook" button in CalRouter
3. Check Zapier for received data
4. Click "Continue" in Zapier once test received

**Step 4: Use Enriched Data**
Access CalRouter fields in Zapier:
- \`enriched__parsed_questions__[question_key]\`
- \`enriched__reschedule_info__isReschedule\`
- \`enriched__utm_tracking__utm_source\`

**Example Zap Actions:**`,
        example: {
          trigger: 'CalRouter webhook (via Webhooks by Zapier)',
          conditions: [
            {
              field: 'enriched__reschedule_info__isReschedule',
              condition: 'equals',
              value: 'true',
            },
          ],
          action: 'Send Slack message: "Rescheduled meeting detected"',
        },
        notes: `**Pro Tips:**
- Use Zapier's Filter step to route by enriched data
- Access nested fields with double underscores
- Test with real Calendly bookings before going live
- Enable Zapier's "Catch Raw Hook" for debugging

**Common Issues:**
- **Data not appearing**: Check enrichment features are enabled
- **Wrong field path**: Use double underscores for nested objects
- **Missing data**: Verify Calendly sends that field (check logs)`,
      },
      {
        id: 'make-setup',
        title: 'Make.com Integration',
        content: `Integrate CalRouter with Make (formerly Integromat) for powerful automation workflows.

**Step 1: Create a Webhook Module**
1. In Make, create a new scenario
2. Add "Webhooks" module as the first step
3. Choose "Custom webhook"
4. Create new webhook or select existing
5. Copy the webhook URL

**Step 2: Configure CalRouter**
1. Create CalRouter endpoint
2. Paste Make webhook URL in "Destination URL"
3. Enable enrichment features as needed
4. Save endpoint

**Step 3: Test & Structure Data**
1. Click "Redetermine data structure" in Make
2. Trigger a test webhook from CalRouter
3. Make will capture the structure automatically
4. Click "OK" to save structure

**Step 4: Build Your Scenario**
Use CalRouter enriched data in Make modules:
- Router module: Branch by \`enriched.reschedule_info.isReschedule\`
- Set variables from \`enriched.parsed_questions\`
- Filter by \`enriched.utm_tracking.utm_source\`

**Example Scenario:**`,
        example: {
          modules: [
            { step: 1, type: 'Webhook', name: 'Receive from CalRouter' },
            {
              step: 2,
              type: 'Router',
              branches: [
                {
                  name: 'New Booking',
                  filter: 'enriched.reschedule_info.isReschedule = false',
                },
                {
                  name: 'Rescheduled',
                  filter: 'enriched.reschedule_info.isReschedule = true',
                },
              ],
            },
            { step: 3, type: 'Google Sheets', name: 'Add row with parsed questions' },
            { step: 4, type: 'Gmail', name: 'Send welcome email' },
          ],
        },
        notes: `**Pro Tips:**
- Use Make's visual router for conditional logic
- Map enriched fields directly to CRM/spreadsheet columns
- Set up error handlers for failed forwards
- Use Make's data store to prevent duplicate processing

**Advanced Usage:**
- Combine multiple CalRouter endpoints in one scenario
- Use Make's aggregator with CalRouter logs
- Set up automatic retry for failed destination forwards`,
      },
      {
        id: 'n8n-setup',
        title: 'n8n Integration',
        content: `Connect CalRouter to n8n for self-hosted or cloud automation workflows.

**Step 1: Create Webhook Node**
1. Create new workflow in n8n
2. Add "Webhook" node as trigger
3. Set method to POST
4. Choose "Webhook" authentication: None
5. Copy the webhook URL (Production or Test)

**Step 2: Add to CalRouter**
1. Go to CalRouter dashboard
2. Create endpoint with n8n webhook URL as destination
3. Enable enrichment features
4. Save and copy CalRouter webhook URL

**Step 3: Configure Calendly**
1. Add CalRouter webhook URL to Calendly
2. Select event types to monitor
3. Save webhook subscription

**Step 4: Build Workflow**
Access enriched data in n8n expressions:
\`{{ $json.enriched.parsed_questions }}\`
\`{{ $json.enriched.reschedule_info.isReschedule }}\`
\`{{ $json.enriched.utm_tracking.utm_source }}\`

**Example Workflow:**`,
        example: {
          nodes: [
            { name: 'Webhook Trigger', type: 'n8n-nodes-base.webhook' },
            {
              name: 'Check if Reschedule',
              type: 'n8n-nodes-base.if',
              condition: '{{ $json.enriched.reschedule_info.isReschedule }}',
            },
            {
              name: 'Add to Airtable',
              type: 'n8n-nodes-base.airtable',
              mapping: {
                Email: '{{ $json.original.payload.email }}',
                Budget: '{{ $json.enriched.parsed_questions.what_is_your_budget }}',
                Source: '{{ $json.enriched.utm_tracking.utm_source }}',
              },
            },
          ],
        },
        notes: `**n8n-Specific Tips:**
- Use "Edit Fields" node to flatten enriched data
- Set up "Error Trigger" node for failed webhooks
- Use n8n's credentials system for API calls
- Enable "Always Output Data" for debugging

**Self-Hosted n8n:**
- Ensure publicly accessible URL for webhooks
- Use HTTPS (required by CalRouter)
- Configure reverse proxy (nginx/Caddy) correctly
- Set up SSL certificates (Let's Encrypt)`,
      },
    ],
  },
  {
    id: 'faqs',
    title: 'Frequently Asked Questions',
    icon: HelpCircle,
    subsections: [
      {
        id: 'general-faqs',
        title: 'General Questions',
        content: `**How is billable usage calculated?**
Usage is calculated based on the number of unique webhook events received by our ingress endpoints. Retries and internal routing steps do not count towards your monthly quota. We offer a generous free tier of 10k events/month during trial.

**Can I use a custom domain for my webhook URLs?**
Currently, all webhook URLs use the \`calrouter.app\` domain. Custom domain support is on our roadmap for Enterprise plans.

**What is the maximum payload size supported?**
The standard maximum payload size is 5MB for JSON bodies. Calendly webhooks are typically under 50KB, so this should not be a concern. If you need larger payload support, contact our support team.

**How long are logs retained?**
Log retention varies by plan:
- Free trial: 7 days of retention
- Pro plan: 90 days of searchable logs
- Enterprise (future): 1 year of retention

**Can I filter webhooks by event type in Calendly?**
Yes, when configuring your Calendly webhook, you can select which event types to send:
- invitee.created (new bookings)
- invitee.canceled (cancellations)
- invitee_no_show.created (no-shows)
- invitee_no_show.deleted (no-show removed)

Note: You cannot filter by booking type (like "30 Min Meeting") in Calendly. Use multiple CalRouter endpoints for different handling.`,
      },
      {
        id: 'technical-faqs',
        title: 'Technical Questions',
        content: `**What happens if my destination endpoint is down?**
CalRouter will attempt to forward the webhook with a 10-second timeout. If it fails:
1. Error is logged with details
2. You can view error in webhook logs
3. Webhook can be replayed manually from logs (coming soon)
4. After 3 consecutive failures, you'll receive an email alert

**Does CalRouter retry failed webhooks?**
Currently, CalRouter logs failures but does not automatically retry. You can manually replay webhooks from the logs dashboard (feature in development). Calendly will retry if CalRouter returns an error, but we always return 200 OK to prevent retry loops.

**Can I send webhooks to multiple destinations?**
Not directly from a single endpoint. However, you can:
1. Create multiple endpoints with the same Calendly webhook
2. Use your automation tool's built-in routing (e.g., Zapier Paths)
3. Contact us about Enterprise multi-routing features

**How does reschedule detection work across event types?**
Reschedule detection is email-based and works across all event types. If someone cancels a "30 Min Meeting" and books a "60 Min Consultation" within 10 minutes, it will be flagged as a reschedule.

**What if two people book with the same email?**
Each booking is treated independently. Reschedule detection requires:
- Same email address
- Recent cancellation (within 10 minutes)
- Different event UUID

If two people share an email and both book, this won't be flagged as a reschedule unless one cancels first.`,
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: AlertCircle,
    subsections: [
      {
        id: 'common-issues',
        title: 'Common Issues',
        content: `**Webhook not appearing in CalRouter logs:**
1. Verify CalRouter webhook URL is correctly added to Calendly
2. Check that event type is selected in Calendly webhook settings
3. Ensure endpoint is "Active" in CalRouter dashboard
4. Test with a real Calendly booking (not just save)
5. Check Calendly webhook status page for delivery errors

**Enriched data fields are null:**
1. Verify enrichment features are enabled in endpoint settings
2. For questions: Ensure event type has custom questions configured
3. For UTMs: Check that booking URL included UTM parameters
4. For reschedule: Requires a cancellation within 10 minutes
5. Check webhook logs "Original Payload" to see what Calendly sent

**Destination endpoint not receiving webhooks:**
1. Verify destination URL is correct and publicly accessible
2. Check destination endpoint accepts POST requests
3. Verify destination supports JSON content type
4. Check CalRouter logs for error messages
5. Test destination URL independently with a tool like Postman

**Questions parsing incorrectly:**
1. Check for special characters in question text
2. Verify questions are under 50 characters after normalization
3. Look for duplicate question text (last answer wins)
4. Check webhook logs for parsed output
5. Contact support if normalization is removing important context`,
      },
      {
        id: 'debugging-tips',
        title: 'Debugging Tips',
        content: `**Use the Webhook Logs:**
The logs dashboard is your best debugging tool:
1. Click "View" on any log entry
2. Check "Original Payload" tab for what Calendly sent
3. Check "Enriched Payload" tab for CalRouter's output
4. Check "Parsed Data" tab for human-readable format
5. Look for error messages in the Status column

**Test Endpoint Feature:**
Use the "Test" button on any endpoint:
1. Sends a sample webhook to your destination
2. Shows exact payload that will be forwarded
3. Displays response from destination endpoint
4. Helps verify destination URL is working

**Check Calendly Webhook Status:**
In Calendly webhook settings:
1. View delivery history for each webhook subscription
2. Check for failed deliveries (red indicators)
3. See response codes from CalRouter
4. Verify event types are triggering

**Enable Detailed Logging:**
For complex debugging:
1. Create a temporary endpoint
2. Use a webhook testing tool as destination (e.g., webhook.site)
3. Trigger real Calendly event
4. Inspect exact payload received
5. Compare with CalRouter logs`,
      },
      {
        id: 'getting-help',
        title: 'Getting Help',
        content: `**Support Channels:**

**Email Support**
support@calrouter.app
- Response time: 24-48 hours
- Include: endpoint ID, webhook log ID, error details

**Documentation**
You're reading it! Search above for specific topics.

**Status Page**
status.calrouter.app
- Real-time system status
- Scheduled maintenance notifications
- Historical uptime data

**Feature Requests**
feedback@calrouter.app
- Request new enrichment features
- Suggest integration improvements
- Vote on roadmap items

**What to Include in Support Requests:**
1. Endpoint ID (from endpoint settings)
2. Webhook log ID (if applicable)
3. Expected vs actual behavior
4. Screenshots of configuration
5. Sample payload (remove sensitive data)
6. Steps to reproduce issue

**Emergency Issues:**
For critical production issues (webhooks completely stopped):
- Email: urgent@calrouter.app
- Include "URGENT" in subject line
- Response time: 4 hours (business hours)`,
      },
    ],
  },
];

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredSections = sections
    .map((section) => ({
      ...section,
      subsections: section.subsections.filter(
        (sub) =>
          sub.title.toLowerCase().includes(search.toLowerCase()) ||
          sub.content.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.subsections.length > 0);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: any; id: string }) => {
    const codeString = JSON.stringify(code, null, 2);
    return (
      <Card className="p-4 bg-muted relative group">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => copyToClipboard(codeString, id)}
        >
          {copiedCode === id ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
        <pre className="font-mono text-xs overflow-x-auto pr-12">
          <code>{codeString}</code>
        </pre>
      </Card>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r bg-card hidden md:flex flex-col h-full overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <Webhook className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-tight tracking-tight">
                CalRouter
              </h1>
              <p className="text-muted-foreground text-[11px] font-normal uppercase tracking-wider">
                Documentation
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-[18px] h-[18px]" />
              <Input
                className="w-full h-9 pl-9 pr-3 bg-background"
                placeholder="Search documentation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id}>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {section.subsections.map((subsection) => (
                      <li key={subsection.id}>
                        <button
                          onClick={() => setActiveSection(subsection.id)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm border-l-2 transition-colors w-full text-left ${
                            activeSection === subsection.id
                              ? 'bg-primary/10 text-primary font-medium border-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent border-transparent'
                          }`}
                        >
                          <span>{subsection.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>

          {/* Back to App */}
          <div className="p-4 border-t">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex-shrink-0 border-b flex items-center justify-between px-8 bg-card/80 backdrop-blur-md sticky top-0 z-20">
          <nav className="flex text-sm font-medium text-muted-foreground">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  <Home className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <ChevronRight className="w-4 h-4" />
              </li>
              <li>
                <span className="text-foreground">Documentation</span>
              </li>
            </ol>
          </nav>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/setup">
                <Book className="w-4 h-4 mr-2" />
                Setup Guide
              </Link>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="max-w-4xl mx-auto flex flex-col gap-10 pb-12">
            {/* Hero */}
            <section className="text-center py-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                CalRouter Documentation
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to configure webhook enrichment, set up
                routing rules, and integrate CalRouter with your automation
                stack.
              </p>
            </section>

            {/* Content Sections */}
            {filteredSections.map((section) => (
              <div key={section.id} className="space-y-8">
                {section.subsections.map((subsection) => (
                  <section
                    key={subsection.id}
                    id={subsection.id}
                    className={`scroll-mt-20 ${
                      activeSection === subsection.id ? '' : ''
                    }`}
                  >
                    <Card className="p-8 space-y-6 border-2 hover:border-primary/20 transition-colors">
                      {/* Title */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {section.id === 'getting-started' && (
                            <Book className="w-5 h-5 text-primary" />
                          )}
                          {section.id === 'enrichment-features' &&
                            subsection.id === 'reschedule-detection' && (
                              <Calendar className="w-5 h-5 text-primary" />
                            )}
                          {section.id === 'enrichment-features' &&
                            subsection.id === 'question-parsing' && (
                              <Filter className="w-5 h-5 text-primary" />
                            )}
                          {section.id === 'enrichment-features' &&
                            subsection.id === 'utm-tracking' && (
                              <Target className="w-5 h-5 text-primary" />
                            )}
                          {section.id === 'api-reference' && (
                            <Code className="w-5 h-5 text-primary" />
                          )}
                          {section.id === 'integration-guides' && (
                            <Zap className="w-5 h-5 text-primary" />
                          )}
                          {section.id === 'faqs' && (
                            <HelpCircle className="w-5 h-5 text-primary" />
                          )}
                          {section.id === 'troubleshooting' && (
                            <AlertCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <h2 className="text-2xl font-bold">
                          {subsection.title}
                        </h2>
                      </div>

                      {/* Content */}
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {subsection.content.split('\n\n').map((paragraph, i) => {
                          // Handle headers
                          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                              <h3
                                key={i}
                                className="text-lg font-semibold mt-6 mb-3"
                              >
                                {paragraph.replace(/\*\*/g, '')}
                              </h3>
                            );
                          }

                          // Handle code blocks
                          if (paragraph.startsWith('`') && paragraph.endsWith('`')) {
                            const code = paragraph.replace(/`/g, '');
                            return (
                              <Card key={i} className="p-4 bg-muted my-4">
                                <pre className="font-mono text-sm overflow-x-auto">
                                  <code>{code}</code>
                                </pre>
                              </Card>
                            );
                          }

                          // Handle lists
                          if (paragraph.includes('\n-') || paragraph.includes('\n*')) {
                            const items = paragraph
                              .split('\n')
                              .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('*'))
                              .map((line) => line.replace(/^[\-\*]\s*/, ''));
                            const header = paragraph.split('\n')[0];

                            return (
                              <div key={i} className="my-4">
                                {!header.startsWith('-') && !header.startsWith('*') && (
                                  <p className="mb-2">{header}</p>
                                )}
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                  {items.map((item, j) => (
                                    <li key={j} className="text-muted-foreground">
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          }

                          // Handle numbered lists
                          if (/^\d+\./.test(paragraph)) {
                            const items = paragraph
                              .split('\n')
                              .filter((line) => /^\d+\./.test(line.trim()));

                            return (
                              <ol key={i} className="list-decimal list-inside space-y-1 ml-4 my-4">
                                {items.map((item, j) => (
                                  <li key={j} className="text-muted-foreground">
                                    {item.replace(/^\d+\.\s*/, '')}
                                  </li>
                                ))}
                              </ol>
                            );
                          }

                          // Regular paragraphs
                          return (
                            <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>

                      {/* Example Code Blocks */}
                      {subsection.example && (
                        <div className="space-y-4 mt-6">
                          {/* Original/Before and Enriched/After comparison */}
                          {subsection.example.original && subsection.example.enriched ? (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-muted">
                                    Original
                                  </Badge>
                                </div>
                                <CodeBlock
                                  code={subsection.example.original}
                                  id={`${subsection.id}-original`}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-primary/10 text-primary border-primary/20">
                                    Enriched
                                  </Badge>
                                </div>
                                <CodeBlock
                                  code={subsection.example.enriched}
                                  id={`${subsection.id}-enriched`}
                                />
                              </div>
                            </div>
                          ) : (
                            <CodeBlock
                              code={subsection.example}
                              id={subsection.id}
                            />
                          )}
                        </div>
                      )}

                      {/* Notes/Important callouts */}
                      {subsection.notes && (
                        <Card className="p-4 bg-primary/5 border-primary/20 mt-6">
                          <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="space-y-3 text-sm">
                              {subsection.notes.split('\n\n').map((note, i) => {
                                if (note.startsWith('**') && note.includes(':')) {
                                  const [title, ...content] = note.split('\n');
                                  return (
                                    <div key={i}>
                                      <p className="font-semibold mb-1">
                                        {title.replace(/\*\*/g, '')}
                                      </p>
                                      {content.map((line, j) => (
                                        <p key={j} className="text-muted-foreground">
                                          {line}
                                        </p>
                                      ))}
                                    </div>
                                  );
                                }
                                return (
                                  <p key={i} className="text-muted-foreground">
                                    {note}
                                  </p>
                                );
                              })}
                            </div>
                          </div>
                        </Card>
                      )}
                    </Card>
                  </section>
                ))}
              </div>
            ))}

            {/* No results */}
            {filteredSections.length === 0 && (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or browse all sections above
                </p>
              </Card>
            )}

            {/* Footer CTA */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="p-8 bg-gradient-to-br from-card to-background border-2 hover:border-primary/50 transition-all group">
                <div className="space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Still need help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our support team is available to assist with setup and
                    troubleshooting.
                  </p>
                  <Button className="w-full" asChild>
                    <a href="mailto:support@calrouter.app">
                      Contact Support
                    </a>
                  </Button>
                </div>
              </Card>

              <Card className="p-8 bg-gradient-to-br from-card to-background border-2 hover:border-primary/50 transition-all group">
                <div className="space-y-4 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <ExternalLink className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Ready to get started?</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first endpoint and start enriching Calendly
                    webhooks.
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/dashboard/endpoints">
                      Go to Endpoints
                    </Link>
                  </Button>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
