# CalRouter for Calendly - Refined Build Guide

## 📋 Project Overview

**What we're building:** Micro-SaaS that receives Calendly webhooks, enriches data (parses custom questions, detects reschedules, extracts UTM parameters), filters by event type, and routes to user-specified endpoints.

**Core value:** Solves Calendly + Zapier limitations: event filtering, reschedule detection, custom question parsing, UTM tracking.

**Target customer:** Coaches tracking lead sources, sales teams using qualification questions, agencies needing smart routing, anyone hitting Calendly's webhook limitations.

**Pricing:** $29/month - One plan with everything included.

---

## 🎨 Design System (From Your Theme)

**Colors:**
- Primary: Purple (`oklch(0.5854 0.2041 277.1173)`) - Use for CTAs, links, focus states
- Accent: Light purple/pink (`oklch(0.9376 0.0260 321.9388)`) - Use for highlights, badges
- Destructive: Orange-red (`oklch(0.6368 0.2078 25.3313)`) - Use for delete buttons, errors
- Border: Light gray (`oklch(0.8687 0.0043 56.3660)`)

**Typography:**
- Headings: Plus Jakarta Sans (--font-sans)
- Body: Plus Jakarta Sans
- Code/URLs: Roboto Mono (--font-mono)

**Spacing Scale:**
- Tight spacing: gap-4 (1rem)
- Standard: gap-6 (1.5rem)
- Loose: gap-8 (2rem)
- Section breaks: gap-12 (3rem)

**Border Radius:**
- Default: rounded-xl (1.25rem) - Use for cards, dialogs, buttons
- Small elements: rounded-lg - Use for badges, small buttons

**Shadows:**
- Cards: shadow-sm
- Dialogs: shadow-lg
- Hover states: shadow-md

---

## 🧩 Component Patterns

**Card Pattern:**
```tsx
<Card className="p-6 space-y-4 border-2">
  <div className="flex items-center justify-between">
    {/* Header */}
  </div>
  {/* Content */}
</Card>
```

**Form Field Pattern:**
```tsx
<div className="space-y-2">
  <Label>Field Name</Label>
  <Input />
  <p className="text-sm text-muted-foreground">Helper text</p>
</div>
```

**Stats Card Pattern:**
```tsx
<Card className="p-6">
  <div className="flex items-center gap-4">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">Label</p>
      <p className="text-2xl font-semibold">Value</p>
    </div>
  </div>
</Card>
```

**Badge Pattern:**
- Success: `<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">`
- Warning: `<Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">`

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Backend:** Next.js API Routes
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Payments:** Stripe
- **Deployment:** Vercel
---

## 📝 Build Prompts

### **PROMPT 1: Project Setup**

Create Next.js 14 project with TypeScript and Tailwind. Install these packages:

```bash
npm install @supabase/supabase-js @clerk/nextjs stripe zod react-hook-form @hookform/resolvers query-string @upstash/ratelimit @upstash/redis date-fns lucide-react recharts
```

Install shadcn components:
```bash
npx shadcn@latest add button card input label select textarea switch dialog dropdown-menu accordion badge alert skeleton tabs table toast
```

Create folder structure: `/app`, `/components`, `/lib`, `/types`, `/hooks`, `/lib/parsers`

---

### **PROMPT 2: Design System Setup**

Your globals.css already contains the theme. Verify these values are present:
- Primary purple: `oklch(0.5854 0.2041 277.1173)`
- Border radius: `1.25rem`
- Fonts: Plus Jakarta Sans, Roboto Mono

Create `/lib/design-tokens.ts`:
```typescript
export const spacing = {
  tight: 'gap-4',
  standard: 'gap-6',
  loose: 'gap-8',
  section: 'gap-12'
} as const;

export const cardStyles = 'p-6 space-y-4 border-2 rounded-xl shadow-sm';
export const formFieldStyles = 'space-y-2';
```

---

### **PROMPT 3: Landing Page - Hero Section**

Create `/app/page.tsx` with hero section:

**Structure:**
- Container: `max-w-6xl mx-auto px-4 py-16`
- Heading: `text-5xl font-bold tracking-tight` in Plus Jakarta Sans
- Subheading: `text-xl text-muted-foreground mt-4 max-w-2xl`
- CTA buttons: Primary button (purple), secondary button (outline)
- Spacing: `space-y-6` between elements

**Copy:**
- H1: "Stop wasting time parsing Calendly webhooks"
- H2: "Automatically detect reschedules, parse custom questions, and track lead sources. Get clean, enriched data—not messy JSON."
- Primary CTA: "Start Free Trial"
- Secondary CTA: "See How It Works"

**Visual:**
- Hero background: Subtle gradient using `bg-gradient-to-br from-primary/5 to-accent/5`
- No illustrations - focus on clear typography

---

### **PROMPT 4: Landing Page - Problem/Solution Section**

Create comparison section below hero:

**Layout:**
- Two columns: `grid md:grid-cols-2 gap-8`
- Each column in a Card with `p-8 space-y-4`

**Left Card (Before):**
- Title: "Before CalRouter" in `text-xl font-semibold`
- Badge: `<Badge variant="outline" className="bg-destructive/10">Problem</Badge>`
- List with X icons (lucide-react):
  - "Messy nested JSON"
  - "Hours building Zapier formatters"
  - "Lost attribution data"
  - "No reschedule detection"

**Right Card (After):**
- Title: "After CalRouter"
- Badge: `<Badge className="bg-primary/10 text-primary">Solution</Badge>`
- List with Check icons:
  - "Clean, structured data"
  - "Ready to use instantly"
  - "Never lose lead source"
  - "Automatic reschedule flags"

---

### **PROMPT 5: Landing Page - Features Grid**

Create 4-column features grid:

**Layout:**
- Container: `grid md:grid-cols-2 lg:grid-cols-4 gap-6`
- Each feature in Card: `p-6 space-y-3 text-center`

**Features:**
1. **Smart Event Filtering**
   - Icon: Filter (lucide-react) in `p-3 bg-primary/10 rounded-lg mx-auto w-fit`
   - Title: `text-lg font-semibold`
   - Description: `text-sm text-muted-foreground`

2. **Reschedule Detection**
   - Icon: Calendar
   - Text: "Identify rescheduled meetings automatically"

3. **Question Parsing**
   - Icon: ListChecks
   - Text: "Custom questions as clean key-value pairs"

4. **UTM Tracking**
   - Icon: Target
   - Text: "Never lose lead source attribution"

---

### **PROMPT 6: Landing Page - How It Works**

Create 4-step process section:

**Layout:**
- Steps in `space-y-8`
- Each step: `flex gap-4` with number badge and content

**Step Pattern:**
```tsx
<div className="flex gap-4">
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
    1
  </div>
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Step Title</h3>
    <p className="text-muted-foreground">Description</p>
  </div>
</div>
```

**Steps:**
1. "Connect your Calendly webhook"
2. "Configure enrichment rules"
3. "Add destination URLs"
4. "Receive enriched data automatically"

---

### **PROMPT 7: Landing Page - Pricing Card**

Create pricing section with monthly/annual toggle:

**Toggle:**
- Switch component with "Monthly" and "Annual" labels
- Badge showing "Save 17%" next to Annual
- State: `const [showAnnual, setShowAnnual] = useState(false)`

**Pricing Card:**
- Card: `max-w-md mx-auto p-8 border-2 border-primary space-y-6 text-center`
- Price: Show `$24` if annual, `$29` if monthly `text-5xl font-bold` and `text-muted-foreground` "/month"
- Subtext if annual: "$288 billed annually • Save $60/year"
- Features list with Check icons left-aligned within card
- CTA: "Start Free Trial" Full-width primary Button
- Footer: `text-sm text-muted-foreground` "14-day free trial. No credit card required."

Use Plus Jakarta Sans for price, muted-foreground for subtext.

---

### **PROMPT 8: Clerk Authentication**

Set up Clerk auth:

1. Create `middleware.ts` to protect `/dashboard/*` routes
2. Add ClerkProvider to root layout
3. Create `/sign-in/[[...sign-in]]/page.tsx` and `/sign-up/[[...sign-up]]/page.tsx`
4. Add user button to header (top-right) using Clerk's UserButton component
5. Create placeholder `/dashboard/page.tsx` showing "Welcome [user.firstName]"

Use shadcn Button for sign-in/up links. Keep UI minimal.

---

### **PROMPT 9: Database Schema**

Create Supabase schema in `/lib/supabase/schema.sql`:

**Tables:**

1. **users:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_users_clerk ON users(clerk_user_id);
```

2. **webhook_endpoints:**
```sql
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  enable_reschedule_detection BOOLEAN DEFAULT true,
  enable_utm_tracking BOOLEAN DEFAULT true,
  enable_question_parsing BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_endpoints_user ON webhook_endpoints(user_id);
CREATE INDEX idx_endpoints_active ON webhook_endpoints(is_active);
```

3. **webhook_logs:**
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  calendly_event_uuid TEXT NOT NULL,
  invitee_email TEXT,
  event_type TEXT NOT NULL,
  original_payload JSONB NOT NULL,
  enriched_payload JSONB,
  is_reschedule BOOLEAN DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL,
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_logs_endpoint ON webhook_logs(endpoint_id);
CREATE INDEX idx_logs_calendly_event ON webhook_logs(calendly_event_uuid);
CREATE INDEX idx_logs_created ON webhook_logs(created_at);
CREATE INDEX idx_logs_email ON webhook_logs(invitee_email);
```

Also create `/lib/supabase/client.ts` with Supabase client initialization.

---

### **PROMPT 10: Dashboard Layout**

Create `/app/dashboard/layout.tsx`:

**Structure:**
- Sidebar: Fixed left, `w-64 border-r bg-card p-6`
- Main content: `ml-64 p-8`
- Nav links using Next.js Link with active state

**Sidebar nav items:**
- Overview (Home icon)
- Endpoints (Webhook icon)
- Logs (ListFilter icon)
- Setup Guide (Book icon)
- Settings (Settings icon)
- Billing (CreditCard icon)

**Active state:**
```tsx
className={cn(
  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
  isActive 
    ? "bg-primary/10 text-primary font-medium" 
    : "text-muted-foreground hover:bg-accent"
)}
```

Use lucide-react icons. Keep spacing consistent with `space-y-2`.

---

### **PROMPT 11: Endpoints List Page**

Create `/app/dashboard/endpoints/page.tsx`:

**Empty State:**
- Show when no endpoints exist
- Card: `p-12 text-center space-y-4`
- Icon: Webhook (lucide-react) in `w-16 h-16 mx-auto text-muted-foreground`
- Text: "Create your first endpoint to start enriching webhooks"
- Button: "Create Endpoint"

**Populated State:**
- Grid: `space-y-4` (not grid-cols, stack vertically for detail)
- Each endpoint in Card with `p-6 space-y-4`

**Endpoint Card Structure:**
```tsx
<Card className="p-6 space-y-4 border-2 hover:border-primary/50 transition-colors">
  <div className="flex items-start justify-between">
    <div className="space-y-1">
      <h3 className="text-lg font-semibold">{endpoint.name}</h3>
      <p className="text-sm text-muted-foreground">
        {endpoint.webhook_count} webhooks received
      </p>
    </div>
    <Switch checked={endpoint.is_active} />
  </div>
  
  <div className="space-y-2">
    <Label className="text-xs text-muted-foreground">Webhook URL</Label>
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
      <code className="flex-1 truncate">
        https://calrouter.app/api/webhook/calendly/{endpoint.id}
      </code>
      <Button size="sm" variant="ghost">
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  </div>
  
  <div className="space-y-2">
    <Label className="text-xs text-muted-foreground">Destination</Label>
    <p className="text-sm font-mono truncate">{endpoint.destination_url}</p>
  </div>
  
  <div className="flex gap-2 flex-wrap">
    {endpoint.enable_reschedule_detection && (
      <Badge variant="outline" className="bg-primary/10 text-primary">
        Reschedule Detection
      </Badge>
    )}
    {endpoint.enable_utm_tracking && (
      <Badge variant="outline" className="bg-primary/10 text-primary">
        UTM Tracking
      </Badge>
    )}
    {endpoint.enable_question_parsing && (
      <Badge variant="outline" className="bg-primary/10 text-primary">
        Question Parsing
      </Badge>
    )}
  </div>
  
  <div className="flex gap-2 pt-2">
    <Button size="sm" variant="outline">Edit</Button>
    <Button size="sm" variant="outline">Test</Button>
    <Button size="sm" variant="outline" className="text-destructive">
      Delete
    </Button>
  </div>
</Card>
```

Fetch endpoints from Supabase with webhook counts using LEFT JOIN.

---

### **PROMPT 12: Create Endpoint Dialog**

Create `/components/create-endpoint-dialog.tsx`:

**Dialog Structure:**
- Trigger: Button with Plus icon
- Dialog: `max-w-2xl`
- DialogHeader, DialogTitle, DialogDescription
- Form with react-hook-form + zod

**Form Fields (in `space-y-6`):**

1. **Endpoint Name:**
```tsx
<div className="space-y-2">
  <Label>Endpoint Name</Label>
  <Input placeholder="e.g., VIP Consultations" />
  <p className="text-xs text-muted-foreground">
    A friendly name to identify this endpoint
  </p>
</div>
```

2. **Destination URL:**
```tsx
<div className="space-y-2">
  <Label>Destination Webhook URL</Label>
  <Input placeholder="https://hooks.zapier.com/..." />
  <p className="text-xs text-muted-foreground">
    Where enriched data will be forwarded (Zapier, Make, n8n, etc.)
  </p>
</div>
```

3. **Enrichment Features:**
```tsx
<div className="space-y-4 p-4 bg-accent/20 rounded-lg">
  <Label className="text-base font-semibold">Enrichment Features</Label>
  
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-sm font-medium">Reschedule Detection</p>
      <p className="text-xs text-muted-foreground">
        Detect when someone reschedules instead of canceling
      </p>
    </div>
    <Switch defaultChecked />
  </div>
  
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-sm font-medium">UTM Tracking</p>
      <p className="text-xs text-muted-foreground">
        Extract lead source data from booking URLs
      </p>
    </div>
    <Switch defaultChecked />
  </div>
  
  <div className="flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-sm font-medium">Question Parsing</p>
      <p className="text-xs text-muted-foreground">
        Convert custom questions to clean format
      </p>
    </div>
    <Switch defaultChecked />
  </div>
</div>
```

4. **Active Status:**
```tsx
<div className="flex items-center justify-between">
  <Label>Active</Label>
  <Switch defaultChecked />
</div>
```

**Validation (zod):**
```typescript
const schema = z.object({
  name: z.string().min(1, "Name required").max(100),
  destination_url: z.string().url("Must be valid HTTPS URL").startsWith("https://"),
  enable_reschedule_detection: z.boolean(),
  enable_utm_tracking: z.boolean(),
  enable_question_parsing: z.boolean(),
  is_active: z.boolean()
});
```

**Success State:**
After creation, show Alert with:
- Success checkmark
- "Endpoint created successfully!"
- Generated webhook URL in code block with copy button
- "Next step: Add this URL to Calendly" link

---

### **PROMPT 13: Enrichment Parser - Question Parsing**

Create `/lib/parsers/question-parser.ts`:

```typescript
export function parseCustomQuestions(payload: any): Record<string, string> | null {
  try {
    const questions = payload?.payload?.questions_and_answers;
    if (!Array.isArray(questions) || questions.length === 0) return null;
    
    const parsed: Record<string, string> = {};
    
    for (const q of questions) {
      // Normalize question to key
      const key = q.question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '_') // Spaces to underscores
        .substring(0, 50); // Max 50 chars
      
      parsed[key] = q.answer || '';
    }
    
    return parsed;
  } catch (error) {
    console.error('Question parsing failed:', error);
    return null;
  }
}
```

**Edge cases handled:**
- Empty questions array
- Missing question/answer fields
- Special characters in questions
- Duplicate question names (last one wins)

---

### **PROMPT 14: Enrichment Parser - Reschedule Detection**

Create `/lib/parsers/reschedule-detector.ts`:

```typescript
export async function detectReschedule(
  calendlyEventUuid: string,
  inviteeEmail: string,
  userId: string,
  supabase: SupabaseClient
): Promise<{ isReschedule: boolean; cancellationId?: string }> {
  try {
    // Look for recent cancellation across ALL user endpoints
    const { data: cancellation } = await supabase
      .from('webhook_logs')
      .select('id, calendly_event_uuid')
      .eq('invitee_email', inviteeEmail)
      .eq('event_type', 'invitee.canceled')
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10 min window
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!cancellation) return { isReschedule: false };
    
    // Reschedule if:
    // 1. Same email
    // 2. Recent cancellation (within 10 min)
    // 3. Different event UUID (rescheduled to new time)
    const isReschedule = cancellation.calendly_event_uuid !== calendlyEventUuid;
    
    return {
      isReschedule,
      cancellationId: isReschedule ? cancellation.id : undefined
    };
  } catch (error) {
    console.error('Reschedule detection failed:', error);
    return { isReschedule: false };
  }
}
```

**Edge cases handled:**
- No recent cancellations (return false)
- Same event UUID (true cancellation, not reschedule)
- 10-minute window (more flexible than 5 min)
- Queries across all user endpoints (cross-endpoint detection)
- Email matching only (even if different event types)

**False positive prevention:**
- Different event UUID required (prevents flagging true cancellations)

---

### **PROMPT 15: Enrichment Parser - UTM Extraction**

Create `/lib/parsers/utm-extractor.ts`:

```typescript
export function extractUTMParameters(payload: any): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
} {
  try {
    const tracking = payload?.payload?.tracking;
    
    return {
      utm_source: tracking?.utm_source || null,
      utm_medium: tracking?.utm_medium || null,
      utm_campaign: tracking?.utm_campaign || null,
      utm_term: tracking?.utm_term || null,
      utm_content: tracking?.utm_content || null
    };
  } catch (error) {
    console.error('UTM extraction failed:', error);
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null
    };
  }
}
```

**Note:** UTM tracking requires users to add UTM params to their Calendly booking URLs. Calendly MAY include these in `payload.tracking`. If not present, all values return null.

---

### **PROMPT 16: Main Enricher Orchestrator**

Create `/lib/parsers/enricher.ts`:

```typescript
import { parseCustomQuestions } from './question-parser';
import { detectReschedule } from './reschedule-detector';
import { extractUTMParameters } from './utm-extractor';

export async function enrichWebhookPayload(
  payload: any,
  endpoint: any,
  userId: string,
  supabase: SupabaseClient
) {
  const calendlyEventUuid = payload?.event;
  const inviteeEmail = payload?.payload?.email;
  const eventType = payload?.event;
  
  // Run enrichment based on endpoint settings
  const [questions, reschedule, utm] = await Promise.all([
    endpoint.enable_question_parsing 
      ? parseCustomQuestions(payload) 
      : Promise.resolve(null),
    endpoint.enable_reschedule_detection 
      ? detectReschedule(calendlyEventUuid, inviteeEmail, userId, supabase)
      : Promise.resolve({ isReschedule: false }),
    endpoint.enable_utm_tracking 
      ? extractUTMParameters(payload)
      : Promise.resolve(null)
  ]);
  
  return {
    original: payload,
    enriched: {
      parsed_questions: questions,
      reschedule_info: reschedule,
      utm_tracking: utm,
      enriched_at: new Date().toISOString()
    },
    metadata: {
      calendly_event_uuid: calendlyEventUuid,
      invitee_email: inviteeEmail,
      event_type: eventType
    }
  };
}
```

**Error handling:**
- Each enricher returns null on failure
- Original payload always included
- Parallel execution with Promise.all
- Metadata always extracted for logging

---

### **PROMPT 17: Webhook Receiver API**

Create `/app/api/webhook/calendly/[endpointId]/route.ts`:

**Flow:**
1. Rate limit: 100 req/min per endpoint (Upstash)
2. Lookup endpoint by ID
3. Check subscription status (active/trial)
4. Check endpoint is_active
5. Parse Calendly payload
6. Duplicate detection (calendly_event_uuid + event_type)
7. Enrich payload
8. Forward to destination URL (10s timeout)
9. Log to webhook_logs
10. Return 200 OK always

**Duplicate Detection:**
```typescript
const { data: existing } = await supabase
  .from('webhook_logs')
  .select('id')
  .eq('endpoint_id', endpointId)
  .eq('calendly_event_uuid', calendlyEventUuid)
  .eq('event_type', eventType)
  .maybeSingle();

if (existing) {
  console.log('Duplicate webhook detected, skipping');
  return Response.json({ ok: true, duplicate: true });
}
```

**Error States:**
- 404: Endpoint not found
- 429: Rate limit exceeded
- 200: Always for Calendly (prevents retries)

**Forwarding:**
```typescript
const response = await fetch(endpoint.destination_url, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'User-Agent': 'CalRouter/1.0'
  },
  body: JSON.stringify(enriched),
  signal: AbortSignal.timeout(10000)
});
```

Log status, response_code, error_message in webhook_logs.

---

### **PROMPT 18: Webhook Logs Page**

Create `/app/dashboard/logs/page.tsx`:

**Structure:**
- Filters at top: Endpoint dropdown, Status dropdown, Date range tabs
- Table below with columns:
  - Timestamp (formatted with date-fns)
  - Endpoint name
  - Event type
  - Reschedule badge (if is_reschedule true)
  - UTM source (if present)
  - Status badge (green=success, red=failed)
  - View button

**Table Row Pattern:**
```tsx
<TableRow className="hover:bg-accent/50">
  <TableCell className="font-mono text-sm">
    {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
  </TableCell>
  <TableCell>{log.endpoint.name}</TableCell>
  <TableCell>
    <Badge variant="outline">{log.event_type}</Badge>
  </TableCell>
  <TableCell>
    {log.is_reschedule && (
      <Badge className="bg-accent text-accent-foreground">
        Reschedule
      </Badge>
    )}
  </TableCell>
  <TableCell className="text-sm text-muted-foreground">
    {log.utm_source || '—'}
  </TableCell>
  <TableCell>
    {log.status === 'success' ? (
      <Badge className="bg-primary/10 text-primary">Success</Badge>
    ) : (
      <Badge className="bg-destructive/10 text-destructive">Failed</Badge>
    )}
  </TableCell>
  <TableCell>
    <Button size="sm" variant="ghost">View</Button>
  </TableCell>
</TableRow>
```

**Detail View (Dialog):**
When clicking View, show Dialog with:
- Tabs: Original Payload, Enriched Payload, Parsed Data
- JSON formatted with syntax highlighting (use `<pre>` with Roboto Mono)
- Parsed questions shown as key-value list if available
- Copy button for entire payload

Fetch logs with pagination (50 per page). Auto-refresh every 30s using useEffect.

---

### **PROMPT 19: Setup Guide Page**

Create `/app/dashboard/setup/page.tsx`:

**Structure:**
- Hero section explaining endpoint architecture
- 3 numbered steps (1, 2, 3 in purple circles)
- Code examples for each step
- Alert callout for important notes

**Step 1: Create Endpoint**
Show screenshot placeholder or Card with form preview.

**Step 2: Add to Calendly**
```tsx
<Alert className="border-primary/20 bg-primary/5">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Important: Event Types vs Booking Types</AlertTitle>
  <AlertDescription>
    In Calendly webhook settings, you select EVENT types:
    <ul className="list-disc list-inside mt-2 space-y-1">
      <li>invitee.created = any new booking</li>
      <li>invitee.canceled = any cancellation</li>
    </ul>
    You CANNOT filter by booking type (like "30 Min Meeting").
    Create multiple CalRouter endpoints for different handling.
  </AlertDescription>
</Alert>
```

**Step 3: Connect Automation Tool**
Tabs for Zapier, Make, n8n, Custom. Each tab shows:
- Where to get webhook URL from that tool
- Where to paste it in CalRouter (destination URL)
- Example enriched payload structure

**Payload Example:**
```tsx
<div className="grid md:grid-cols-2 gap-4">
  <Card className="p-4">
    <p className="text-sm font-semibold mb-2">Raw Calendly</p>
    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
{`{
  "event": "invitee.created",
  "questions_and_answers": [
    {"question": "Budget?", "answer": "$5k"}
  ]
}`}
    </pre>
  </Card>
  
  <Card className="p-4">
    <p className="text-sm font-semibold mb-2">Enriched by CalRouter</p>
    <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
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
  </Card>
</div>
```

**Test Section:**
Button to send test webhook to all active endpoints. Show results in Alert.

---

### **PROMPT 20: Dashboard Overview Page**

Create `/app/dashboard/page.tsx`:

**Stats Grid:**
- Layout: `grid md:grid-cols-2 lg:grid-cols-4 gap-6`
- Use Stats Card Pattern from design system

**Stats to show:**
1. Total Endpoints (Webhook icon)
2. Webhooks Processed (30 days) (Activity icon)
3. Reschedules Detected (30 days) (Calendar icon)
4. Success Rate (CheckCircle icon)

**Stats Card:**
```tsx
<Card className="p-6">
  <div className="flex items-center gap-4">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">Label</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
</Card>
```

**Recent Activity Feed:**
Below stats, Card with:
- Title: "Recent Activity"
- List of last 10 webhook logs
- Each item: timestamp, endpoint name, event type, status badge
- "View All Logs" link

Fetch real data from Supabase. Use skeleton loading states.

---

### **PROMPT 21: Edit Endpoint Dialog**

Create `/components/edit-endpoint-dialog.tsx`:

**Structure:**
- Same form as create dialog
- Pre-populate with endpoint data
- Include all enrichment toggles
- Update button instead of create

**On save:**
- Update endpoint in Supabase
- Show success toast
- Refresh parent list

**Validation:**
- Same zod schema as create
- Prevent changing endpoint ID (hidden field)

---

### **PROMPT 22: Delete Endpoint Confirmation**

Add delete functionality to endpoint cards:

**AlertDialog:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button size="sm" variant="outline" className="text-destructive">
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Endpoint?</AlertDialogTitle>
      <AlertDialogDescription>
        This will stop forwarding webhooks for "{endpoint.name}". 
        Webhook logs will be preserved.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDelete}
        className="bg-destructive text-destructive-foreground"
      >
        Delete Endpoint
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Delete logic:**
- Soft delete: Set `is_active = false` and `deleted_at = now()`
- OR hard delete: DELETE from database
- Cascade deletes webhook_logs (if hard delete)
- Show success toast

---

### **PROMPT 23: Billing Page**

Create `/app/dashboard/billing/page.tsx` with monthly/annual plans:

**Trial Status Card:**
- Show current plan (Trial/Pro), days remaining, Upgrade button

```tsx
<Card className="p-6 border-2 border-primary">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">Current Plan</p>
      <p className="text-2xl font-bold">Free Trial</p>
      <p className="text-sm text-muted-foreground mt-1">
        {daysLeft} days remaining
      </p>
    </div>
    <Button className="bg-primary">Upgrade to Pro</Button>
  </div>
</Card>
```
**Plan Toggle:**
- Switch between Monthly/Annual with Badge "Save 17%"
- State: `const [isAnnual, setIsAnnual] = useState(false)`

**Pricing Card (grid md:grid-cols-2):**
Monthly Card:
- Price: $29/month, billed monthly
- Features: Unlimited endpoints, webhooks, all enrichment, support
- Button: "Choose Monthly" (primary if !isAnnual)

Annual Card:
- Badge "Best Value" at top
- Price: $24/month, $288 billed annually
- Highlight: "Save $60/year (17%)" in bg-primary/10 rounded pill
- Extra feature: "2 months free"
- Button: "Choose Annual" (primary if isAnnual)

**Usage Stats Card:**
- Show webhooks processed, reschedules detected, questions parsed
- `max-w-2xl mx-auto mt-8`

```tsx
<Card className="p-6 space-y-4">
  <h3 className="font-semibold">This Month's Activity</h3>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Webhooks Processed</span>
      <span className="font-semibold">{count}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Reschedules Detected</span>
      <span className="font-semibold">{count}</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">Questions Parsed</span>
      <span className="font-semibold">{count}</span>
    </div>
  </div>
</Card>
```
handleUpgrade function calls `/api/stripe/create-checkout` with plan type.

Use mock data for now. Stripe integration comes next.

---

### **PROMPT 24: Stripe Checkout Integration**

Update `/app/api/stripe/create-checkout/route.ts`:

**Accept plan type:**
```typescript
const { plan } = await request.json(); // 'monthly' or 'annual'

const priceId = plan === 'annual' 
  ? process.env.STRIPE_ANNUAL_PRICE_ID 
  : process.env.STRIPE_MONTHLY_PRICE_ID;
```

**Create session:**
- Use selected priceId
- Add `plan_type: plan` to metadata
- success_url: `/dashboard/success`
- cancel_url: `/dashboard/billing`

**Environment variables:**
- `STRIPE_MONTHLY_PRICE_ID` (for $29/month)
- `STRIPE_ANNUAL_PRICE_ID` (for $288/year)

Wire up "Upgrade to Pro" button to call this API and redirect to Stripe.

---

### **PROMPT 25: Stripe Webhook Handler**

Create `/app/api/stripe/webhook/route.ts`:

**Verify signature:**
```typescript
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

**Handle events:**

1. `checkout.session.completed`:
   - Update user: `subscription_status = 'active'`
   - Clear `trial_ends_at`

2. `customer.subscription.deleted`:
   - Update user: `subscription_status = 'cancelled'`
   - Disable all endpoints: `is_active = false`

3. `invoice.payment_failed`:
   - Send email notification
   - After 3 failures, cancel subscription

4. `customer.subscription.updated`:
   - Update subscription status based on Stripe status

Always return `200 OK`. Log all events to database.

---

### **PROMPT 26: Success Page**

Create `/app/dashboard/success/page.tsx`:

**Structure:**
- Centered Card with `max-w-md mx-auto p-8 text-center space-y-6`
- Checkmark icon: `w-16 h-16 mx-auto text-primary`
- Heading: "Welcome to CalRouter Pro!"
- Description: "Your webhooks are now being enriched."

**Next Steps List:**
```tsx
<div className="space-y-3 text-left">
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
      1
    </div>
    <p className="text-sm">Create your first endpoint</p>
  </div>
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
      2
    </div>
    <p className="text-sm">Add webhook URL to Calendly</p>
  </div>
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
      3
    </div>
    <p className="text-sm">Start receiving enriched bookings</p>
  </div>
</div>
```

**Buttons:**
- Primary: "Go to Endpoints"
- Secondary: "View Setup Guide"

---

### **PROMPT 27: Error States**

Add error handling throughout:

**Loading States:**
Use Skeleton component:
```tsx
<Card className="p-6 space-y-4">
  <Skeleton className="h-4 w-32" />
  <Skeleton className="h-8 w-full" />
  <Skeleton className="h-4 w-48" />
</Card>
```

**Empty States:**
Pattern for all lists:
```tsx
<Card className="p-12 text-center space-y-4">
  <Icon className="w-16 h-16 mx-auto text-muted-foreground" />
  <div className="space-y-2">
    <p className="font-semibold">No {resource} yet</p>
    <p className="text-sm text-muted-foreground">
      Get started by creating your first {resource}
    </p>
  </div>
  <Button>Create {Resource}</Button>
</Card>
```

**API Error States:**
Show Alert with error message:
```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    {error.message || 'Something went wrong. Please try again.'}
  </AlertDescription>
</Alert>
```

**Form Validation Errors:**
Show under each field:
```tsx
{errors.fieldName && (
  <p className="text-sm text-destructive">{errors.fieldName.message}</p>
)}
```

**Webhook Forwarding Errors:**
In logs table, show error badge:
```tsx
{log.status === 'failed' && (
  <div className="space-y-1">
    <Badge variant="destructive">Failed</Badge>
    <p className="text-xs text-muted-foreground">
      {log.error_message}
    </p>
  </div>
)}
```

---

### **PROMPT 28: Toast Notifications**

Install and configure Sonner:

```bash
npm install sonner
```

Add Toaster to root layout:
```tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
```

**Usage throughout app:**
- Endpoint created: `toast.success('Endpoint created successfully')`
- Endpoint updated: `toast.success('Endpoint updated')`
- Endpoint deleted: `toast.success('Endpoint deleted')`
- Copy URL: `toast.success('Copied to clipboard')`
- API errors: `toast.error('Failed to save changes')`

---

### **PROMPT 29: Mobile Responsiveness**

Make responsive using Tailwind breakpoints:

**Sidebar (Dashboard Layout):**
```tsx
// Desktop: Fixed sidebar
<aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r">

// Mobile: Drawer with Sheet component
<Sheet>
  <SheetTrigger asChild>
    <Button size="sm" variant="ghost" className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    {/* Nav items */}
  </SheetContent>
</Sheet>
```

**Endpoint Cards:**
- Desktop: Show all details
- Mobile: Stack vertically, hide some metadata

**Tables:**
```tsx
<div className="overflow-x-auto">
  <Table>
    {/* Use min-width on columns */}
  </Table>
</div>
```

**Stats Grid:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

**Forms:**
- Full width on mobile
- Max width on desktop

Test at 375px, 768px, 1024px breakpoints.

---

### **PROMPT 30: Analytics Page**

Create `/app/dashboard/analytics/page.tsx`:

**Charts using Recharts:**

1. **Webhooks Over Time (Line Chart):**
```tsx
<Card className="p-6">
  <h3 className="font-semibold mb-4">Webhook Activity</h3>
  <LineChart width={600} height={300} data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
  </LineChart>
</Card>
```

2. **Event Type Breakdown (Bar Chart):**
Show count by event type (invitee.created, invitee.canceled, etc.)

3. **UTM Sources (Bar Chart):**
Show top 5 UTM sources with counts

4. **Reschedule Rate (Stat Card):**
```tsx
<Card className="p-6">
  <p className="text-sm text-muted-foreground">Reschedule Rate</p>
  <p className="text-4xl font-bold">{percentage}%</p>
  <p className="text-sm text-muted-foreground mt-1">
    {rescheduleCount} of {totalCount} bookings
  </p>
</Card>
```

**Filters:**
- Date range: Last 7 days, 30 days, 90 days
- Endpoint filter dropdown

Fetch aggregated data from Supabase using GROUP BY queries.

---

### **PROMPT 31: Trial Expiry Cron**

Create `/app/api/cron/check-trials/route.ts`:

**Verify cron secret:**
```typescript
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Logic:**
```typescript
// Find expired trials
const { data: expiredUsers } = await supabase
  .from('users')
  .select('*')
  .eq('subscription_status', 'trial')
  .lt('trial_ends_at', new Date().toISOString());

for (const user of expiredUsers) {
  // Update user status
  await supabase
    .from('users')
    .update({ subscription_status: 'expired' })
    .eq('id', user.id);
  
  // Disable all endpoints
  await supabase
    .from('webhook_endpoints')
    .update({ is_active: false })
    .eq('user_id', user.id);
  
  // Send email notification
  await sendEmail(user.email, 'trial-expired');
}
```

**Add to vercel.json:**
```json
{
  "crons": [{
    "path": "/api/cron/check-trials",
    "schedule": "0 2 * * *"
  }]
}
```

---

### **PROMPT 32: Email Notifications**

Set up email with Resend:

```bash
npm install resend
```

Create `/lib/email.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTrialExpiryEmail(email: string, daysLeft: number) {
  await resend.emails.send({
    from: 'CalRouter <noreply@calrouter.app>',
    to: email,
    subject: `Your trial ends in ${daysLeft} days`,
    html: `
      <h1>Your CalRouter trial is ending soon</h1>
      <p>You have ${daysLeft} days left in your trial.</p>
      <p>Upgrade for just $29/month to keep your automations running.</p>
      <a href="https://calrouter.app/dashboard/billing">Upgrade Now</a>
    `
  });
}
```

**Email types:**
- Trial expiry reminder (3 days before)
- Trial expired
- Welcome email
- Webhook failure alerts (after 3 consecutive failures)

Use simple HTML templates. No complex designs needed.

---

### **PROMPT 33: Documentation Page**

Create `/app/docs/page.tsx`:

**Structure:**
- Table of contents (sticky sidebar)
- Main content area
- Search functionality (filter sections)

**Sections:**

1. **Getting Started**
2. **Enrichment Features**
   - Reschedule Detection (with examples)
   - Question Parsing (with examples)
   - UTM Tracking (with examples)
3. **API Reference**
   - Webhook URL format
   - Payload structure
   - Response codes
4. **Integration Guides**
   - Zapier setup
   - Make.com setup
   - n8n setup
5. **FAQs**
6. **Troubleshooting**

**Code Examples:**
Use Card with `bg-muted` for code blocks:
```tsx
<Card className="p-4 bg-muted">
  <pre className="font-mono text-sm overflow-x-auto">
    <code>{codeExample}</code>
  </pre>
</Card>
```

**Search:**
Simple filter using useState:
```tsx
const [search, setSearch] = useState('');
const filtered = sections.filter(s => 
  s.title.toLowerCase().includes(search.toLowerCase())
);
```

---

### **PROMPT 34: Performance Optimization**

**Database Queries:**
- All indexes created in PROMPT 9
- Use SELECT only needed columns
- Add LIMIT to all list queries
- Use pagination (OFFSET or cursor-based)

**React Server Components:**
- Default to Server Components
- Mark 'use client' only for:
  - Forms
  - Interactive elements
  - Charts

**Loading States:**
Add loading.tsx to routes:
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
```

**Caching:**
```typescript
// Cache stats for 5 minutes
export const revalidate = 300;
```

**Bundle Size:**
- Use dynamic imports for heavy components
- Remove unused shadcn components
- Tree-shake lodash

---

### **PROMPT 35: Security Measures**

**Rate Limiting (Already in PROMPT 17):**
Verify Upstash Redis is configured for webhook receiver.

**Input Validation:**
Block internal URLs in destination_url:
```typescript
function isInternalUrl(url: string): boolean {
  const hostname = new URL(url).hostname;
  return hostname === 'localhost' 
    || hostname.startsWith('127.')
    || hostname.startsWith('192.168.')
    || hostname.startsWith('10.');
}
```

**Environment Variables:**
Create `/lib/env.ts`:
```typescript
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'SUPABASE_URL',
  'STRIPE_SECRET_KEY'
];

requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});
```

Import in root layout to validate on startup.

---

### **PROMPT 36: Final Testing & Polish**

**Test user flows:**
1. Sign up → Create endpoint → Copy URL → View logs
2. Edit endpoint → Toggle enrichment → Save
3. Delete endpoint → Confirm deletion
4. Trial expiry → See upgrade prompt
5. Upgrade → Stripe checkout → Success page

**Add helpful empty states:**
- No endpoints: "Create your first endpoint"
- No logs: "Webhooks will appear here"
- No analytics data: "Data will appear after first webhook"

**Polish:**
- Consistent spacing (use design tokens)
- Consistent button variants
- Loading states everywhere
- Error boundaries on all routes
- Helpful error messages (no generic "Error occurred")

**Meta tags:**
```tsx
// app/layout.tsx
export const metadata = {
  title: 'CalRouter for Calendly',
  description: 'Webhook enrichment and routing for Calendly',
};
```

---

## 🚀 Deployment Checklist

**Environment Variables:**
Set all in Vercel dashboard.

**Database:**
Run schema.sql in Supabase SQL editor.

**Stripe:**
1. Create product: "CalRouter Pro - $29/month"
2. Create two prices in Stripe dashboard, copy both IDs to env vars.
3. Copy price ID to `STRIPE_PRICE_ID`
4. Create webhook endpoint pointing to `/api/stripe/webhook`
5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

**Clerk:**
Set up production instance, update env vars.

**Upstash:**
Create Redis database, copy URL and token.

**Vercel:**
1. Connect GitHub repo
2. Add all env vars
3. Deploy
4. Set up custom domain

**DNS:**
Point domain to Vercel (automatic SSL).

---

## 📈 Post-Launch

**Marketing:**
- Product Hunt launch (emphasize enrichment value)
- Reddit: r/SaaS, r/Calendly
- Twitter demo video showing reschedule detection
- SEO blog posts on enrichment use cases

**Monitoring:**
- Track enrichment usage (which features used most)
- Monitor error rates in parsers
- Track conversion: trial → paid
- User feedback on enrichment accuracy

**Future Features (v2):**
- Custom field mapping
- Conditional routing based on answers
- Team collaboration
- Webhook replay with different enrichment
- Integration with CRM APIs directly

---

**Total Build Time:** 2-3 weeks part-time with Claude Code.

**Start with PROMPT 1, build sequentially.**