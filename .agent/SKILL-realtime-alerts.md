# SKILL: Realtime Alerts, pg_cron & Edge Functions

## HealthOS Agent Skill File

**Read this before any realtime, scheduled job, or Edge Function task.**

---

## Supabase Edge Function Template

```typescript
// supabase/functions/<function-name>/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  // 1. Authenticate the request (Edge Functions called from DB triggers use service role)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Create Supabase client with service role
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();
    // ... your logic

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[EdgeFunction]', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
```

---

## pg_cron Setup

```sql
-- supabase/migrations/20260314000020_pg_cron_jobs.sql
-- Requires pg_cron extension (enable in Supabase Dashboard → Extensions)

-- Run medication reminder check every 15 minutes
SELECT cron.schedule(
  'medication-reminders',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.edge_function_url') || '/send-medication-reminder',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Daily health risk re-assessment at 6am UTC
SELECT cron.schedule(
  'daily-risk-assessment',
  '0 6 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.edge_function_url') || '/run-risk-assessment',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
      body := '{}'::jsonb
    );
  $$
);
```

---

## Vital Alert Edge Function

```typescript
// supabase/functions/check-vital-alerts/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { vital_id, patient_id, type, value } = await req.json();

  // Fetch thresholds from care_plans — NEVER hardcode
  const { data: carePlan } = await supabase
    .from('care_plans')
    .select('alert_thresholds')
    .eq('patient_id', patient_id)
    .eq('is_active', true)
    .single();

  if (!carePlan) return new Response('No active care plan', { status: 200 });

  const thresholds = carePlan.alert_thresholds[type];
  if (!thresholds) return new Response('No threshold for type', { status: 200 });

  const isHigh = thresholds.high && value > thresholds.high;
  const isLow = thresholds.low && value < thresholds.low;

  if (!isHigh && !isLow) return new Response('Within range', { status: 200 });

  const severity = determineSeverity(type, value, thresholds);

  // Mark vital as alert-triggered
  await supabase.from('vital_signs').update({ alert_triggered: true }).eq('id', vital_id);

  // Create emergency alert
  await supabase.from('emergency_alerts').insert({
    patient_id,
    vital_sign_id: vital_id,
    severity,
    status: 'open',
    trigger_type: isHigh ? `high_${type}` : `low_${type}`,
    trigger_value: value,
    threshold_value: isHigh ? thresholds.high : thresholds.low,
    message: `${type.replace(/_/g, ' ')} reading of ${value} is ${isHigh ? 'above' : 'below'} threshold`,
  });

  return new Response(JSON.stringify({ alerted: true, severity }), { status: 200 });
});

function determineSeverity(
  type: string,
  value: number,
  thresholds: Record<string, number>,
): string {
  if (type === 'blood_glucose') {
    if (value > 400 || value < 50) return 'critical';
    if (value > 300 || value < 60) return 'urgent';
    return 'warning';
  }
  if (type === 'blood_pressure_systolic') {
    if (value > 180) return 'critical';
    if (value > 160) return 'urgent';
    return 'warning';
  }
  return 'warning';
}
```

---

## Realtime Subscription — Next.js Component

```typescript
// lib/hooks/useRealtimeVitals.ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@/lib/supabase/client';
import { vitalQueryKeys } from './useVitals';

export function useRealtimeVitals(patientId: string) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel(`vitals-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vital_signs',
          filter: `patient_id=eq.${patientId}`,
        },
        () => {
          // Invalidate and refetch — TanStack Query handles the update
          queryClient.invalidateQueries({ queryKey: vitalQueryKeys.all });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, supabase, queryClient]);
}
```
