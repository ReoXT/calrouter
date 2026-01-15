# CalRouter Webhook Parsers

## Overview
This directory contains the enrichment parsers that process Calendly webhooks and extract valuable data.

## Files

- **question-parser.ts** - Parses custom questions from Calendly forms
- **reschedule-detector.ts** - Detects when bookings are reschedules vs new bookings
- **utm-extractor.ts** - Extracts UTM tracking parameters
- **enricher.ts** - Main orchestrator that runs all parsers

## Example Calendly Webhook Payloads

### 1. New Booking (invitee.created)

```json
{
  "event": "invitee.created",
  "payload": {
    "event": "https://api.calendly.com/scheduled_events/abc123-def456-ghi789",
    "email": "customer@example.com",
    "name": "John Doe",
    "created_at": "2026-01-15T10:30:00.000Z",
    "questions_and_answers": [
      {
        "question": "What's your budget?",
        "answer": "$5,000 - $10,000"
      },
      {
        "question": "Company size?",
        "answer": "10-50 employees"
      }
    ],
    "tracking": {
      "utm_source": "facebook",
      "utm_medium": "cpc",
      "utm_campaign": "spring_2026"
    }
  }
}
```

### 2. Cancellation (invitee.canceled)

```json
{
  "event": "invitee.canceled",
  "payload": {
    "event": "https://api.calendly.com/scheduled_events/abc123-def456-ghi789",
    "email": "customer@example.com",
    "name": "John Doe",
    "canceled_at": "2026-01-15T10:35:00.000Z"
  }
}
```

### 3. Reschedule (invitee.canceled + invitee.created within 10 min)

**Step 1: Cancel old time**
```json
{
  "event": "invitee.canceled",
  "payload": {
    "event": "https://api.calendly.com/scheduled_events/old-event-uuid-111",
    "email": "customer@example.com"
  }
}
```

**Step 2: Book new time (within 10 minutes)**
```json
{
  "event": "invitee.created",
  "payload": {
    "event": "https://api.calendly.com/scheduled_events/new-event-uuid-222",
    "email": "customer@example.com"
  }
}
```

## Parser Behavior

### Question Parser (`parseCustomQuestions`)

**Input:** Calendly payload with `questions_and_answers` array

**Output:** Clean key-value object

```typescript
// Input
{
  "questions_and_answers": [
    {"question": "What's your budget?", "answer": "$5k"},
    {"question": "Company Size?!", "answer": "10-50"}
  ]
}

// Output
{
  "whats_your_budget": "$5k",
  "company_size": "10-50"
}
```

**Edge Cases Handled:**
- ✅ Missing questions array → returns `null`
- ✅ Empty questions array → returns `null`
- ✅ Question with no text → skips that question
- ✅ Special characters in questions → removed
- ✅ Very long questions → truncated to 50 chars
- ✅ Duplicate questions → last answer wins
- ✅ Missing answer field → empty string ""

### Reschedule Detector (`detectReschedule`)

**Logic:** Looks for a cancellation with:
1. Same email address
2. Within last 10 minutes
3. Different event UUID (proves it's a reschedule, not just a cancel)
4. Belongs to the same user's endpoints (security)

**Output:**
```typescript
{
  isReschedule: true,
  cancellationId: "uuid-of-canceled-event-log"
}
```

**Edge Cases Handled:**
- ✅ No recent cancellation → `isReschedule: false`
- ✅ Same event UUID → `isReschedule: false` (true cancellation)
- ✅ Cancellation >10 min ago → `isReschedule: false`
- ✅ Missing parameters → `isReschedule: false`
- ✅ Cross-user email collision → `isReschedule: false` (security check)
- ✅ Database errors → `isReschedule: false`

**Security Feature:**
The detector verifies the cancellation belongs to the current user's endpoints to prevent cross-user data leaks if two different Calendly users happen to have customers with the same email.

### UTM Extractor (`extractUTMParameters`)

**Input:** Calendly payload with optional `tracking` object

**Output:** All 5 standard UTM parameters

```typescript
{
  utm_source: "facebook",
  utm_medium: "cpc",
  utm_campaign: "spring_2026",
  utm_term: null,
  utm_content: null
}
```

**Edge Cases Handled:**
- ✅ No tracking object → all `null`
- ✅ Empty string values → converted to `null`
- ✅ Whitespace-only values → converted to `null`
- ✅ Partial UTM data → returns what's available
- ✅ Non-string values → converted to `null`

### Main Enricher (`enrichWebhookPayload`)

**Input:** Raw Calendly webhook + endpoint settings

**Output:** Structured enriched payload

```typescript
{
  original: { /* full Calendly payload */ },
  enriched: {
    parsed_questions: { budget: "$5k" } | null,
    reschedule_info: { isReschedule: true, cancellationId: "..." },
    utm_tracking: { utm_source: "facebook", ... } | null,
    enriched_at: "2026-01-15T10:30:00.000Z"
  },
  metadata: {
    calendly_event_uuid: "abc123-def456",
    invitee_email: "customer@example.com",
    event_type: "invitee.created"
  }
}
```

**Features:**
- ✅ Conditional enrichment (only runs enabled parsers)
- ✅ Parallel execution with `Promise.all`
- ✅ Always preserves original payload
- ✅ Handles parser failures gracefully (returns null for that enrichment)
- ✅ Extracts event UUID from Calendly URI format

## Error Handling Philosophy

All parsers follow these principles:

1. **Never throw errors** - Always return safe defaults
2. **Log failures** - Use `console.error` for debugging
3. **Fail gracefully** - Return `null` or `false` on errors
4. **Preserve data** - Never lose the original webhook payload

## Testing Checklist

- [ ] Test with missing `questions_and_answers` field
- [ ] Test with malformed question objects
- [ ] Test reschedule detection with same email across different users
- [ ] Test reschedule detection with >10 minute gap
- [ ] Test UTM extraction with empty strings
- [ ] Test enricher with all parsers disabled
- [ ] Test enricher with partial Calendly payloads
- [ ] Test with very long question text (>50 chars)
- [ ] Test with special Unicode characters in questions
- [ ] Test concurrent reschedule detections

## Performance Considerations

- **Question Parser:** O(n) where n = number of questions (typically <10)
- **Reschedule Detector:** 2 database queries (optimized with indexes)
- **UTM Extractor:** O(1) constant time
- **Main Enricher:** Parallel execution, total time = slowest parser

## Database Indexes Required

For optimal reschedule detection performance:

```sql
CREATE INDEX idx_logs_reschedule_lookup
ON webhook_logs(invitee_email, event_type, created_at DESC);

CREATE INDEX idx_endpoints_user
ON webhook_endpoints(user_id, id);
```

These indexes are defined in the main schema file.
