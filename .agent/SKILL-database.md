# SKILL: Database — Migrations, RLS & Triggers

## HealthOS Agent Skill File

**Read this before any database task.**

---

## What This Skill Covers

- Writing Supabase PostgreSQL migrations
- Implementing Row Level Security (RLS) policies
- Creating PostgreSQL triggers and functions
- Defining indexes for performance
- Generating TypeScript types from schema

---

## Step-by-Step: Create a New Table

### Step 1 — Create the migration file

```
File naming: supabase/migrations/YYYYMMDDHHMMSS_describe_change.sql
Example:     supabase/migrations/20260314120000_create_food_logs.sql
```

### Step 2 — Table template (copy and adapt)

```sql
CREATE TABLE food_logs (
  -- ALWAYS include these three columns
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ownership — for RLS
  patient_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Business columns
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  description TEXT NOT NULL,
  calories    NUMERIC(8,2),
  protein_g   NUMERIC(8,2),
  carbs_g     NUMERIC(8,2),
  fat_g       NUMERIC(8,2),
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Step 3 — ALWAYS add the updated_at trigger

```sql
CREATE TRIGGER trg_food_logs_updated_at
  BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Note: update_updated_at_column() is defined in migration 001 setup
```

### Step 4 — ALWAYS enable RLS

```sql
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
```

### Step 5 — Write RLS policies (use this pattern)

```sql
-- Patient: full access to own rows
CREATE POLICY "patients_own_food_logs"
  ON food_logs
  FOR ALL
  USING (patient_id = auth.uid());

-- Provider: read-only access to their panel patients
CREATE POLICY "providers_read_panel_food_logs"
  ON food_logs
  FOR SELECT
  USING (
    get_user_role() = 'provider'
    AND is_provider_for_patient(patient_id)
  );

-- Admin: full access (service role only — never expose to client)
CREATE POLICY "admins_full_food_logs"
  ON food_logs
  FOR ALL
  USING (get_user_role() = 'admin');
```

### Step 6 — Add indexes

```sql
-- Always index the patient_id FK
CREATE INDEX idx_food_logs_patient_id ON food_logs(patient_id);

-- Index time-series queries
CREATE INDEX idx_food_logs_patient_logged
  ON food_logs (patient_id, logged_at DESC);

-- Partial index for frequent filters
CREATE INDEX idx_food_logs_meal_type
  ON food_logs (patient_id, meal_type)
  WHERE meal_type IN ('breakfast', 'lunch', 'dinner');
```

### Step 7 — Generate TypeScript types

```bash
npx supabase gen types typescript --local > types/database.types.ts
```

---

## RLS Policy Patterns

### Pattern A: Owner-only (most common)

```sql
-- Patient can only see/modify their own rows
CREATE POLICY "owner_only"
  ON table_name FOR ALL
  USING (patient_id = auth.uid());
```

### Pattern B: Owner write, provider read

```sql
CREATE POLICY "patient_write"
  ON table_name FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "provider_read"
  ON table_name FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id));
```

### Pattern C: Mutual access (messages)

```sql
-- Both sender and recipient can read
CREATE POLICY "participants_read"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Only sender can insert
CREATE POLICY "sender_insert"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());
```

### Pattern D: Immutable records (vitals, logs)

```sql
-- Allow insert and select, but NOT update or delete
CREATE POLICY "insert_own_vitals"
  ON vital_signs FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "read_own_vitals"
  ON vital_signs FOR SELECT
  USING (patient_id = auth.uid());

-- NO UPDATE or DELETE policy — records are immutable
```

---

## PostgreSQL Functions for Realtime Triggers

```sql
-- Trigger Edge Function on vital_signs insert
CREATE OR REPLACE FUNCTION notify_vital_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function asynchronously via pg_net
  PERFORM net.http_post(
    url := current_setting('app.edge_function_url') || '/check-vital-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := jsonb_build_object(
      'vital_id', NEW.id,
      'patient_id', NEW.patient_id,
      'type', NEW.type,
      'value', NEW.value
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vital_alert_check
  AFTER INSERT ON vital_signs
  FOR EACH ROW EXECUTE FUNCTION notify_vital_alert();
```

---

## Common Mistakes to Avoid

```
❌ Creating a table without enabling RLS → Security breach
❌ Forgetting updated_at trigger → Stale timestamps in UI
❌ No index on patient_id FK → Full table scans at scale
❌ Using select('*') on large tables → Fetch only needed columns
❌ Writing RLS policies with OR conditions broadly → Use separate policies
❌ Exposing service_role_key in client code → Critical security violation
```

---

## Testing RLS Policies

```typescript
// tests/integration/rls/food_logs.test.ts
import { createClient } from '@supabase/supabase-js';

const patientA = createClient(URL, ANON_KEY);
const patientB = createClient(URL, ANON_KEY);

// Sign in as Patient A
await patientA.auth.signInWithPassword({ email: 'patient-a@test.com', password: 'test' });

// Insert a food log as Patient A
const { data: log } = await patientA.from('food_logs').insert({...}).select().single();

// Patient A should see their own log
const { data: ownLog } = await patientA.from('food_logs').select().eq('id', log.id).single();
expect(ownLog).not.toBeNull(); // ✅

// Patient B should NOT see Patient A's log
await patientB.auth.signInWithPassword({ email: 'patient-b@test.com', password: 'test' });
const { data: otherLog } = await patientB.from('food_logs').select().eq('id', log.id).single();
expect(otherLog).toBeNull(); // ✅ RLS blocks access
```
