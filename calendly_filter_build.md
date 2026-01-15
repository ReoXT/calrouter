# CalRouter for Calendly - Complete Build Guide for Claude Code

## 📋 Project Overview

**What we're building:** A micro-SaaS that receives Calendly webhooks, enriches the data (parsing custom questions, detecting reschedules, extracting UTM parameters), filters by event type, and routes to user-specified endpoints with intelligent transformations.

**Core value:** Solves multiple Calendly + Zapier limitations: event filtering, reschedule detection, custom question parsing, and UTM tracking - all in one simple tool.

**Target customer:** Coaches tracking lead sources, sales teams using qualification questions, agencies needing smart routing, anyone hitting Calendly's webhook limitations.

**Pricing:** $16/month - One simple plan with everything included.

---

## 🛠 Tech Stack Recommendations

### Option 1: Fast & Modern (Recommended)
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk or Supabase Auth
- **Deployment:** Vercel
- **Payments:** Stripe

**Why:** Fast development, beautiful UI out-of-box, handles scaling automatically.

### Option 2: Full-Stack Simplicity
- **Framework:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS + Headless UI
- **Database:** Neon (Serverless Postgres)
- **Auth:** NextAuth.js
- **Deployment:** Vercel
- **Payments:** Lemon Squeezy

**Why:** All-in-one simplicity, lower vendor lock-in.

### Option 3: Minimal Stack
- **Frontend:** Vite + React + Tailwind
- **Backend:** Express.js
- **Database:** MongoDB Atlas
- **Auth:** Firebase Auth
- **Deployment:** Railway/Render
- **Payments:** Stripe

**Why:** More control, traditional architecture.

**🎯 Go with Option 1** - shadcn/ui components are gorgeous and will save hours of UI work.

---

## 📝 Step-by-Step Prompts for Claude Code

Copy these prompts one at a time into Claude Code. Build sequentially.

---

### **PROMPT 1: Project Initialization**

```
Create a new Next.js 14 project with TypeScript called "calrouter". 

Setup requirements:
- Use App Router (not Pages Router)
- Install and configure Tailwind CSS
- Install shadcn/ui and initialize it
- Install these dependencies: @supabase/supabase-js, @clerk/nextjs, stripe, zod, react-hook-form, query-string (for UTM parsing)
- Create a clean folder structure with: /app, /components, /lib, /types, /hooks, /lib/parsers (for data enrichment)
- Set up environment variables template in .env.example
- Create a basic layout.tsx with a simple header

Make it minimal and clean. Use dark mode by default.
```

---

### **PROMPT 2: Landing Page UI**

```
Create a beautiful landing page for CalRouter for Calendly at /app/page.tsx.

Include these sections:
1. Hero section with:
   - Headline: "Stop wasting time parsing Calendly webhooks"
   - Subheadline: "Automatically detect reschedules, parse custom questions, and track lead sources. Get clean, enriched data—not messy JSON. $16/month, everything included."
   - CTA button "Start Free Trial" and "See How It Works"
   - Clean gradient background

2. Problem section with visual comparison:
   - "Before: Messy nested JSON → Hours building Zapier formatters → Still missing data"
   - "After: Clean, structured data → Ready to use → Never lose attribution"

3. Core Features (4 columns with icons):
   - Smart Event Filtering: "Route different event types to different destinations"
   - Reschedule Detection: "Automatically identify rescheduled meetings (not cancellations)"
   - Question Parsing: "Custom questions arrive as clean key-value pairs"
   - UTM Tracking: "Never lose lead source attribution again"

4. How It Works (4 steps with visuals):
   - Connect your Calendly webhook
   - Configure enrichment rules per endpoint
   - Add destination URLs (Zapier, Make, n8n, custom webhooks)
   - Receive enriched, structured data automatically

5. Real Value Examples section:
   - "Know exactly where every booking came from (UTM tracking)"
   - "Stop manually checking if a 'cancellation' was actually a reschedule"
   - "Use custom question answers without complex parsing"
   - "Route VIP bookings differently from standard calls"

6. Perfect For section:
   - Coaches who track lead attribution
   - Sales teams using custom qualification questions
   - Agencies managing multiple Calendly accounts
   - Anyone who's built complex Zapier formatters for Calendly data

7. Simple pricing card: 
   - $16/month
   - "One simple plan. Everything included."
   - Feature list:
     * Unlimited endpoints
     * Unlimited webhook volume
     * Event type filtering
     * Automatic reschedule detection
     * Custom question parsing
     * UTM parameter extraction
     * Email support
   - "14-day free trial. No credit card required."

8. FAQ section (3-4 questions):
   - "How does reschedule detection work?"
   - "What automation tools does this work with?"
   - "Do you store my Calendly data?"
   - "Can I disable specific enrichment features?"

9. Footer with links

Use shadcn/ui components (Button, Card, Accordion for FAQ). Make it modern and clean like Linear or Stripe's website. Use Tailwind for styling. Emphasize TIME savings and DATA QUALITY, not cost savings.
```

---

### **PROMPT 3: Authentication Setup**

```
Set up Clerk authentication for the app.

Tasks:
1. Create middleware.ts to protect routes under /dashboard
2. Add Clerk provider to layout.tsx
3. Create sign-in and sign-up pages at /sign-in and /sign-up using Clerk components
4. Add user menu dropdown in the header (only show when logged in)
5. Create a simple /dashboard page as placeholder that shows "Welcome [user name]"

Keep the UI minimal. Use shadcn/ui Button and DropdownMenu components for the user menu.
```

---

---

### **PROMPT 4: Database Schema Setup**

```
Create Supabase database schema and setup.

Create these tables in /lib/supabase/schema.sql:

1. users table:
   - id (uuid, primary key)
   - clerk_user_id (text, unique)
   - email (text)
   - created_at (timestamp)
   - subscription_status (text: 'trial', 'active', 'cancelled')
   - trial_ends_at (timestamp)

2. webhook_endpoints table:
   - id (uuid, primary key)
   - user_id (uuid, foreign key to users)
   - name (text)
   - calendly_event_type (text) - stores event UUID or name
   - destination_url (text)
   - is_active (boolean)
   - enable_reschedule_detection (boolean, default true)
   - enable_utm_tracking (boolean, default true)
   - enable_question_parsing (boolean, default true)
   - created_at (timestamp)

3. webhook_logs table:
   - id (uuid, primary key)
   - endpoint_id (uuid, foreign key)
   - original_payload (jsonb) - raw Calendly data
   - enriched_payload (jsonb) - after parsing/enrichment
   - event_type (text) - detected event type
   - is_reschedule (boolean) - reschedule detection flag
   - utm_source (text, nullable)
   - utm_medium (text, nullable)
   - utm_campaign (text, nullable)
   - status (text: 'success', 'failed')
   - response_code (integer)
   - created_at (timestamp)

4. reschedule_tracking table:
   - id (uuid, primary key)
   - original_event_id (text) - Calendly event UUID
   - cancellation_webhook_id (uuid, foreign key to webhook_logs)
   - creation_webhook_id (uuid, foreign key to webhook_logs)
   - detected_at (timestamp)
   
Also create /lib/supabase/client.ts with Supabase client setup.
```

---

### **PROMPT 5: Dashboard Layout & Navigation**

```
Create the dashboard layout and navigation.

Create /app/dashboard/layout.tsx with:
- Sidebar navigation (fixed left side) with these links:
  - Overview
  - Endpoints
  - Logs
  - Enrichment Settings
  - Setup Guide
  - Settings
  - Billing
- Main content area on the right
- Use shadcn/ui components for navigation

Make it look like Vercel or Linear's dashboard - clean, minimal, with good spacing.
Use icons from lucide-react for nav items.
```

---

### **PROMPT 6: Endpoints Management Page - List View**

```
Create /app/dashboard/endpoints/page.tsx - the main endpoints management page.

Features:
1. Header with "Your Webhook Endpoints" title and "+ Create Endpoint" button

2. Empty state when no endpoints exist:
   - Nice illustration or icon
   - Text: "Create your first endpoint to start enriching Calendly webhooks"
   - "Get Started" button

3. For each endpoint, show a Card (not table) with:
   - Endpoint name (large, bold)
   - Webhook URL (in code block with copy button):
     https://calrouter.app/api/webhook/calendly/[endpoint-uuid]
   - Destination URL (where data gets forwarded)
   - Event Type Filter (if set, or "All Events" if not)
   - Enrichment Features enabled (badges):
     * "Reschedule Detection" badge if enabled
     * "UTM Tracking" badge if enabled  
     * "Question Parsing" badge if enabled
   - Status toggle (Active/Inactive)
   - Stats: "X webhooks received" (from webhook_logs count)
   - Actions: Edit button, Delete button, Test button

4. Fetch endpoints from Supabase with stats:
   ```sql
   SELECT 
     e.*,
     COUNT(l.id) as webhook_count
   FROM webhook_endpoints e
   LEFT JOIN webhook_logs l ON l.endpoint_id = e.id
   WHERE e.user_id = ?
   GROUP BY e.id
   ```

5. Use shadcn/ui Card, Button, Badge, Switch, and Code components

6. Add loading state using shadcn/ui Skeleton

7. Make the webhook URL very prominent with:
   - Copy button
   - "How to use this URL" tooltip/popover

Make the UI clean and organized. Each endpoint should feel like its own self-contained unit.
The webhook URL should be the most prominent element since that's what users need to copy.

CRITICAL: Display the endpoint's own UUID in its webhook URL, not the user's ID.
Format: https://calrouter.app/api/webhook/calendly/{endpoint.id}
```

---

### **PROMPT 7: Create Endpoint Modal/Form**

```
Create a dialog/modal for creating new webhook endpoints.

Create /components/create-endpoint-dialog.tsx with:

1. Form with these fields:
   - Endpoint Name (text input) - e.g., "VIP Consultations"
   - Destination Webhook URL (text input with validation) - where enriched data goes
   - Active status (toggle, default ON)
   - Enrichment Features section with toggles for:
     * Enable Reschedule Detection (default ON) - with tooltip: "Automatically detect when someone reschedules instead of canceling"
     * Enable UTM Tracking (default ON) - with tooltip: "Extract lead source data from booking URLs"
     * Enable Question Parsing (default ON) - with tooltip: "Convert custom questions to clean key-value format"

2. Use react-hook-form for form handling

3. Use zod for validation:
   - Destination URL must be valid HTTPS
   - Endpoint name required (max 100 chars)

4. URL Testing (optional but recommended):
   - After user enters destination URL, show "Test URL" button
   - Send test POST request to the URL
   - If responds with 2xx status, show green checkmark
   - If fails/times out, show warning: "URL didn't respond. Create anyway?"
   - This helps catch typos before creating endpoint

5. Use shadcn/ui Dialog, Form, Input, Switch, Tooltip components

6. On submit:
   - Insert into Supabase webhook_endpoints table
   - Let the database auto-generate the UUID (id column)
   - Immediately after insert, fetch the created endpoint to get its UUID
   - Show success dialog with the generated webhook URL prominently:
     
     "✅ Endpoint Created Successfully!
     
     Your webhook URL:
     https://calrouter.app/api/webhook/calendly/[endpoint-uuid]
     
     [Copy URL] [View in Endpoints]
     
     Next step: Add this URL to your Calendly webhook settings."

7. Show success toast and close dialog

Keep validation strict - validate URL format and require all fields.
Make enrichment toggles prominent with helper text explaining each feature.

CRITICAL: The webhook URL is based on the endpoint's UUID, not the user's ID.
Each endpoint gets its own unique webhook URL.
The URL should be immediately usable - users copy it and add to Calendly.
```

---

### **PROMPT 8: Data Enrichment Parser Library**

```
Create /lib/parsers/calendly-enricher.ts - the core data enrichment logic.

This file should export functions for:

1. parseCustomQuestions(payload):
   Input: Calendly payload with questions_and_answers array
   Output: Flattened object with normalized keys
   
   Example:
   Input:
   {
     "questions_and_answers": [
       { "question": "What's your budget?", "answer": "$5,000 - $10,000", "position": 0 },
       { "question": "Preferred time?", "answer": "Morning", "position": 1 }
     ]
   }
   
   Output:
   {
     "whats_your_budget": "$5,000 - $10,000",
     "preferred_time": "Morning"
   }
   
   Logic:
   - Convert question to lowercase
   - Replace spaces and special chars with underscores
   - Remove position field (not needed)
   - Return flat object for easy access in automations

2. detectReschedule(calendlyEventUuid, inviteeEmail, userId):
   - Query webhook_logs table across ALL of this user's endpoints
   - Look for pattern:
     * invitee.canceled event for this calendly_event_uuid OR same invitee_email
     * followed by invitee.created within 5 minutes
     * same invitee_email in both events
   - Return: { isReschedule: boolean, originalCancellationId: string | null }
   
   IMPORTANT: This must query across all user's endpoints, not just current one.
   A cancellation might come through endpoint A, new booking through endpoint B.
   
   SQL logic:
   ```sql
   -- Find recent cancellation for this invitee
   SELECT * FROM webhook_logs wl
   JOIN webhook_endpoints we ON wl.endpoint_id = we.id
   WHERE we.user_id = ?
     AND wl.invitee_email = ?
     AND wl.event_type = 'invitee.canceled'
     AND wl.created_at > now() - interval '5 minutes'
   ORDER BY wl.created_at DESC
   LIMIT 1
   ```
   
   If found, this is likely a reschedule.

3. extractUTMParameters(payload):
   - Check if payload.tracking exists (Calendly sometimes includes this)
   - Extract utm_source, utm_medium, utm_campaign, utm_term, utm_content
   - Return object with all UTM params (null if not present)
   
   IMPORTANT: UTM tracking only works if:
   - User includes UTM params in their Calendly booking page URL
   - Example: calendly.com/user/meeting?utm_source=facebook&utm_campaign=spring2024
   - Calendly MAY include these in payload.tracking object
   
   If payload.tracking doesn't exist, return all nulls.
   Don't try to parse from other fields - Calendly doesn't always provide this.
   
   Return format:
   {
     utm_source: string | null,
     utm_medium: string | null,
     utm_campaign: string | null,
     utm_term: string | null,
     utm_content: string | null
   }

4. enrichWebhookPayload(originalPayload, endpoint, userId):
   Main function that orchestrates all enrichment.
   
   Input:
   - originalPayload: The raw Calendly webhook
   - endpoint: The endpoint record with enrichment settings
   - userId: For reschedule detection across user's endpoints
   
   Logic:
   - Extract calendly_event_uuid from payload.event.uuid
   - Extract invitee_email from payload.invitee.email
   - Call enrichers based on endpoint settings:
     * If enable_question_parsing: parseCustomQuestions()
     * If enable_reschedule_detection: detectReschedule()
     * If enable_utm_tracking: extractUTMParameters()
   
   Output format:
   {
     original: { ...originalPayload },
     enriched: {
       parsed_questions: { ... } | null,
       reschedule_info: { isReschedule: boolean, ... } | null,
       utm_tracking: { ... } | null,
       enriched_at: "2024-01-15T10:05:00Z"
     },
     metadata: {
       calendly_event_uuid: "...",
       invitee_email: "...",
       event_type: "invitee.created"
     }
   }

Use TypeScript with proper types. Add JSDoc comments for each function.
Include comprehensive error handling:
- If parseCustomQuestions fails, return null for parsed_questions
- If detectReschedule fails, return { isReschedule: false }
- If extractUTMParameters fails, return all nulls
- Always return original payload even if enrichment fails
- Log errors but don't throw - webhook should still forward

Add unit tests for each function if possible.
```

---

### **PROMPT 9: Webhook Receiver API Endpoint**

```
Create the main webhook receiver at /app/api/webhook/calendly/[endpointId]/route.ts

This API route receives webhooks from Calendly and enriches them.

Flow:

1. RATE LIMITING (do this first, before any database queries):
   Install @upstash/ratelimit
   
   const rateLimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute per endpoint
   });
   
   const { success } = await rateLimit.limit(endpointId);
   if (!success) {
     return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
   }

2. Extract endpointId from URL params:
   const { endpointId } = params;

3. Look up this specific endpoint with user info:
   const endpoint = await supabase
     .from('webhook_endpoints')
     .select('*, users(*)')
     .eq('id', endpointId)
     .single();
   
   If not found, return 404
   
4. Check subscription status:
   - If user.subscription_status === 'cancelled' or 'expired':
     Log as 'inactive' status
     Return 200 OK to Calendly (so they don't retry)
     Don't process further
   
   - If endpoint.is_active === false:
     Log as 'inactive' status
     Return 200 OK
     Don't process further

5. Parse Calendly payload:
   const payload = await request.json();
   
   Extract:
   - calendlyEventUuid = payload.event?.uuid
   - inviteeEmail = payload.invitee?.email
   - eventType = payload.event (e.g., "invitee.created", "invitee.canceled")
   
   If any of these are missing, log error and return 400

6. DUPLICATE DETECTION (critical!):
   Check if we already processed this exact webhook:
   
   const existing = await supabase
     .from('webhook_logs')
     .select('id')
     .eq('endpoint_id', endpointId)
     .eq('calendly_event_uuid', calendlyEventUuid)
     .eq('event_type', eventType)
     .single();
   
   If exists:
     console.log('Duplicate webhook, already processed');
     Log as 'duplicate' status
     Return 200 OK
     Don't process again (prevents duplicate bookings in destination systems)

7. Enrich the webhook data:
   Call enrichWebhookPayload() from /lib/parsers/calendly-enricher.ts
   
   const enriched = await enrichWebhookPayload(
     payload,
     endpoint,
     endpoint.user_id
   );
   
   This returns the enriched payload with parsed questions, reschedule detection, UTM tracking.

8. Forward enriched payload to destination:
   try {
     const response = await fetch(endpoint.destination_url, {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         'User-Agent': 'CalRouter/1.0'
       },
       body: JSON.stringify(enriched),
       signal: AbortSignal.timeout(10000) // 10 second timeout
     });
     
     const responseCode = response.status;
     const isSuccess = responseCode >= 200 && responseCode < 300;
     
   } catch (error) {
     // Timeout or network error
     const responseCode = 0;
     const isSuccess = false;
   }

9. Log everything in webhook_logs:
   await supabase.from('webhook_logs').insert({
     endpoint_id: endpointId,
     calendly_event_uuid: calendlyEventUuid,
     invitee_email: inviteeEmail,
     event_type: eventType,
     original_payload: payload,
     enriched_payload: enriched,
     is_reschedule: enriched.enriched.reschedule_info?.isReschedule || false,
     utm_source: enriched.enriched.utm_tracking?.utm_source,
     utm_medium: enriched.enriched.utm_tracking?.utm_medium,
     utm_campaign: enriched.enriched.utm_tracking?.utm_campaign,
     utm_term: enriched.enriched.utm_tracking?.utm_term,
     utm_content: enriched.enriched.utm_tracking?.utm_content,
     status: isSuccess ? 'success' : 'failed',
     response_code: responseCode,
     error_message: isSuccess ? null : error.message,
     processed_at: new Date().toISOString()
   });

10. If reschedule detected, also log in reschedule_tracking:
    if (enriched.enriched.reschedule_info?.isReschedule) {
      await supabase.from('reschedule_tracking').insert({
        user_id: endpoint.user_id,
        calendly_event_uuid: calendlyEventUuid,
        invitee_email: inviteeEmail,
        cancellation_log_id: enriched.enriched.reschedule_info.originalCancellationId,
        creation_log_id: insertedLogId,
        detected_at: new Date().toISOString()
      });
    }

11. Return 200 OK to Calendly ALWAYS:
    Even if forwarding failed, return success so Calendly doesn't retry
    We've logged the failure for the user to see
    
    return Response.json({ 
      ok: true, 
      processed: true,
      enriched: true 
    });

Include comprehensive error handling:
- Try-catch around entire handler
- Log all errors to console with context
- Always return 200 to Calendly (prevents retry loops)

Add detailed console.log statements for debugging:
- "Received webhook for endpoint: {endpointId}"
- "Processing event: {eventType} for {inviteeEmail}"
- "Enrichment complete: {features enabled}"
- "Forwarding to: {destination_url}"
- "Response: {status code}"

CRITICAL NOTES:
- Rate limiting prevents abuse
- Duplicate detection prevents processing same webhook twice
- Subscription checks prevent inactive users from consuming resources
- Always return 200 to Calendly (prevents retry storms)
- All state stored in database (for debugging and analytics)
```

---

### **PROMPT 10: Webhook Logs Page**

```
Create /app/dashboard/logs/page.tsx for viewing webhook activity.

Features:
1. Page title "Webhook Activity Logs"
2. Filters at top:
   - Filter by endpoint (dropdown)
   - Filter by status (All, Success, Failed)
   - Filter by type (All, New Booking, Reschedule, Cancellation)
   - Date range (last 24h, 7 days, 30 days)

3. Table showing recent logs:
   - Timestamp
   - Endpoint name
   - Event type
   - Reschedule badge (if detected as reschedule)
   - UTM Source (if captured)
   - Status (badge - green for success, red for failed)
   - Response code
   - View details button

4. Pagination (show 50 per page)
5. Auto-refresh every 30 seconds
6. Click row to expand and see:
   - Original Calendly payload (JSON)
   - Enriched payload sent to destination (JSON)
   - Parsed custom questions (if any)
   - UTM parameters (if any)
   - Reschedule detection info (if applicable)

Use shadcn/ui Table, Badge, Select, Tabs, and Collapsible components.
Fetch from webhook_logs table with joins to get endpoint names.
Show enrichment data clearly - use tabs or sections to separate original vs enriched data.
```

---

### **PROMPT 11: Calendly Integration Guide Page**

```
Create /app/dashboard/setup/page.tsx - a comprehensive setup guide.

This page explains the endpoint-based architecture and setup process.

Structure:

1. Hero section:
   - Title: "How to Connect Calendly"
   - Subtitle: "Each endpoint you create gets its own unique webhook URL"
   - Visual diagram showing: Calendly → Your Endpoint URL → CalRouter → Your Destination

2. Step-by-step setup (use numbered steps with icons):

   STEP 1: "Create Your First Endpoint"
   - Click the Endpoints tab in the sidebar
   - Click "+ Create Endpoint"
   - Give it a name (e.g., "VIP Consultations")
   - Enter your destination URL (from Zapier, Make, etc)
   - Choose enrichment features
   - Click Create
   - Copy the generated webhook URL

   STEP 2: "Add URL to Calendly"
   - Go to Calendly Settings → Webhooks
   - Click "Add Webhook"
   - Paste your CalRouter endpoint URL
   - Select which Calendly EVENTS to subscribe to:
     ✓ invitee.created (when someone books)
     ✓ invitee.canceled (when someone cancels)
     ✗ Don't select invitee_no_show unless you need it
   - Click Save
   
   IMPORTANT CLARIFICATION (with alert/callout):
   "📌 Calendly Event Types vs Booking Types
   
   In Calendly webhook settings, you select EVENT types:
   - invitee.created = any new booking
   - invitee.canceled = any cancellation
   
   You CANNOT filter by booking type (like '30 Min Meeting' vs 'Discovery Call').
   
   If you want different handling for different booking types:
   - Create multiple CalRouter endpoints
   - Each with different destination URLs
   - Add all endpoint URLs to Calendly
   - Use your destination tool (Zapier/Make) to filter by booking type if needed"

   STEP 3: "Connect Your Automation Tool"
   
   Tabs for each tool:
   
   [Zapier Tab]
   - Create new Zap
   - Trigger: "Webhooks by Zapier" → "Catch Hook"
   - Copy the webhook URL Zapier provides
   - Go back to CalRouter
   - Paste Zapier's URL as the "Destination URL" in your endpoint
   - Test your Zap
   - Continue building your automation
   
   [Make.com Tab]
   - Similar instructions for Make
   
   [n8n Tab]
   - Similar instructions
   
   [Custom Webhook Tab]
   - Any HTTPS endpoint that accepts JSON POST requests
   - Must respond with 2xx status code
   - Receives enriched payload with parsed data

3. "What Gets Enriched" section:
   
   Visual comparison (side-by-side):
   
   LEFT: "Raw Calendly Webhook"
   ```json
   {
     "event": "invitee.created",
     "payload": {
       "questions_and_answers": [
         {"question": "Budget?", "answer": "$5k", "position": 0}
       ],
       "tracking": {
         "utm_source": "facebook"
       }
     }
   }
   ```
   
   RIGHT: "Enriched by CalRouter"
   ```json
   {
     "original": { ... },
     "enriched": {
       "parsed_questions": {
         "budget": "$5k"
       },
       "utm_tracking": {
         "utm_source": "facebook"
       },
       "reschedule_info": {
         "isReschedule": false
       }
     }
   }
   ```

4. "Advanced: Multiple Endpoints" section:
   
   Show example setup:
   "You can create multiple endpoints for different routing scenarios:
   
   Endpoint 1: 'Standard Bookings'
   → Routes to: Zapier (adds to Google Sheet)
   → Enrichment: UTM tracking only
   
   Endpoint 2: 'VIP Bookings'
   → Routes to: Make.com (creates CRM contact + sends Slack notification)
   → Enrichment: All features enabled
   
   Endpoint 3: 'Analytics Only'
   → Routes to: Your analytics API
   → Enrichment: None (raw data)
   
   Add all 3 URLs to Calendly and they'll all receive webhooks!"

5. Testing section:
   - "Test Your Setup" button
   - Sends mock webhook to all active endpoints
   - Shows results for each endpoint
   - Displays what was sent and what was received

6. Troubleshooting accordion:
   
   Q: "Not receiving webhooks?"
   A: Check: Calendly webhook is active, Endpoint is active, Check logs for errors
   
   Q: "Enrichment not working?"
   A: Verify toggles are ON, Check logs to see original vs enriched data
   
   Q: "Destination URL not responding?"
   A: Test URL manually, Check timeout settings, Verify URL accepts JSON POST

7. Quick reference card (always visible sidebar):
   - Your endpoint URLs (list all active endpoints with copy buttons)
   - Link to Calendly webhook settings
   - Link to logs page
   - Support contact

Use shadcn/ui Alert, Code blocks, Tabs, Accordion, Card, and Button components.
Make it very beginner-friendly with screenshots/placeholders.
Use clear, actionable language.

CRITICAL MESSAGING:
- Each endpoint = one webhook URL
- Users can have unlimited endpoints
- Each endpoint can route to a different destination
- All enrichment happens before forwarding
- Calendly event types (invitee.created) ≠ booking types ("30 Min Meeting")
```

---

### **PROMPT 12: Integrations Page**

```
Create /app/integrations/page.tsx - a page showing compatible automation tools.

This page should include:
1. Hero section:
   - Headline: "Works with your favorite automation tools"
   - Subheadline: "CalRouter enriches your Calendly data, then routes it anywhere"

2. Featured integrations grid (with logos/icons):
   - Zapier - "Most popular automation platform"
   - Make.com - "Visual automation builder"
   - n8n - "Open-source workflow automation"
   - Integrately - "Simple integrations"
   - Custom Webhooks - "Send to any HTTPS endpoint"

3. For each integration, show:
   - Logo/icon
   - Brief description
   - "How to Connect" button (links to docs)
   - Badge showing "Popular" or "Advanced"

4. What makes CalRouter different section:
   - "Receive pre-parsed custom questions"
   - "Automatic reschedule detection"
   - "Built-in UTM tracking"
   - "No complex Zapier formatter steps needed"

5. Example use cases section:
   - "Send consultation bookings to HubSpot with lead source tracking"
   - "Detect rescheduled calls and update CRM status automatically"
   - "Route qualified leads (based on answers) to sales team via Slack"

6. CTA: "Start enriching your Calendly webhooks today - $16/month"

Use shadcn/ui Card, Badge, and Button components.
Make it clean and organized. Emphasize the enrichment value, not just routing.
```

---

### **PROMPT 13: Enrichment Settings Page**

```
Create /app/dashboard/settings/page.tsx for account settings.

Include:
1. Profile section:
   - Email (read-only from Clerk)
   - Display name (editable)

2. API Settings section:
   - Show user's unique webhook URL
   - Regenerate URL button (creates new unique ID)
   - API key for potential future use

3. Danger zone:
   - Delete all endpoints button
   - Delete account button (with confirmation)

Use shadcn/ui Card, Input, Button, and AlertDialog for confirmations.
Keep it simple and organized in sections.
```

---

### **PROMPT 15: Billing & Subscription Page**

```
Create /app/dashboard/billing/page.tsx for subscription management.

Show:
1. Current plan status (Trial or Active)
2. Trial countdown if on trial (e.g., "5 days left in trial")
3. Simple pricing card:
   - $16/month
   - "Everything included - one simple plan"
   - Features list:
     * Unlimited endpoints
     * Unlimited webhooks
     * Event type filtering
     * Reschedule detection
     * Custom question parsing
     * UTM tracking
     * Email support
4. "Upgrade to Pro" or "Manage Subscription" button
5. Billing history table (invoice date, amount, status, download link)
6. Usage stats this month:
   - Webhooks processed
   - Reschedules detected
   - Questions parsed
   - UTM sources tracked

For now, use mock data for billing history.
We'll implement actual Stripe integration in the next step.

Use shadcn/ui Card, Badge, Progress, and Table components.
Keep messaging simple: "One plan. Everything included. $16/month."
```

---

### **PROMPT 16: Stripe Integration - Checkout & Webhooks**

```
Integrate Stripe for payments with comprehensive webhook handling.

Tasks:

1. Create /app/api/stripe/create-checkout/route.ts:
   - Create Stripe checkout session for $16/month subscription
   - Product name: "CalRouter for Calendly - Pro"
   - Include user's Clerk ID and email in metadata
   - Set success_url to /dashboard/success
   - Set cancel_url to /dashboard/billing
   - Enable customer portal for subscription management

2. Create /app/api/stripe/webhook/route.ts:
   
   CRITICAL: Verify webhook signature first!
   ```typescript
   const sig = request.headers.get('stripe-signature');
   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
   
   let event;
   try {
     event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
   } catch (err) {
     return Response.json({ error: 'Invalid signature' }, { status: 400 });
   }
   ```
   
   Handle these events:
   
   a) checkout.session.completed:
      - Extract customer email and clerk_user_id from metadata
      - Update users table:
        * subscription_status = 'active'
        * stripe_customer_id = event.data.object.customer
        * trial_ends_at = null (no longer on trial)
      - Send welcome email
   
   b) customer.subscription.deleted:
      - Find user by stripe_customer_id
      - Update subscription_status = 'cancelled'
      - Set all their endpoints to is_active = false
      - Send cancellation confirmation email
   
   c) customer.subscription.updated:
      - Handle plan changes, renewals
      - Update subscription_status based on subscription.status
      - If status = 'past_due' or 'unpaid', set endpoints to inactive
   
   d) invoice.payment_failed:
      - Find user by customer ID
      - Send payment failure email
      - After 3 failures, set subscription_status = 'cancelled'
   
   e) invoice.payment_succeeded:
      - Update last_payment_date
      - Send receipt email

3. Wire up the "Upgrade to Pro" / "Start Free Trial" button:
   - Call /api/stripe/create-checkout
   - Redirect user to Stripe checkout page
   - Handle loading state while creating session

4. Create /app/dashboard/success/page.tsx:
   - Show after successful checkout
   - Message: "🎉 Welcome to CalRouter Pro!
     Your Calendly webhooks are now being enriched.
     Next steps:
     1. Create your first endpoint
     2. Add the webhook URL to Calendly
     3. Start receiving enriched bookings!"
   - Button: "Go to Endpoints"
   - Button: "View Setup Guide"

5. Add customer portal link in billing page:
   - "Manage Subscription" button
   - Creates Stripe portal session
   - Redirects to Stripe's customer portal
   - Users can update payment method, cancel subscription, view invoices

Use @stripe/stripe-js for client-side, stripe package for server-side.
Follow Stripe's webhook signature verification exactly - security critical!

Environment variables needed:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (from Stripe dashboard after creating webhook endpoint)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Test with Stripe CLI locally:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### **PROMPT 17: Trial Expiry & Subscription Monitoring**

```
Create automated trial expiry checking and subscription monitoring.

1. Create /app/api/cron/check-trials/route.ts:
   
   This runs daily via Vercel Cron to check for expired trials.
   
   Logic:
   - Find all users where:
     * subscription_status = 'trial'
     * trial_ends_at < now()
   
   - For each expired trial user:
     * Update subscription_status = 'expired'
     * Set all their endpoints to is_active = false
     * Send "trial expired" email with upgrade link
     * Log the action
   
   Example query:
   ```sql
   SELECT * FROM users
   WHERE subscription_status = 'trial'
     AND trial_ends_at < now()
   ```
   
   IMPORTANT: This must be a verified Vercel Cron route.
   Add to vercel.json:
   ```json
   {
     "crons": [{
       "path": "/api/cron/check-trials",
       "schedule": "0 2 * * *"
     }]
   }
   ```
   Runs daily at 2 AM UTC.
   
   Security: Verify cron secret in route handler:
   ```typescript
   const authHeader = request.headers.get('authorization');
   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
     return Response.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. Create /app/api/cron/check-subscriptions/route.ts:
   
   Runs daily to check for subscription issues not caught by webhooks.
   
   Logic:
   - Query Stripe for all customer subscriptions
   - Compare with database state
   - Fix any discrepancies (webhook might have failed)
   - Update users where Stripe status differs from database
   
   This is a safety net for missed webhooks.

3. Send reminder emails 3 days before trial expiry:
   
   In check-trials route, also find users where:
   - subscription_status = 'trial'
   - trial_ends_at between now() and now() + 3 days
   - last_reminder_sent < now() - 24 hours (don't spam)
   
   Send email:
   "Your CalRouter trial ends in 3 days!
   
   You've enriched [X] webhooks and detected [Y] reschedules.
   
   Upgrade for just $16/month to keep your automations running.
   
   [Upgrade Now]"

4. Handle subscription edge cases:
   
   - Subscription past_due:
     * Set endpoints to inactive
     * Send payment reminder
     * Give 7 days before full cancellation
   
   - Subscription unpaid:
     * Disable immediately
     * Send urgent payment notice
   
   - Subscription canceled (scheduled end):
     * Send "last days" reminder
     * Disable on cancellation date
     * Offer to reactivate

Add these environment variables:
- CRON_SECRET (random string to verify cron requests)

Use Resend or SendGrid for emails.
Log all cron job runs to database for debugging.
```

---

### **PROMPT 18: Overview Dashboard Page**

```
Create /app/dashboard/page.tsx - the main overview dashboard.

Display these stats cards in a grid:
1. Total Endpoints (count)
2. Active Endpoints (count where is_active = true)
3. Webhooks Processed (last 30 days)
4. Reschedules Detected (last 30 days)
5. Questions Parsed (last 30 days)
6. UTM Sources Tracked (unique count, last 30 days)
7. Success Rate (percentage)

Below stats, show:
8. Recent Activity feed (last 10 webhook logs with enrichment highlights)
9. Quick insights:
   - Most active event type
   - Top UTM source
   - Average reschedule rate
10. Quick actions: "Create Endpoint", "View Logs", "Setup Guide"

Use shadcn/ui Card for stats, each with icon from lucide-react.
Make it visually appealing with good use of whitespace.
Fetch real data from Supabase.
Show enrichment metrics prominently to demonstrate value.
```

---

### **PROMPT 19: Edit Endpoint Functionality**

```
Add edit functionality for endpoints.

Tasks:
1. Create /components/edit-endpoint-dialog.tsx (similar to create dialog)
2. Pre-populate form with existing endpoint data INCLUDING enrichment toggles
3. Add "Edit" button to each row in endpoints table
4. On save, update the endpoint in Supabase (including enrichment settings)
5. Show confirmation toast
6. Refresh the endpoints list

Reuse validation logic from create dialog.
Use same shadcn/ui components for consistency.
Make sure enrichment feature toggles can be changed and saved.
```

---

### **PROMPT 20: Delete Endpoint with Confirmation**

```
Add delete functionality for endpoints.

Tasks:
1. Add delete button to each endpoint row (trash icon)
2. Show confirmation AlertDialog before deleting:
   - "Are you sure? This will stop forwarding webhooks for this event type."
   - Show endpoint name in warning
3. On confirm, soft delete or hard delete from database
4. Also delete associated webhook_logs or cascade
5. Show success toast and refresh list

Use shadcn/ui AlertDialog for confirmation.
Make the delete button red/destructive variant.
```

---

### **PROMPT 21: Search & Filter Endpoints**

```
Add search and filtering to the endpoints page.

Add at top of /app/dashboard/endpoints/page.tsx:
1. Search input (filter by endpoint name)
2. Filter dropdown for status (All, Active, Inactive)
3. Sort dropdown (Newest, Oldest, Name A-Z)

Implement client-side filtering using React state.
Use shadcn/ui Input and Select components.
Add debouncing to search input for performance.
```

---

### **PROMPT 22: Mobile Responsiveness**

```
Make the entire app mobile-responsive.

Go through these pages and make them mobile-friendly:
1. Landing page - stack sections vertically
2. Dashboard layout - hamburger menu for sidebar on mobile
3. Tables - make them scrollable or switch to card layout on small screens
4. Forms/modals - full-screen on mobile

Use Tailwind's responsive classes (sm:, md:, lg:).
Test each page at mobile breakpoints (375px, 428px).
Use shadcn/ui Sheet component for mobile nav drawer.
```

---

### **PROMPT 23: Error Handling & Toast Notifications**

```
Add comprehensive error handling and user feedback.

Tasks:
1. Install and setup sonner or react-hot-toast
2. Add error boundaries to main layouts
3. Add try-catch blocks to all API calls
4. Show toast notifications for:
   - Endpoint created/updated/deleted
   - Webhook forwarding failures
   - API errors
5. Create error pages: /app/error.tsx and /app/not-found.tsx

Use consistent error messages. Make them user-friendly, not technical.
```

---

### **PROMPT 24: Testing Webhooks Feature**

```
Add a "Test Webhook" feature for debugging.

Create /app/dashboard/endpoints/[id]/test/page.tsx:
1. Show a form to manually trigger a test webhook
2. JSON editor to input custom payload with sample Calendly data (or use a template)
3. Toggle to enable/disable enrichment in test (show before/after)
4. "Send Test" button
5. Display side-by-side comparison:
   - Original payload (what you sent)
   - Enriched payload (what gets forwarded)
   - Response from destination URL
6. Show success/failure status
7. Log the test in webhook_logs with a "test" flag

Include sample payloads for:
- New booking with custom questions
- Cancellation (for reschedule testing)
- Booking with UTM parameters

Use a JSON editor component or simple textarea.
Make it easy for users to verify their enrichment setup works.
Show the value of enrichment visually.
```

---

### **PROMPT 25: Rate Limiting & Security**

```
Add comprehensive security measures including rate limiting.

Tasks:

1. Install @upstash/ratelimit and @upstash/redis

2. Rate limiting is ALREADY implemented in PROMPT 9 (webhook receiver).
   Verify it's in place: 100 requests per minute per endpoint.

3. Add rate limiting to other sensitive endpoints:
   
   /app/api/endpoints/create/route.ts:
   - Limit to 10 endpoint creations per hour per user
   - Prevents abuse (mass endpoint creation)
   
   /app/api/test-webhook/route.ts:
   - Limit to 30 test requests per hour per user
   - Prevents DoS attacks on destination URLs

4. Input sanitization (already using Zod, but add):
   - Validate destination URLs don't point to internal IPs
   - Block localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x
   - Prevent SSRF attacks
   
   ```typescript
   function isInternalUrl(url: string): boolean {
     const hostname = new URL(url).hostname;
     return hostname === 'localhost' 
       || hostname.startsWith('127.')
       || hostname.startsWith('192.168.')
       || hostname.startsWith('10.')
       || hostname.startsWith('172.16.')
       || hostname.startsWith('172.31.');
   }
   ```

5. CORS headers for API routes (webhook receiver doesn't need CORS):
   - Only allow from your domain
   - Set proper CORS headers on dashboard API routes

6. Environment variable validation on startup:
   Create /lib/env.ts:
   ```typescript
   if (!process.env.SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
   if (!process.env.CLERK_SECRET_KEY) throw new Error('Missing CLERK_SECRET_KEY');
   // ... check all required vars
   ```
   Import this file in layout.tsx

7. Request logging for debugging (already mentioned in PROMPT 9):
   - Log all webhook receiver requests
   - Include: endpoint ID, event type, timestamp, IP address
   - Don't log full payloads (PII concerns)

8. Add CSP (Content Security Policy) headers in next.config.js:
   ```javascript
   async headers() {
     return [{
       source: '/(.*)',
       headers: [
         {
           key: 'Content-Security-Policy',
           value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..."
         }
       ]
     }];
   }
   ```

Rate limiting libraries installed:
- @upstash/ratelimit
- @upstash/redis

Connect to Upstash Redis for rate limit storage.
Free tier: 10,000 requests/day (plenty for rate limit checks).
```

---

### **PROMPT 26: Email Notifications**

```
Add email notifications for important events.

Create email templates using React Email:
1. Welcome email when user signs up:
   - "Welcome to CalRouter!"
   - Highlight the 3 enrichment features
   - Quick start guide link
   
2. Webhook failure alert (if endpoint fails 3+ times):
   - Which endpoint is failing
   - Error details
   - Suggest checking destination URL

3. Trial ending reminder (3 days before end):
   - "Your trial ends in 3 days"
   - Show value: "You've enriched X webhooks, detected Y reschedules"
   - CTA to upgrade for $16/month

4. Monthly summary:
   - Webhooks processed
   - Reschedules detected
   - Questions parsed
   - UTM sources discovered
   - Top performing endpoints

Set up email sending with Resend or SendGrid.
Create /app/api/send-email/route.ts for internal use.
Make emails beautiful, branded, and show the enrichment value.
```

---

### **PROMPT 27: Documentation Page**

```
Create /app/docs/page.tsx - a comprehensive documentation page.

Include:
1. Getting Started guide:
   - How to connect Calendly
   - How to create your first endpoint
   - How enrichment works

2. Enrichment Features Deep Dive:
   - Reschedule Detection (how it works, use cases, examples)
   - Question Parsing (supported question types, format examples)
   - UTM Tracking (what gets captured, attribution examples)

3. API Reference:
   - Webhook URL format
   - Expected Calendly payload structure
   - Enriched payload structure (before/after examples)
   - Response codes
   - Error handling

4. Integration Guides:
   - Setting up with Zapier (step-by-step)
   - Setting up with Make.com
   - Setting up with n8n
   - Using custom webhooks

5. FAQs section:
   - "What happens to my data?"
   - "How does reschedule detection work?"
   - "Can I disable enrichment for specific endpoints?"
   - "What Calendly events are supported?"

6. Troubleshooting common issues
7. Link to contact support

Use shadcn/ui Accordion for FAQ section, Tabs for different integration guides.
Make it searchable with a search input at top.
Use clean typography and code blocks for payload examples.
Show side-by-side comparisons of raw vs enriched data.
```

---

### **PROMPT 28: Performance Optimization**

```
Optimize the app for performance.

Tasks:
1. Add React Server Components where possible
2. Implement data caching using Next.js cache
3. Add loading.tsx files to dashboard routes
4. Optimize images (use Next.js Image component)
5. Minimize client-side JavaScript
6. Add database indexes on frequently queried columns
7. Implement pagination on logs page properly

Run Lighthouse audit and fix any issues.
Aim for 90+ performance score.
```

### **PROMPT 28: Performance Optimization**

```
Optimize the app for performance and scale.

Tasks:

1. Database query optimization:
   
   a) Add database indexes (already in PROMPT 4, verify they're created):
      - webhook_logs.calendly_event_uuid (for duplicate detection)
      - webhook_logs.created_at (for time-based queries)
      - webhook_logs.endpoint_id (for per-endpoint queries)
   
   b) Optimize dashboard queries:
      - Don't load full payloads in list views
      - Use SELECT only needed columns
      - Add LIMIT clauses
      - Use pagination with OFFSET
   
   c) Stats queries with time filters:
      Always include created_at > now() - interval '30 days'
      This uses the created_at index
   
   d) Consider caching stats on dashboard:
      - Cache for 5 minutes
      - Use React Query or SWR with staleTime
      - Reduces database load

2. React Server Components:
   
   Use Server Components by default for:
   - Dashboard layout
   - Endpoints list (initial load)
   - Logs page (initial load)
   - Setup guide (static content)
   
   Use Client Components only for:
   - Forms (create/edit endpoint)
   - Toggles and interactive elements
   - Charts and analytics visualizations
   
   Mark with 'use client' directive only when needed.

3. Add loading.tsx files to dashboard routes:
   
   /app/dashboard/loading.tsx:
   - Shows skeleton for entire dashboard
   
   /app/dashboard/endpoints/loading.tsx:
   - Shows skeleton cards for endpoints
   
   /app/dashboard/logs/loading.tsx:
   - Shows skeleton table rows

4. Image optimization (if adding images/logos later):
   - Use Next.js Image component
   - Specify width and height
   - Use proper formats (WebP with JPEG fallback)

5. Minimize client-side JavaScript:
   - Remove unused imports
   - Use dynamic imports for heavy components:
     ```typescript
     const Chart = dynamic(() => import('./Chart'), { 
       loading: () => <Skeleton /> 
     });
     ```
   - Tree-shake lodash (import individual functions)

6. Implement pagination properly:
   
   Logs page uses offset-based:
   ```sql
   SELECT ... FROM webhook_logs
   ORDER BY created_at DESC
   LIMIT 50 OFFSET ?
   ```
   
   This is fine for small datasets (<10k rows).
   For larger datasets, use cursor-based:
   ```sql
   SELECT ... FROM webhook_logs
   WHERE created_at < ?
   ORDER BY created_at DESC
   LIMIT 50
   ```

7. Add data caching in Next.js:
   
   For static data (doesn't change often):
   ```typescript
   export const revalidate = 300; // 5 minutes
   ```
   
   For dynamic data (changes frequently):
   ```typescript
   export const dynamic = 'force-dynamic';
   ```

8. Optimize webhook receiver (PROMPT 9):
   Already optimized with:
   - Rate limiting (prevents overload)
   - Early returns (inactive endpoints don't process)
   - Async forwarding (doesn't block response)
   - Indexed queries (fast lookups)

9. Bundle size optimization:
   - Check bundle size: npm run build
   - Aim for <300KB initial JS bundle
   - Use @next/bundle-analyzer to identify large deps
   - Consider removing unused shadcn/ui components

10. Lighthouse audit:
    Run Lighthouse on key pages:
    - Landing page: Aim for 90+ performance
    - Dashboard: Aim for 80+ performance
    - Fix any critical issues

Target metrics:
- Time to First Byte (TTFB): <200ms
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Dashboard load time: <2s
- Webhook processing: <500ms (excluding destination response time)
```

---

### **PROMPT 29: Analytics & Monitoring**

```
Add analytics and monitoring features.

Implement:
1. Track key metrics:
   - Total webhooks received
   - Success/failure rates
   - Popular event types
   - Reschedule rate (%)
   - Question parsing success rate
   - UTM source breakdown
   - Average response times

2. Create /app/dashboard/analytics/page.tsx:
   - Chart showing webhooks over time (use recharts)
   - Event type breakdown (pie chart)
   - Reschedule detection stats (line chart over time)
   - UTM source breakdown (bar chart)
   - Question parsing activity (success rate trend)
   - Success rate trend
   - Top 5 destination endpoints by volume

3. Add error tracking with Sentry or similar
4. Set up uptime monitoring for webhook endpoint
5. Alert if enrichment parsers fail repeatedly

Keep charts simple and useful. Use shadcn/ui chart components or recharts.
Make analytics show the VALUE of enrichment (not just volume).
Include filters for date ranges and specific endpoints.
```

---

### **PROMPT 30: Final Polish & Launch Prep**

```
Final touches before launch.

Tasks:
1. Add meta tags for SEO:
   - Title: "CalRouter for Calendly - Webhook Enrichment & Routing"
   - Description: "Automatically detect reschedules, parse custom questions, and track UTM sources in your Calendly webhooks. $16/month."
   - OG images

2. Create favicon and app icons
3. Add loading states to all async operations
4. Write helpful placeholder texts and empty states that explain enrichment value
5. Add a /privacy and /terms page (basic templates)
6. Test all user flows end-to-end:
   - Signup → Create endpoint with enrichment → Receive webhook → View enriched data
7. Create a /sitemap.xml
8. Set up analytics (PostHog, Plausible, or GA4)
9. Create a launch checklist:
   - Product Hunt post ready
   - Demo video showing enrichment
   - Social media graphics
   - Email to beta list

Make sure every touchpoint reinforces the enrichment value proposition.
Test that enrichment features work correctly with sample Calendly payloads.
```

---

## 🚀 Deployment Checklist

After all prompts are complete:

1. **Environment Variables Setup:**
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_APP_URL=
   ```

2. **Vercel Deployment:**
   - Connect GitHub repo
   - Add environment variables
   - Deploy
   - Set up custom domain

3. **Database Setup:**
   - Run schema.sql in Supabase
   - Set up RLS policies
   - Create indexes

4. **Stripe Setup:**
   - Create product and pricing
   - Set up webhook endpoint
   - Test checkout flow

5. **DNS & Domain:**
   - Point domain to Vercel
   - Set up SSL (automatic with Vercel)

---

## 💰 Post-Launch Checklist

1. Post on:
   - Product Hunt (emphasize enrichment features, not just routing)
   - Reddit (r/SaaS, r/Calendly, r/entrepreneur)
   - Indie Hackers
   - Twitter/X with demo of reschedule detection

2. Reach out to:
   - Calendly power users on Twitter
   - Virtual assistant agencies
   - Coaching communities
   - Sales automation groups

3. Content marketing:
   - Write blog post "How to Automatically Detect Calendly Reschedules"
   - Write blog post "Stop Losing Lead Source Data in Calendly"
   - Write blog post "Parse Calendly Custom Questions Without Zapier Formatters"
   - Create demo video showing enrichment in action
   - SEO optimization for "Calendly webhook enrichment"

4. Monitor:
   - Error rates in enrichment parsers
   - Conversion rates (trial → paid)
   - Churn rates
   - User feedback on enrichment accuracy
   - Which enrichment features get used most

---

## 📈 Future Features (v2)

Once you have paying customers:
- Custom field mapping (let users define their own transformations)
- Conditional routing based on parsed answers (if answer = X, route to Y)
- Multi-language question parsing
- Integration with HubSpot/Salesforce APIs (skip webhooks entirely)
- Team collaboration features
- Custom enrichment rules (regex patterns, data validation)
- Webhook replay functionality (re-send with different enrichment settings)
- A/B testing for different routing strategies

---

## 🎯 Success Metrics

**MVP Success = First Paying Customer Who Uses Enrichment**

**Month 1 Goals:**
- 50 signups
- 10 paying customers ($160 MRR)
- 80%+ of users enable at least one enrichment feature

**Month 3 Goals:**
- 200 signups
- 50 paying customers ($800 MRR)
- Average 2.5 enrichment features enabled per user

**Month 6 Goals:**
- 500 signups
- 150 paying customers ($2,400 MRR)
- Testimonials about enrichment saving time

---

## ⚡ Quick Start Command

When you're ready to start, copy this entire document and begin with **PROMPT 1**. Build incrementally, test each feature before moving to the next.

**Estimated build time:** 2-3 weeks working part-time with Claude Code.

**Good luck! 🚀**

---

*Remember: Start with the MVP (Prompts 1-16), get users, then add the polish (Prompts 17-26). Ship fast, iterate faster.*
