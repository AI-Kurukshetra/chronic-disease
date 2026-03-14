# HealthOS — Definition of Done

## Every Feature Must Pass This Checklist Before Merge

**Version:** 1.0 | Used by: All developers and AI agents

---

> Copy this checklist into every Pull Request description.
> A PR cannot be merged unless every applicable item is checked.

---

## ✅ 1. Code Quality

- [ ] `tsc --noEmit` passes with zero TypeScript errors
- [ ] `next lint` passes with zero ESLint warnings
- [ ] `prettier --check .` passes — no formatting violations
- [ ] No usage of `any` type — use `unknown` and type-narrow
- [ ] No `console.log` left in production code paths
- [ ] No commented-out code blocks
- [ ] No hardcoded strings that belong in constants files
- [ ] Components are < 200 lines — sub-components extracted where needed
- [ ] All functions have explicit parameter and return types

---

## ✅ 2. Database & Security

- [ ] SQL migration file created in `supabase/migrations/` with correct timestamp
- [ ] All new tables have `updated_at` trigger applied
- [ ] `ALTER TABLE x ENABLE ROW LEVEL SECURITY` present for every new table
- [ ] RLS policies cover: patient (own data), provider (panel patients), admin
- [ ] Indexes added for all foreign keys
- [ ] Indexes added for all columns used in WHERE / ORDER BY clauses
- [ ] `SUPABASE_SERVICE_ROLE_KEY` used only in server-side code
- [ ] No PHI present in any `console.log`, error message, URL param, or localStorage
- [ ] Sensitive fields encrypted before storage where required

---

## ✅ 3. Forms & Validation

- [ ] Zod schema written in `lib/validations/<domain>.schema.ts`
- [ ] Same schema used for both client (React Hook Form) and server (Server Action)
- [ ] Inline field-level error messages present for every form field
- [ ] Error messages linked via `aria-describedby`
- [ ] Server Action validates input before any database operation
- [ ] Server-side session check at the top of every Server Action

---

## ✅ 4. UI & UX

- [ ] Loading state implemented (`loading.tsx` or skeleton component)
- [ ] Error state implemented (`error.tsx` or inline error UI)
- [ ] Empty state implemented (meaningful message, not a blank screen)
- [ ] Mobile responsive — tested at 375px, 768px, 1280px
- [ ] `next/image` used for all images (no raw `<img>` tags)
- [ ] `next/link` used for all internal navigation (no raw `<a>` tags)
- [ ] `generateMetadata()` exported from every new `page.tsx`

---

## ✅ 5. Accessibility (WCAG 2.1 AA)

- [ ] All interactive elements keyboard-navigable
- [ ] Focus indicators visible on all interactive elements
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Icon-only buttons have `aria-label`
- [ ] Dynamic error/status messages use `role="alert"` or `aria-live`
- [ ] Charts have `aria-label` and screen-reader fallback table
- [ ] Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Lighthouse Accessibility score ≥ 90

---

## ✅ 6. Performance

- [ ] Lighthouse Performance score ≥ 85 (run against production build)
- [ ] Heavy components (video, charts) lazy-loaded with `next/dynamic`
- [ ] Database queries use `.select('specific,columns')` — never `select('*')` on large tables
- [ ] Pagination implemented for list views with potential > 20 rows
- [ ] No N+1 queries — use joins or batch fetches

---

## ✅ 7. Testing

- [ ] Unit tests written for all new utility functions in `lib/utils/`
- [ ] Unit tests written for all new Zod schemas in `lib/validations/`
- [ ] RLS integration test added for every new table (patient / provider / unauth)
- [ ] E2E test updated if feature touches a critical user journey
- [ ] All existing tests still pass (`vitest run` + `playwright test`)
- [ ] Test coverage for new code meets minimum thresholds:
  - Utils: ≥ 80%
  - Components: ≥ 70%

---

## ✅ 8. Documentation

- [ ] Complex functions have JSDoc comments explaining purpose and params
- [ ] New environment variables added to `.env.example` with descriptions
- [ ] API contracts updated in `docs/API_CONTRACTS.md` if endpoints added/changed
- [ ] Database schema updated in `docs/DATABASE_SCHEMA.md` if tables changed
- [ ] Architecture Decision Record (ADR) created for any significant architectural choice

---

## ✅ 9. Git & PR

- [ ] Branch name follows convention: `feat|fix|chore/<ticket>-description`
- [ ] All commits follow Conventional Commits format
- [ ] PR description includes: what changed, why, screenshots (for UI changes)
- [ ] No merge conflicts
- [ ] At least one reviewer has approved

---

## Feature-Specific Addons

### AI Coach Feature

- [ ] PHI stripped/pseudonymised before sending to Claude API
- [ ] Safety guardrail tested: crisis keyword triggers emergency card + care team alert
- [ ] Conversation persisted to `coach_conversations` table

### Vital Signs Feature

- [ ] Alert threshold read from `care_plans.alert_thresholds` — not hardcoded
- [ ] Realtime subscription tested in both patient and provider views
- [ ] Emergency alert created and broadcast when threshold breached

### Medication Feature

- [ ] `medication_logs` entry created with `status: 'pending'` on reminder send
- [ ] Adherence rate recalculated after log update
- [ ] Drug interaction check called before prescription confirmation

### Billing Feature

- [ ] Stripe webhook handler is idempotent (handles duplicate events safely)
- [ ] Payment errors handled gracefully with user-friendly messages
- [ ] Subscription status synced to Supabase on webhook receipt
