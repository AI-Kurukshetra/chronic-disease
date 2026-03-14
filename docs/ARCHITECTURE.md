# HealthOS — Architecture Document

## System Design, Data Flows & Architecture Decisions

**Version:** 1.0

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  Patient App (Next.js)  │  Provider Portal  │  Admin Dashboard   │
└──────────────┬──────────┴────────┬──────────┴──────────┬────────┘
               │                  │                      │
               ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                          │
│  App Router │ Server Components │ Server Actions │ API Routes    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐
│  Supabase       │  │  Anthropic API  │  │  Third Parties │
│  ─ PostgreSQL   │  │  Claude Sonnet  │  │  ─ Twilio      │
│  ─ Auth + MFA   │  │  (AI Coach)     │  │  ─ Stripe      │
│  ─ Realtime     │  └─────────────────┘  │  ─ Resend      │
│  ─ Storage      │                       │  ─ Epic FHIR   │
│  ─ Edge Fns     │                       │  ─ DrugBank     │
│  ─ pg_cron      │                       └────────────────┘
└─────────────────┘
```

---

## 2. Authentication & RBAC Flow

```
User submits credentials
        │
        ▼
Supabase Auth validates
        │
        ▼
After-sign-in hook fires
  → Reads role from profiles table
  → Sets app_metadata.role in JWT
        │
        ▼
JWT returned to client (httpOnly cookie via SSR)
        │
        ▼
Next.js middleware.ts intercepts every request
  → Verifies JWT with Supabase server client
  → Checks app_metadata.role
  → Redirects if role does not match route group:
      /dashboard/* → PATIENT only
      /provider/*  → PROVIDER only
      /admin/*     → ADMIN only
        │
        ▼
Page renders with server-fetched data (RLS enforced at DB layer)
```

**Three-Layer Security Model:**

1. Middleware — route-level role check (first gate)
2. Server Action/API Route — session + ownership check (second gate)
3. Supabase RLS — database-level enforcement (immovable last gate)

---

## 3. AI Health Coach Data Flow

```
Patient sends message
        │
        ▼
/api/ai/chat/route.ts (Server — no client exposure)
        │
        ├─► Verify Supabase session
        │
        ├─► Fetch patient context from Supabase:
        │     - Last 7 days of vital_signs (aggregated, not raw)
        │     - Active prescriptions list (names + dosage)
        │     - Care plan goals (titles + current status)
        │     - Current risk_level from patients table
        │
        ├─► Strip direct identifiers:
        │     Replace patient name → "the patient"
        │     Remove MRN, DOB, phone from context
        │
        ├─► Build system prompt (lib/ai/prompts.ts)
        │     Inject anonymised context
        │
        ├─► Call Anthropic API (streaming)
        │     Model: claude-sonnet-4-20250514
        │     Safety: check response for crisis keywords
        │
        ├─► Stream response to client via Vercel AI SDK
        │
        └─► Persist both turns to coach_conversations table
              (patient_id, messages JSONB, updated_at)
```

**Safety Guardrails — Trigger on these keywords:**
`suicidal`, `want to die`, `end my life`, `chest pain`, `can't breathe`,
`stroke`, `seizure`, `unconscious`, `severe bleeding`

On trigger:

1. Stop AI stream immediately
2. Return emergency resources card to UI
3. Insert row into `emergency_alerts` with `trigger_type: 'ai_crisis_detection'`
4. Broadcast alert via Supabase Realtime to provider's alert channel

---

## 4. Real-Time Vital Alert Flow

```
Patient logs vital sign (manual or device sync)
        │
        ▼
vital_signs row inserted (RLS: patient can only insert own rows)
        │
        ▼
PostgreSQL TRIGGER fires on INSERT
        │
        ▼
Supabase Edge Function: check-vital-alerts/index.ts
        │
        ├─► Fetch alert_thresholds from care_plans for this patient
        │
        ├─► Compare vital value against thresholds
        │
        ├─► If threshold breached:
        │     UPDATE vital_signs SET alert_triggered = true
        │     INSERT INTO emergency_alerts (severity, message, ...)
        │
        └─► Supabase Realtime broadcasts new emergency_alerts row
              → Provider's useRealtimeAlerts hook receives event
              → Alert notification rendered in Provider Portal
              → Twilio SMS sent as fallback (if provider offline)
```

---

## 5. Medication Reminder Flow (pg_cron)

```
pg_cron job: every 15 minutes
        │
        ▼
Edge Function: send-medication-reminder/index.ts
        │
        ├─► Query prescriptions WHERE:
        │     is_active = true
        │     AND next_reminder_at <= NOW()
        │     AND no pending medication_log for this window
        │
        ├─► For each due reminder:
        │     INSERT medication_logs (status: 'pending', scheduled_at)
        │     INSERT notifications (type: 'medication_reminder')
        │
        └─► Delivery priority:
              1st: In-app push (Supabase Realtime)
              2nd: Web Push notification (if app not open)
              3rd: SMS via Twilio (if web push not registered)
```

---

## 6. Architecture Decision Records (ADRs)

### ADR-001: Why Supabase over custom backend

**Context:** Need HIPAA-compliant database, auth, and realtime.
**Decision:** Supabase with BAA signed for HIPAA compliance.
**Reasons:** Built-in RLS, Realtime, Auth with MFA, Edge Functions, and
pgcron eliminate the need for separate services. Single vendor reduces
attack surface and compliance scope.
**Consequences:** Vendor lock-in for database layer. Mitigated by using
standard PostgreSQL SQL — can migrate to self-hosted Postgres if needed.

### ADR-002: Why Next.js App Router over Pages Router

**Context:** Need RSC for performance, Server Actions for HIPAA-safe mutations.
**Decision:** App Router with React Server Components as the default.
**Reasons:** Server Components reduce client bundle size (no data fetching
code in browser), Server Actions keep mutation logic server-side (PHI
never travels through client-side fetch calls), and nested layouts
improve clinical dashboard UX.
**Consequences:** Learning curve for team. Mitigated by clear RSC-first
rule in CODING_STANDARDS.md.

### ADR-003: RLS as the immovable last gate

**Context:** Application-layer auth checks can be bypassed; PHI requires
defence in depth.
**Decision:** Every table has RLS enabled. No table is ever accessible
without a matching RLS policy. Service role is server-only.
**Reasons:** HIPAA requires minimum necessary access. RLS enforces this
at the database layer regardless of application bugs.
**Consequences:** Performance overhead of policy evaluation on every query.
Mitigated by indexes on `patient_id` columns and `get_user_role()` SECURITY DEFINER.

### ADR-004: Anthropic Claude as AI Coach engine

**Context:** Need a conversational AI that can be safely constrained to
health coaching without clinical overreach.
**Decision:** Use Claude Sonnet with a carefully crafted system prompt,
structured output for recommendations, and explicit safety guardrails.
**Reasons:** Claude's Constitutional AI training makes it more likely to
refuse unsafe medical advice. Streaming support via Vercel AI SDK.
**Consequences:** API cost per conversation. Mitigated by context window
management (7-day rolling window, not full history).
