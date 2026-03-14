# HealthOS — AI-Powered Chronic Disease Management Platform

HealthOS is a modern healthcare SaaS platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**. It supports patient, provider, and admin experiences with dashboards, vitals tracking, medications, AI coach, and care team workflows.

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form + Zod
- **Data**: Supabase (Postgres + Auth)
- **Charts**: Recharts
- **Testing**: Playwright, Vitest

---

## Getting Started

### 1) Install Dependencies

```bash
npm install
```

### 2) Configure Environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional: Stripe, OpenAI, etc.
```

> Keep **real secrets** out of git. `.env.local` should stay local.

### 3) Run Dev Server

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## Seed Data (Supabase)

Use Supabase SQL editor to run these files in order:

1. `supabase/seed.sql`
2. `supabase/seed_provider_data.sql`
3. `supabase/seed_new_data.sql` (optional)

> Replace UUID placeholders in `seed.sql` with actual auth user IDs if required.

---

## Demo Accounts (Example)

> Use the emails you created in Supabase Auth.

- **Patient**: `test123@gmail.com`
- **Provider**: `robert.johnson@healthos-demo.com`
- **Admin**: `admin@gmail.com`

(Passwords depend on your Supabase Auth setup.)

---

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Run production build
npm run lint      # Lint
npm run test      # Unit tests
```

---

## Project Structure

```
app/                # Next.js App Router pages
components/         # UI components
lib/                # Utilities, helpers
supabase/           # Migrations & seed scripts
tests/              # E2E + unit tests
```

---

## Production Notes

- Admin + Provider pages use **dynamic rendering** due to Supabase auth calls.
- If build fails with prerender errors, ensure those pages are dynamic:
  `export const dynamic = 'force-dynamic';`

---

## Troubleshooting

### Build errors during prerender
If you see errors like:
`Error occurred prerendering page ...`

Ensure the page is **dynamic** and not statically rendered.

### Lockfile patch error
If Next.js complains about lockfile patching:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## License

Private for internal/hackathon use.
