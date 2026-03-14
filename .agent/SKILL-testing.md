# SKILL: Testing — Unit, Integration & E2E

## HealthOS Agent Skill File

**Read this before writing any test.**

---

## Testing Stack

| Type              | Tool                             | Location                 |
| ----------------- | -------------------------------- | ------------------------ |
| Unit              | Vitest                           | `tests/unit/`            |
| Component         | React Testing Library + Vitest   | `tests/unit/components/` |
| Integration (RLS) | Supabase local emulator + Vitest | `tests/integration/`     |
| E2E               | Playwright                       | `tests/e2e/`             |

---

## Coverage Thresholds (vitest.config.ts)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
      },
      include: ['lib/**', 'components/**'],
      exclude: ['components/ui/**', '**/*.stories.*'],
    },
  },
});
```

---

## Unit Tests — Utility Functions

```typescript
// tests/unit/utils/health-calculators.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBMI, estimateHbA1c } from '@/lib/utils/health-calculators';

describe('calculateBMI', () => {
  it('returns correct BMI for normal weight', () => {
    expect(calculateBMI({ weightKg: 70, heightCm: 175 })).toBeCloseTo(22.9, 1);
  });

  it('returns null for invalid inputs', () => {
    expect(calculateBMI({ weightKg: 0, heightCm: 175 })).toBeNull();
    expect(calculateBMI({ weightKg: 70, heightCm: 0 })).toBeNull();
  });
});

describe('estimateHbA1c', () => {
  it('estimates HbA1c from average blood glucose', () => {
    // Formula: (avgGlucose + 46.7) / 28.7
    expect(estimateHbA1c(154)).toBeCloseTo(7.0, 1);
  });
});
```

---

## Unit Tests — Zod Schemas

```typescript
// tests/unit/validations/vitals.schema.test.ts
import { describe, it, expect } from 'vitest';
import { vitalSignSchema } from '@/lib/validations/vitals.schema';

describe('vitalSignSchema', () => {
  it('passes for valid blood glucose reading', () => {
    const result = vitalSignSchema.safeParse({
      type: 'blood_glucose',
      value: 145,
      unit: 'mg/dL',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative values', () => {
    const result = vitalSignSchema.safeParse({
      type: 'blood_glucose',
      value: -5,
      unit: 'mg/dL',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('positive');
  });

  it('rejects unknown vital type', () => {
    const result = vitalSignSchema.safeParse({
      type: 'cholesterol',
      value: 200,
      unit: 'mg/dL',
    });
    expect(result.success).toBe(false);
  });
});
```

---

## Integration Tests — RLS Policies

```typescript
// tests/integration/rls/vital_signs.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY_TEST!;

let patientAClient: SupabaseClient;
let patientBClient: SupabaseClient;
let testVitalId: string;

beforeAll(async () => {
  patientAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  patientBClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  await patientAClient.auth.signInWithPassword({
    email: 'patient-a@healthos-test.com',
    password: 'TestPass123!',
  });

  await patientBClient.auth.signInWithPassword({
    email: 'patient-b@healthos-test.com',
    password: 'TestPass123!',
  });
});

afterAll(async () => {
  await patientAClient.auth.signOut();
  await patientBClient.auth.signOut();
});

describe('vital_signs RLS', () => {
  it('Patient A can insert their own vital', async () => {
    const { data, error } = await patientAClient
      .from('vital_signs')
      .insert({ type: 'blood_glucose', value: 145, unit: 'mg/dL', source: 'manual' })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    testVitalId = data!.id;
  });

  it('Patient A can read their own vital', async () => {
    const { data } = await patientAClient
      .from('vital_signs')
      .select()
      .eq('id', testVitalId)
      .single();

    expect(data).not.toBeNull();
  });

  it('Patient B CANNOT read Patient A vital (RLS blocks)', async () => {
    const { data, error } = await patientBClient
      .from('vital_signs')
      .select()
      .eq('id', testVitalId)
      .single();

    // RLS returns empty, not an error
    expect(data).toBeNull();
  });

  it('Unauthenticated client CANNOT read any vitals', async () => {
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await anonClient.from('vital_signs').select().limit(1);
    expect(data).toEqual([]);
  });
});
```

---

## E2E Tests — Playwright

```typescript
// tests/e2e/patient-vital-log.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Patient vital sign logging', () => {
  test.beforeEach(async ({ page }) => {
    // Use Playwright auth state (see playwright.config.ts for setup)
    await page.goto('/dashboard/vitals');
    await expect(page).toHaveURL('/dashboard/vitals');
  });

  test('patient can log a blood glucose reading', async ({ page }) => {
    // Open the log form
    await page.getByRole('button', { name: 'Log Vital' }).click();

    // Fill the form
    await page.getByLabel('Type').selectOption('blood_glucose');
    await page.getByLabel('Value').fill('145');

    // Submit
    await page.getByRole('button', { name: 'Save' }).click();

    // Confirm it appears in the list
    await expect(page.getByText('145 mg/dL')).toBeVisible();

    // Confirm it appears in the trend chart
    await expect(page.getByRole('img', { name: /blood glucose trend/i })).toBeVisible();
  });

  test('shows validation error for invalid value', async ({ page }) => {
    await page.getByRole('button', { name: 'Log Vital' }).click();
    await page.getByLabel('Value').fill('-5');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('alert')).toContainText('positive');
  });
});

// tests/e2e/auth.setup.ts (generates auth state for tests)
import { test as setup } from '@playwright/test';

setup('authenticate as patient', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('patient-test@healthos-test.com');
  await page.getByLabel('Password').fill('TestPass123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');
  await page.context().storageState({ path: 'tests/e2e/.auth/patient.json' });
});
```

---

## GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      supabase:
        image: supabase/postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports: ['5432:5432']

    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Start Supabase local
        run: supabase start

      - name: Run migrations
        run: supabase db reset

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint (zero warnings)
        run: npx next lint --max-warnings 0

      - name: Unit + Integration tests
        run: npx vitest run --coverage

      - name: Build
        run: npm run build

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/login
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true

      - name: E2E tests
        run: npx playwright test
```

---

## Lighthouse Budget

```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "timings": [{ "metric": "interactive", "budget": 4000 }],
    "resourceSizes": [{ "resourceType": "script", "budget": 300 }],
    "scores": [
      { "category": "performance", "minScore": 85 },
      { "category": "accessibility", "minScore": 90 },
      { "category": "best-practices", "minScore": 90 }
    ]
  }
]
```
