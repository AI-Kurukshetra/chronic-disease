# HealthOS — API Contracts

## Endpoint Specifications with Request/Response Types

**Version:** 1.0

---

> **Agent Rule:** Any new API route must be documented here BEFORE implementation.
> This file is the single source of truth for all custom Next.js API routes.
> Supabase PostgREST auto-generated endpoints are handled via the Supabase client
> and are NOT listed here (use `types/database.types.ts` for those).

---

## Authentication Headers

All custom API routes (`/api/*`) require:

```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

The server verifies the token by calling `supabase.auth.getUser()` on every request.

---

## POST /api/ai/chat

**Purpose:** Stream AI Health Coach responses  
**Auth:** Patient only  
**Rate limit:** 20 requests/minute per user

### Request

```typescript
{
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;           // max 2000 chars
  }>;
  conversationId?: string;     // UUID — omit for new conversation
}
```

### Response (streaming — text/event-stream)

```
data: {"type":"text","text":"Hello, I noticed your blood..."}
data: {"type":"text","text":"glucose has been trending..."}
data: [DONE]
```

### Crisis Response (application/json)

```typescript
// HTTP 200 — but crisis flag set
{
  crisis: true;
  message: string; // Emergency resources message
}
```

---

## POST /api/webhooks/stripe

**Purpose:** Handle Stripe subscription lifecycle events  
**Auth:** Stripe signature verification (no user token)  
**Events handled:**

- `checkout.session.completed` → activate subscription in Supabase
- `customer.subscription.updated` → update plan in Supabase
- `customer.subscription.deleted` → downgrade user in Supabase
- `invoice.payment_failed` → send payment failed email via Resend

### Headers Required

```
stripe-signature: <stripe_webhook_signature>
```

### Response

```typescript
{
  received: true;
} // HTTP 200 — always return 200 to Stripe
```

---

## POST /api/webhooks/twilio

**Purpose:** Receive Twilio SMS delivery status callbacks  
**Auth:** Twilio signature verification

### Request (form-encoded from Twilio)

```
MessageSid=SMxxxx&MessageStatus=delivered&To=+1xxxxxxxxxx
```

### Response

```
HTTP 204 No Content
```

---

## GET /api/health

**Purpose:** Health check for monitoring and uptime services  
**Auth:** None

### Response

```typescript
{
  status: 'ok';
  timestamp: string; // ISO 8601
  version: string; // package.json version
}
```

---

## Supabase RPC Functions (called via supabase.rpc())

These are not HTTP endpoints but are documented here as they form part of the
API contract between frontend and database.

### get_adherence_rate

```typescript
// Input
{ p_patient_id: string; p_days?: number }
// Output
number  // Percentage 0–100
```

### get_patient_dashboard_summary

```typescript
// Input
{
  p_patient_id: string;
}
// Output
{
  latest_glucose: number | null;
  latest_bp_systolic: number | null;
  latest_bp_diastolic: number | null;
  latest_weight: number | null;
  adherence_rate_30d: number;
  open_alerts: number;
  goals_active: number;
  goals_achieved: number;
}
```

### get_provider_panel_summary

```typescript
// Input
{
  p_provider_id: string;
}
// Output
Array<{
  patient_id: string;
  patient_name: string;
  risk_level: string;
  last_active: string;
  open_alerts: number;
  adherence_rate: number;
}>;
```
