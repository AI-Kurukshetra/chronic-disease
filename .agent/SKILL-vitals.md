# SKILL: Vital Signs, IoT Sync & Alerts

## HealthOS Agent Skill File

**Read this before any vitals, device sync, or alert threshold task.**

---

## Key Rules

- Alert thresholds are ALWAYS read from `care_plans.alert_thresholds` — never hardcoded
- `vital_signs` rows are IMMUTABLE — no UPDATE or DELETE policies
- Real-time updates use Supabase Realtime `postgres_changes` subscription
- Device sync writes use the service role (Edge Function) — never the browser client

---

## Zod Schema

```typescript
// lib/validations/vitals.schema.ts
import { z } from 'zod';

export const VITAL_TYPES = [
  'blood_glucose',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'heart_rate',
  'weight',
  'bmi',
  'temperature',
  'oxygen_saturation',
  'steps',
  'active_minutes',
] as const;

export const VITAL_UNITS: Record<(typeof VITAL_TYPES)[number], string> = {
  blood_glucose: 'mg/dL',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
  heart_rate: 'bpm',
  weight: 'kg',
  bmi: 'kg/m²',
  temperature: '°C',
  oxygen_saturation: '%',
  steps: 'steps',
  active_minutes: 'min',
};

export const vitalSignSchema = z.object({
  type: z.enum(VITAL_TYPES),
  value: z
    .number({ required_error: 'Value is required' })
    .positive('Value must be positive')
    .max(9999, 'Value is too high — please check'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().max(500).optional(),
  recorded_at: z.string().datetime().optional(), // defaults to NOW() in DB
});

export type VitalSignInput = z.infer<typeof vitalSignSchema>;
```

---

## Server Action

```typescript
// lib/actions/vitals.actions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { vitalSignSchema } from '@/lib/validations/vitals.schema';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';

export async function logVitalSign(
  input: z.infer<typeof vitalSignSchema>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = vitalSignSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid vital data' };

  const { error } = await supabase.from('vital_signs').insert({
    patient_id: user.id,
    type: parsed.data.type,
    value: parsed.data.value,
    unit: parsed.data.unit,
    notes: parsed.data.notes,
    source: 'manual',
  });

  if (error) {
    console.error('[logVitalSign]', { userId: user.id, error: error.code });
    return { success: false, error: 'Failed to save. Please try again.' };
  }

  revalidatePath('/dashboard/vitals');
  revalidatePath('/dashboard');
  return { success: true };
}
```

---

## Custom Hook — Client-Side Vitals

```typescript
// lib/hooks/useVitals.ts
import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';

export const vitalQueryKeys = {
  all: ['vitals'] as const,
  list: (patientId: string) => ['vitals', 'list', patientId] as const,
  trend: (patientId: string, type: string, days: number) =>
    ['vitals', 'trend', patientId, type, days] as const,
};

export function useVitalTrend(patientId: string, type: string, days = 30) {
  const supabase = createBrowserClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: vitalQueryKeys.trend(patientId, type, days),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('id, value, unit, recorded_at, alert_triggered')
        .eq('patient_id', patientId)
        .eq('type', type)
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
```

---

## Realtime Alerts Hook (Provider Portal)

```typescript
// lib/hooks/useRealtimeAlerts.ts
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type EmergencyAlert = Database['public']['Tables']['emergency_alerts']['Row'];

export function useRealtimeAlerts(providerId: string) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const supabase = createBrowserClient();

  useEffect(() => {
    // Subscribe to new open alerts for this provider's panel
    const channel = supabase
      .channel(`provider-alerts-${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_alerts',
          filter: `status=eq.open`,
        },
        (payload) => {
          setAlerts((prev) => [payload.new as EmergencyAlert, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId, supabase]);

  return alerts;
}
```

---

## Vital Trend Chart Component

```typescript
// components/charts/VitalTrendChart.tsx
'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface VitalTrendChartProps {
  data: Array<{ recorded_at: string; value: number; alert_triggered: boolean }>;
  alertThreshold?: { low?: number; high?: number };
  unit: string;
  label: string;
}

export function VitalTrendChart({ data, alertThreshold, unit, label }: VitalTrendChartProps) {
  const chartData = data.map(d => ({
    date: format(new Date(d.recorded_at), 'MMM d'),
    value: d.value,
    alert: d.alert_triggered,
  }));

  return (
    // Accessibility: role + aria-label + sr-only table
    <div role="img" aria-label={`${label} trend chart showing ${data.length} readings`}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit={` ${unit}`} />
          <Tooltip formatter={(v) => [`${v} ${unit}`, label]} />
          {alertThreshold?.high && (
            <ReferenceLine y={alertThreshold.high} stroke="#ef4444" strokeDasharray="4 4"
              label={{ value: 'High threshold', fill: '#ef4444', fontSize: 12 }} />
          )}
          {alertThreshold?.low && (
            <ReferenceLine y={alertThreshold.low} stroke="#f97316" strokeDasharray="4 4"
              label={{ value: 'Low threshold', fill: '#f97316', fontSize: 12 }} />
          )}
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>

      {/* Screen reader table fallback */}
      <table className="sr-only">
        <caption>{label} readings</caption>
        <thead><tr><th>Date</th><th>Value</th><th>Alert</th></tr></thead>
        <tbody>
          {chartData.map((d, i) => (
            <tr key={i}>
              <td>{d.date}</td>
              <td>{d.value} {unit}</td>
              <td>{d.alert ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
