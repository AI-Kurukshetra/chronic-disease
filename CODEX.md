# Codex Instructions — HealthOS

## FIRST ACTION — ALWAYS

Read `AGENTS.md` before doing anything else.
It contains all project rules, tech stack, and workflow.

## HOW TO START EVERY TASK

1. Read `AGENTS.md`
2. Read the relevant `.agent/SKILL-*.md` for your task
3. Read `docs/CODING_STANDARDS.md`
4. Follow the 7-Step Workflow
5. Check `docs/DEFINITION_OF_DONE.md` when done

## CURRENT PROJECT: HealthOS

HIPAA-compliant AI-powered chronic disease management platform.
MVP condition: Type 2 Diabetes.
Stack: Next.js 14 + TypeScript + Supabase + Tailwind + shadcn/ui

```

---

## Step 3 — Your Folder Should Now Look Like This
```

CHRONIC_DISEASE/
├── .agent/
│ ├── SKILL-ai-coach.md
│ ├── SKILL-auth.md
│ ├── SKILL-billing.md
│ ├── SKILL-database.md
│ ├── SKILL-medications.md
│ ├── SKILL-realtime-alerts.md
│ ├── SKILL-telehealth.md
│ ├── SKILL-testing.md
│ └── SKILL-vitals.md
├── docs/
│ ├── API_CONTRACTS.md
│ ├── ARCHITECTURE.md
│ ├── CODING_STANDARDS.md
│ ├── DATABASE_SCHEMA.md
│ └── DEFINITION_OF_DONE.md
├── AGENTS.md ← NEW ✅
└── CODEX.md ← NEW ✅

```

---

## Step 4 — First Prompt to Give Codex

Now open Codex and paste this as your very first message:
```

Read AGENTS.md and CODEX.md in the project root first.

Then read:

- docs/CODING_STANDARDS.md
- docs/DATABASE_SCHEMA.md
- docs/ARCHITECTURE.md

Once you have read all files, set up the Next.js project by:

1. Creating package.json with all dependencies from the tech stack
2. Creating tsconfig.json with strict TypeScript settings
3. Creating lib/supabase/client.ts
4. Creating lib/supabase/server.ts
5. Creating middleware.ts for auth route protection
6. Creating app/layout.tsx with TanStack Query provider
7. Creating app/globals.css with Tailwind base styles

Follow every rule in AGENTS.md. Do not skip any steps.
