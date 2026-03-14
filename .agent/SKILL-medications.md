# SKILL: Medications, Adherence & Reminders

## HealthOS Agent Skill File

**Read this before any medication, prescription, or reminder task.**

---

## Key Rules

- Drug interaction checks via DrugBank API before confirming any prescription
- Medication logs are INSERT-only for `taken`/`missed`; `pending` created by reminder system
- Adherence rate computed server-side via Supabase RPC — never in JS
- Reminder schedule driven by pg_cron Edge Function — never client-side timers

---

## Adherence Rate — Supabase RPC

```sql
-- supabase/migrations/20260314000010_adherence_rpc.sql
CREATE OR REPLACE FUNCTION get_adherence_rate(
  p_patient_id UUID,
  p_days INT DEFAULT 30
)
RETURNS NUMERIC AS $$
  SELECT
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE status = 'taken') /
      NULLIF(COUNT(*) FILTER (WHERE status IN ('taken', 'missed')), 0),
      1
    )
  FROM medication_logs
  WHERE patient_id = p_patient_id
    AND scheduled_at >= NOW() - (p_days || ' days')::INTERVAL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

```typescript
// Usage in Server Component:
const { data: adherenceRate } = await supabase.rpc('get_adherence_rate', {
  p_patient_id: userId,
  p_days: 30,
});
```

---

## Medication Reminder Edge Function

```typescript
// supabase/functions/send-medication-reminder/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Find prescriptions due for a reminder in the next 15-minute window
  const { data: duePrescriptions } = await supabase
    .from('prescriptions')
    .select(
      `
      id, patient_id, dosage, frequency,
      medications(name),
      profiles!patient_id(phone)
    `,
    )
    .eq('is_active', true)
    .lte('next_reminder_at', new Date().toISOString());

  for (const rx of duePrescriptions ?? []) {
    // 1. Create pending log entry
    await supabase.from('medication_logs').insert({
      prescription_id: rx.id,
      patient_id: rx.patient_id,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
    });

    // 2. Create in-app notification
    await supabase.from('notifications').insert({
      patient_id: rx.patient_id,
      type: 'medication_reminder',
      title: `Time for ${rx.medications.name}`,
      body: `${rx.dosage} — ${rx.frequency}`,
      delivered: false,
    });

    // 3. SMS fallback via Twilio
    if (rx.profiles?.phone) {
      await sendTwilioSMS(
        rx.profiles.phone,
        `HealthOS Reminder: Time to take ${rx.medications.name} (${rx.dosage}). Log it in the app.`,
      );
    }
  }

  return new Response('OK', { status: 200 });
});
```

---

## Log Medication Action

```typescript
// lib/actions/medications.actions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const logMedicationSchema = z.object({
  prescriptionId: z.string().uuid(),
  status: z.enum(['taken', 'skipped']),
  notes: z.string().max(200).optional(),
});

export async function logMedication(
  input: z.infer<typeof logMedicationSchema>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = logMedicationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: 'Invalid input' };

  // Update the pending log to taken/skipped
  const { error } = await supabase
    .from('medication_logs')
    .update({
      status: parsed.data.status,
      taken_at: parsed.data.status === 'taken' ? new Date().toISOString() : null,
      notes: parsed.data.notes,
    })
    .eq('prescription_id', parsed.data.prescriptionId)
    .eq('patient_id', user.id)
    .eq('status', 'pending')
    .order('scheduled_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('[logMedication]', { userId: user.id, error: error.code });
    return { success: false, error: 'Failed to log medication. Please try again.' };
  }

  revalidatePath('/dashboard/medications');
  return { success: true };
}
```

---

## Drug Interaction Check

```typescript
// lib/ai/drug-interactions.ts
interface DrugInteractionResult {
  hasInteraction: boolean;
  severity?: 'minor' | 'moderate' | 'major';
  description?: string;
}

export async function checkDrugInteraction(
  rxcui1: string,
  rxcui2: string,
): Promise<DrugInteractionResult> {
  // DrugBank API — server-side only, API key never exposed to client
  const res = await fetch(
    `https://api.drugbank.com/v1/drug_interactions?drugbank_id=${rxcui1}&drugbank_id_2=${rxcui2}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DRUGBANK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour — interactions don't change frequently
    },
  );

  if (!res.ok) {
    console.error('[checkDrugInteraction] API error', res.status);
    return { hasInteraction: false }; // Fail open — don't block prescription
  }

  const data = await res.json();
  return {
    hasInteraction: data.interactions?.length > 0,
    severity: data.interactions?.[0]?.severity,
    description: data.interactions?.[0]?.description,
  };
}
```
