# HealthOS — Coding Standards

## Complete Rules with Code Examples

**Version:** 1.0 | Referenced by: `AGENTS.md`

---

## CS-1: TypeScript

### CS-1.1 Strict Mode

```json
// tsconfig.json — mandatory settings
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### CS-1.2 No `any` — Use `unknown` and narrow

```typescript
// ❌ WRONG
function processResponse(data: any) {
  return data.value;
}

// ✅ CORRECT
function processResponse(data: unknown): number {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid response shape');
  }
  if (!('value' in data) || typeof (data as Record<string, unknown>).value !== 'number') {
    throw new Error('Missing or invalid value field');
  }
  return (data as { value: number }).value;
}
```

### CS-1.3 Interface vs Type

```typescript
// Use interface for extensible object shapes
interface VitalSign {
  id: string;
  patientId: string;
  type: VitalType;
  value: number;
  unit: string;
  recordedAt: string;
}

// Use type for unions, intersections, mapped types
type VitalType =
  | 'blood_glucose'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'weight'
  | 'heart_rate';

type VitalWithAlert = VitalSign & { alertTriggered: boolean };

type VitalFormData = Pick<VitalSign, 'type' | 'value' | 'unit'>;
```

### CS-1.4 Database Types — Never Redefine

```typescript
// ❌ WRONG — manually redefining database types
interface Patient {
  id: string;
  created_at: string;
  // ... copy-pasting from schema
}

// ✅ CORRECT — use generated types as source of truth
import type { Database } from '@/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];
```

### CS-1.5 Constants over Enums

```typescript
// ❌ WRONG — TypeScript enum
enum UserRole {
  PATIENT = 'patient',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

// ✅ CORRECT — const object with satisfies
const USER_ROLES = {
  PATIENT: 'patient',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
```

---

## CS-2: React & Next.js

### CS-2.1 Server Components First

```typescript
// ✅ CORRECT — Server Component fetches data, no "use client"
// app/(dashboard)/vitals/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { VitalsDashboard } from '@/components/vitals/VitalsDashboard';

export default async function VitalsPage() {
  const supabase = await createServerClient();
  const { data: vitals, error } = await supabase
    .from('vital_signs')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(50);

  if (error) throw error; // Caught by error.tsx

  return <VitalsDashboard initialVitals={vitals} />;
}
```

```typescript
// ✅ CORRECT — "use client" only at the leaf that needs interactivity
// components/vitals/VitalLogButton.tsx
'use client';

import { useState } from 'react';
import { logVital } from '@/app/actions/vitals.actions';

interface VitalLogButtonProps {
  patientId: string;
  onSuccess: () => void;
}

export function VitalLogButton({ patientId, onSuccess }: VitalLogButtonProps) {
  const [isPending, setIsPending] = useState(false);
  // ...
}
```

### CS-2.2 Server Actions for All Mutations

```typescript
// ✅ CORRECT — lib/actions/vitals.actions.ts
'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { vitalSignSchema } from '@/lib/validations/vitals.schema';
import { revalidatePath } from 'next/cache';

export async function logVitalSign(
  formData: z.infer<typeof vitalSignSchema>,
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate session
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 2. Validate input
  const parsed = vitalSignSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  // 3. Persist (RLS enforces patient can only insert their own)
  const { error } = await supabase.from('vital_signs').insert({
    patient_id: user.id,
    type: parsed.data.type,
    value: parsed.data.value,
    unit: parsed.data.unit,
    recorded_at: new Date().toISOString(),
  });

  if (error) {
    // Never expose raw DB errors to the client
    console.error('[logVitalSign] DB error:', { userId: user.id, error: error.message });
    return { success: false, error: 'Failed to save vital sign. Please try again.' };
  }

  revalidatePath('/dashboard/vitals');
  return { success: true };
}
```

### CS-2.3 Loading & Error States — Mandatory

```typescript
// Every async route MUST have these sibling files:
// app/(dashboard)/vitals/loading.tsx
export default function VitalsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

// app/(dashboard)/vitals/error.tsx
'use client';
export default function VitalsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="text-center p-8">
      <p className="text-destructive">Something went wrong loading your vitals.</p>
      <button onClick={reset} className="mt-4 btn-primary">Try again</button>
    </div>
  );
}
```

### CS-2.4 Component Size Limit

```typescript
// ❌ WRONG — 300-line monolith component
export function VitalsDashboard() {
  // 300 lines of JSX, logic, and state mixed together
}

// ✅ CORRECT — decomposed
// components/vitals/VitalsDashboard.tsx (orchestrator, < 80 lines)
export function VitalsDashboard({ initialVitals }: VitalsDashboardProps) {
  return (
    <div className="space-y-6">
      <VitalsHeader />
      <VitalsSummaryCards vitals={initialVitals} />
      <VitalsTrendChart vitals={initialVitals} />
      <VitalsLogForm />
      <VitalsHistoryTable vitals={initialVitals} />
    </div>
  );
}
```

---

## CS-3: Forms & Validation

### CS-3.1 React Hook Form + Zod — Always Together

```typescript
// lib/validations/vitals.schema.ts
import { z } from 'zod';

export const vitalSignSchema = z.object({
  type: z.enum([
    'blood_glucose',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'weight',
    'heart_rate',
  ]),
  value: z
    .number({ required_error: 'Value is required' })
    .positive('Value must be positive')
    .max(1000, 'Value seems too high — please check'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
});

export type VitalSignFormData = z.infer<typeof vitalSignSchema>;
```

```typescript
// components/forms/VitalSignForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vitalSignSchema, type VitalSignFormData } from '@/lib/validations/vitals.schema';
import { logVitalSign } from '@/lib/actions/vitals.actions';

export function VitalSignForm() {
  const form = useForm<VitalSignFormData>({
    resolver: zodResolver(vitalSignSchema),
    defaultValues: { type: 'blood_glucose', unit: 'mg/dL' },
  });

  async function onSubmit(data: VitalSignFormData) {
    const result = await logVitalSign(data);
    if (!result.success) {
      form.setError('root', { message: result.error });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {/* Every field: label + input + error message linked via aria-describedby */}
      <div>
        <label htmlFor="vital-value">Blood Glucose (mg/dL)</label>
        <input
          id="vital-value"
          type="number"
          aria-describedby={form.formState.errors.value ? 'vital-value-error' : undefined}
          aria-invalid={!!form.formState.errors.value}
          {...form.register('value', { valueAsNumber: true })}
        />
        {form.formState.errors.value && (
          <p id="vital-value-error" role="alert" className="text-destructive text-sm">
            {form.formState.errors.value.message}
          </p>
        )}
      </div>
      {form.formState.errors.root && (
        <p role="alert" className="text-destructive">{form.formState.errors.root.message}</p>
      )}
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Log Vital'}
      </button>
    </form>
  );
}
```

---

## CS-4: Data Fetching

### CS-4.1 TanStack Query — Client-Side Reads

```typescript
// lib/hooks/useVitals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';

// Export query keys as constants — used for cache invalidation
export const vitalQueryKeys = {
  all: ['vitals'] as const,
  list: (patientId: string) => ['vitals', 'list', patientId] as const,
  trend: (patientId: string, days: number) => ['vitals', 'trend', patientId, days] as const,
};

export function useVitals(patientId: string) {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: vitalQueryKeys.list(patientId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
```

### CS-4.2 Optimistic Updates

```typescript
export function useLogVital() {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  return useMutation({
    mutationFn: async (vital: VitalSignFormData) => {
      const { data, error } = await supabase.from('vital_signs').insert(vital).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (newVital) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: vitalQueryKeys.all });
      // Optimistic update — instant UI feedback
      queryClient.setQueryData(vitalQueryKeys.list(newVital.patient_id), (old: VitalSign[]) => [
        { ...newVital, id: 'optimistic-id', recorded_at: new Date().toISOString() },
        ...(old ?? []),
      ]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: vitalQueryKeys.all });
    },
  });
}
```

---

## CS-5: Error Handling

### CS-5.1 Centralised Error Types

```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'A database error occurred') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

// Safe error handler — never leaks internals to client
export function toSafeError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code };
  }
  // Log the real error server-side, return generic message
  console.error('[UnhandledError]', error);
  return { message: 'An unexpected error occurred.', code: 'INTERNAL_ERROR' };
}
```

---

## CS-6: Accessibility (WCAG 2.1 AA)

```typescript
// ✅ Every interactive element must have:
// 1. Visible focus indicator (via Tailwind focus-visible:ring)
// 2. Descriptive aria-label when icon-only
// 3. role="alert" for dynamic error messages
// 4. aria-live="polite" for status updates

// ✅ All charts must have accessible fallback
<div role="img" aria-label="Blood glucose trend: 7-day average 142 mg/dL, trending down">
  <BloodGlucoseChart data={vitals} />
  <table className="sr-only"> {/* Screen reader table fallback */}
    <caption>Blood glucose readings over 7 days</caption>
    <tbody>
      {vitals.map(v => (
        <tr key={v.id}>
          <td>{new Date(v.recorded_at).toLocaleDateString()}</td>
          <td>{v.value} {v.unit}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## CS-7: Performance

```typescript
// ✅ Lazy-load heavy components
const TwilioVideoCall = dynamic(
  () => import('@/components/telehealth/TwilioVideoCall'),
  {
    loading: () => <VideoCallSkeleton />,
    ssr: false, // video SDK is browser-only
  }
);

// ✅ Database indexes — add in every migration that introduces a foreign key
-- In your migration file:
CREATE INDEX idx_vital_signs_patient_recorded
  ON vital_signs (patient_id, recorded_at DESC);

CREATE INDEX idx_medication_logs_prescription_date
  ON medication_logs (prescription_id, taken_at DESC);
```
