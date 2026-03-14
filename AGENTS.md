# HealthOS — Agent Instruction Manual

## AI-Powered Chronic Disease Management Platform

**Version:** 1.0 | **Status:** Active | **Last Updated:** March 2026

---

> **READ THIS FILE FIRST — ALWAYS.**
> Every AI agent, coding assistant, or developer working on this project
> must read and follow this file before writing a single line of code.
> It is the single source of truth for architecture, standards, and workflow.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Agent Behaviour Contract](#2-agent-behaviour-contract)
3. [Tech Stack — Authoritative Reference](#3-tech-stack--authoritative-reference)
4. [Repository Layout](#4-repository-layout)
5. [Development Workflow — The 7-Step Rule](#5-development-workflow--the-7-step-rule)
6. [Coding Standards — Non-Negotiable](#6-coding-standards--non-negotiable)
7. [Security & HIPAA Rules](#7-security--hipaa-rules)
8. [File Naming Conventions](#8-file-naming-conventions)
9. [Git & PR Standards](#9-git--pr-standards)
10. [Environment Variables](#10-environment-variables)
11. [Skill Files Index](#11-skill-files-index)
12. [Linked Reference Documents](#12-linked-reference-documents)

---

## 1. Project Overview

**HealthOS** is a HIPAA-compliant, AI-powered chronic disease management
platform. It combines behavioural psychology, predictive AI, medication
management, and real-time health monitoring into a single platform for
patients, care teams, and payers.

| Attribute     | Value                                      |
| ------------- | ------------------------------------------ |
| Domain        | Healthcare / Chronic Disease & Remote Care |
| MVP Condition | Type 2 Diabetes (T2D)                      |
| Primary Users | Patients · Providers · Admins              |
| Compliance    | HIPAA · HITECH · WCAG 2.1 AA               |
| BRD Reference | `docs/BRD.md`                              |
| Architecture  | `docs/ARCHITECTURE.md`                     |

---

## 2. Agent Behaviour Contract

When operating as an AI agent on this codebase, you MUST:

```
✅ Read the relevant SKILL file before starting any task
✅ Follow the 7-Step Development Workflow (Section 5) — always in order
✅ Check CODING_STANDARDS.md before writing any code
✅ Validate output against DEFINITION_OF_DONE.md before marking done
✅ Never skip the database-first step — schema before UI, always
✅ Never expose service role keys, PHI, or secrets in any output
✅ Ask for clarification before making architecture-level decisions
✅ Reference the BRD (docs/BRD.md) for all feature scope questions
```

You MUST NOT:

```
❌ Use `any` in TypeScript — use `unknown` and narrow
❌ Fetch data inside useEffect — use Server Components or TanStack Query
❌ Write UI before the Zod schema and Server Action exist
❌ Hardcode vital thresholds — they live in the database
❌ Store PHI in localStorage, URL params, or console logs
❌ Use raw <img> or <a> tags — always next/image and next/link
❌ Create new components > 200 lines without extracting sub-components
❌ Ignore RLS — every table must have Row Level Security enabled
```

---

## 3. Tech Stack — Authoritative Reference

> Do not suggest alternatives unless explicitly asked. This stack is final.

### Frontend

| Tool            | Version  | Purpose                             |
| --------------- | -------- | ----------------------------------- |
| Next.js         | 14+      | App Router, RSC, Server Actions     |
| React           | 18+      | UI library                          |
| TypeScript      | 5+       | Strict mode — `"strict": true`      |
| Tailwind CSS    | 3+       | Utility-first styling               |
| shadcn/ui       | latest   | Base component library              |
| React Hook Form | 7+       | Form state management               |
| Zod             | 3+       | Schema validation (client + server) |
| TanStack Query  | 5+       | Server state, caching, mutations    |
| Zustand         | 4+       | Client-side global state            |
| Recharts        | 2+       | Health analytics charts             |
| Vercel AI SDK   | 3+       | AI streaming (useChat)              |
| nuqs            | 1+       | URL search param state sync         |
| next/dynamic    | built-in | Lazy loading heavy components       |

### Backend / Database

| Tool                    | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| Supabase Auth           | Authentication + MFA + JWT custom claims     |
| Supabase PostgreSQL     | Primary relational database                  |
| Supabase Realtime       | Live vitals, alerts, chat                    |
| Supabase Storage        | Documents, images                            |
| Supabase Edge Functions | Serverless business logic (Deno)             |
| Supabase RLS            | Row Level Security — mandatory on ALL tables |
| Supabase pg_cron        | Scheduled jobs (medication reminders)        |

### AI / Integrations

| Tool                                  | Purpose                                      |
| ------------------------------------- | -------------------------------------------- |
| Anthropic Claude API                  | AI Health Coach (`claude-sonnet-4-20250514`) |
| Twilio Video + SMS                    | Telehealth + medication reminders            |
| Stripe                                | Subscription billing                         |
| Resend                                | Transactional email                          |
| Epic FHIR R4                          | EHR interoperability                         |
| Apple HealthKit / Google Fit / Fitbit | Wearable sync                                |
| DrugBank API                          | Drug interaction checking                    |

### DevOps

| Tool           | Purpose                       |
| -------------- | ----------------------------- |
| Vercel         | Hosting + preview deployments |
| GitHub Actions | CI/CD pipeline                |
| Docker         | Local dev environment         |
| Terraform      | Infrastructure as Code        |

---

## 4. Repository Layout

```
healthos/
├── AGENTS.md                     ← YOU ARE HERE
├── .agent/                       ← Agent skill files (read before tasks)
│   ├── SKILL-database.md
│   ├── SKILL-auth.md
│   ├── SKILL-ai-coach.md
│   ├── SKILL-vitals.md
│   ├── SKILL-medications.md
│   ├── SKILL-telehealth.md
│   ├── SKILL-billing.md
│   ├── SKILL-testing.md
│   └── SKILL-realtime-alerts.md
├── docs/
│   ├── BRD.md                    ← Business Requirements Document
│   ├── ARCHITECTURE.md           ← System architecture decisions
│   ├── CODING_STANDARDS.md       ← Full coding rules
│   ├── DATABASE_SCHEMA.md        ← Entity definitions + RLS spec
│   ├── API_CONTRACTS.md          ← Endpoint specs
│   ├── DEFINITION_OF_DONE.md     ← Checklist before marking complete
│   └── ADR/                      ← Architecture Decision Records
│       ├── ADR-001-supabase.md
│       ├── ADR-002-app-router.md
│       └── ADR-003-rls-strategy.md
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── onboarding/
│   │       ├── page.tsx
│   │       └── steps/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── vitals/page.tsx
│   │   ├── medications/page.tsx
│   │   ├── nutrition/page.tsx
│   │   ├── coach/page.tsx
│   │   ├── telehealth/page.tsx
│   │   └── progress/page.tsx
│   ├── (provider)/
│   │   ├── layout.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── alerts/page.tsx
│   ├── (admin)/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts
│   │   │   └── twilio/route.ts
│   │   └── ai/
│   │       └── chat/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       ← shadcn/ui (DO NOT edit)
│   ├── shared/
│   ├── vitals/
│   ├── medications/
│   ├── coach/
│   ├── telehealth/
│   ├── charts/
│   └── forms/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── coach.ts
│   │   └── prompts.ts
│   ├── validations/
│   ├── hooks/
│   ├── utils/
│   └── constants/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
├── types/
│   ├── database.types.ts         ← Auto-generated (never edit manually)
│   ├── api.types.ts
│   └── global.d.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── preview.yml
├── middleware.ts
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Development Workflow — The 7-Step Rule

**Every feature must follow these steps in order. No exceptions.**

```
STEP 1 → DATABASE
  Write SQL migration → table, indexes, RLS policies, triggers
  File: supabase/migrations/YYYYMMDDHHMMSS_<feature>.sql

STEP 2 → TYPES
  Run: npx supabase gen types typescript --local > types/database.types.ts
  Never manually define database entity types

STEP 3 → VALIDATION SCHEMA
  Write Zod schema in lib/validations/<domain>.schema.ts
  This schema is shared by both client form and Server Action

STEP 4 → SERVER ACTION / API ROUTE
  Implement mutation logic with full error handling
  Use lib/supabase/server.ts — never the browser client
  Validate all inputs with the Zod schema from Step 3

STEP 5 → CUSTOM HOOK (client-side reads)
  Wrap TanStack Query in a custom hook in lib/hooks/
  Export query keys as constants for cache invalidation

STEP 6 → UI COMPONENTS
  Build bottom-up: atom → molecule → organism → page
  Handle loading / error / empty states at every level

STEP 7 → TESTS
  Unit: lib/utils and lib/validations
  Integration: RLS policies with Supabase local emulator
  E2E: Playwright for critical user journeys
```

---

## 6. Coding Standards — Non-Negotiable

Full detail in `docs/CODING_STANDARDS.md`. Summary:

- **TypeScript strict mode ON** — zero `any`, all types explicit
- **RSC by default** — "use client" only at leaf components needing browser APIs
- **Server Actions for mutations** — no client-side fetch for writes
- **React Hook Form + Zod** — all forms, no exceptions
- **TanStack Query** — all client-side server state
- **Max 200 lines per component** — extract aggressively
- **WCAG 2.1 AA** — all interactive elements keyboard-navigable with ARIA labels
- **ESLint zero warnings** in CI — build fails on any warning
- **Conventional Commits** — `feat|fix|docs|refactor|test|chore(scope): desc`

---

## 7. Security & HIPAA Rules

- `SUPABASE_SERVICE_ROLE_KEY` — server only, NEVER in client bundle
- PHI must not appear in: console.log, error messages, URLs, localStorage
- RLS enabled on EVERY table — `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- Session verified server-side in every API route before processing
- Sensitive fields (SSN, insurance numbers) encrypted at app layer via Web Crypto
- AI Coach: strip direct identifiers before sending context to Claude API
- Audit log every PHI access/modification event (user_id hashed, action, timestamp)

---

## 8. File Naming Conventions

| Type          | Convention                           | Example                             |
| ------------- | ------------------------------------ | ----------------------------------- |
| Page          | `page.tsx`                           | `app/dashboard/page.tsx`            |
| Layout        | `layout.tsx`                         | `app/(dashboard)/layout.tsx`        |
| Component     | `PascalCase.tsx`                     | `VitalSignCard.tsx`                 |
| Hook          | `camelCase` + `use` prefix           | `useVitals.ts`                      |
| Schema        | `<domain>.schema.ts`                 | `vitals.schema.ts`                  |
| Migration     | `YYYYMMDDHHMMSS_description.sql`     | `20260314_create_vitals.sql`        |
| Edge Function | `kebab-case/index.ts`                | `send-medication-reminder/index.ts` |
| Test          | `<file>.test.ts` or `<file>.spec.ts` | `vitals.schema.test.ts`             |
| ADR           | `ADR-NNN-title.md`                   | `ADR-001-supabase.md`               |
| Constants     | `<domain>.constants.ts`              | `health.constants.ts`               |

---

## 9. Git & PR Standards

```
Branch naming:
  feat/<ticket>-short-description
  fix/<ticket>-short-description
  chore/<ticket>-short-description

Commit format (Conventional Commits):
  feat(vitals): add CGM real-time sync via Supabase Realtime
  fix(auth): resolve MFA token expiry edge case
  chore(db): add index on vital_signs patient_id + recorded_at

PR requirements before merge:
  ✅ tsc --noEmit passes (zero TypeScript errors)
  ✅ next lint passes (zero ESLint warnings)
  ✅ All tests pass (unit + integration)
  ✅ Lighthouse CI: Performance ≥ 85, Accessibility ≥ 90
  ✅ DEFINITION_OF_DONE.md checklist completed
  ✅ At least one reviewer approved
```

---

## 10. Environment Variables

See `.env.example` for the full documented list.
Key categories: Supabase · Anthropic · Twilio · Stripe · Resend · App

Rule: Variables prefixed `NEXT_PUBLIC_` are bundled into the client.
**Never prefix secrets with `NEXT_PUBLIC_`.**

---

## 11. Skill Files Index

Before starting any task, read the relevant skill file from `.agent/`:

| Task Area                          | Skill File                        |
| ---------------------------------- | --------------------------------- |
| Database migrations, RLS, triggers | `.agent/SKILL-database.md`        |
| Authentication, RBAC, middleware   | `.agent/SKILL-auth.md`            |
| AI Health Coach, prompts, safety   | `.agent/SKILL-ai-coach.md`        |
| Vital signs, IoT sync, alerts      | `.agent/SKILL-vitals.md`          |
| Medications, adherence, reminders  | `.agent/SKILL-medications.md`     |
| Telehealth, video, messaging       | `.agent/SKILL-telehealth.md`      |
| Stripe billing, subscriptions      | `.agent/SKILL-billing.md`         |
| Testing, RLS tests, Playwright E2E | `.agent/SKILL-testing.md`         |
| Realtime alerts, pg_cron, Edge Fn  | `.agent/SKILL-realtime-alerts.md` |

---

## 12. Linked Reference Documents

| Document                     | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `docs/BRD.md`                | All functional & non-functional requirements   |
| `docs/ARCHITECTURE.md`       | System design, ADR log, data flow diagrams     |
| `docs/CODING_STANDARDS.md`   | Complete coding rules with code examples       |
| `docs/DATABASE_SCHEMA.md`    | All table definitions, RLS specs, indexes      |
| `docs/API_CONTRACTS.md`      | All endpoint specs with request/response types |
| `docs/DEFINITION_OF_DONE.md` | Checklist that every feature must pass         |
| `docs/ADR/`                  | Architecture decision records                  |
