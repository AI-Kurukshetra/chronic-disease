# HealthOS — Database Schema

## Entity Definitions, RLS Policies & Index Specifications

**Version:** 1.0 | Stack: Supabase PostgreSQL

---

> **Agent Rule:** Every table created must be accompanied by:
>
> 1. An `updated_at` trigger
> 2. RLS enabled + at least one policy
> 3. Indexes on all FKs and filtered columns
> 4. A corresponding entry in `types/database.types.ts` (via `supabase gen`)

---

## Helper Functions (Run First — One-Time Setup)

```sql
-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if requesting user is a provider for a given patient
CREATE OR REPLACE FUNCTION is_provider_for_patient(p_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM care_plans
    WHERE patient_id = p_patient_id
      AND provider_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

---

## Migration 001 — Profiles & Roles

```sql
-- supabase/migrations/20260314000001_profiles.sql

CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin');

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'patient',
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  date_of_birth DATE,
  phone         TEXT,
  avatar_url    TEXT,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Providers can view patient profiles in their panel"
  ON profiles FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(id));

CREATE POLICY "Admins have full access"
  ON profiles FOR ALL
  USING (get_user_role() = 'admin');

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
```

---

## Migration 002 — Patients & Providers

```sql
-- supabase/migrations/20260314000002_patients_providers.sql

CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mrn               TEXT UNIQUE,                        -- Medical Record Number
  primary_condition TEXT NOT NULL DEFAULT 'type2_diabetes',
  enrollment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_level        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (risk_level IN ('low','medium','high','critical')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own record"
  ON patients FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Providers can view their panel patients"
  ON patients FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(profile_id));

CREATE POLICY "Admins have full access"
  ON patients FOR ALL USING (get_user_role() = 'admin');

CREATE INDEX idx_patients_profile_id ON patients(profile_id);
CREATE INDEX idx_patients_risk_level ON patients(risk_level);

-- ─────────────────────────────────────────────────────────
CREATE TABLE providers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialty       TEXT NOT NULL,
  license_number  TEXT NOT NULL UNIQUE,
  npi_number      TEXT UNIQUE,                          -- National Provider Identifier
  department      TEXT,
  accepting_patients BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_providers_updated_at
  BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view and update their own record"
  ON providers FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Patients can view their assigned providers"
  ON providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM care_plans cp
      JOIN patients pt ON pt.id = cp.patient_id
      WHERE cp.provider_id = providers.profile_id
        AND pt.profile_id = auth.uid()
    )
  );

CREATE INDEX idx_providers_profile_id ON providers(profile_id);
```

---

## Migration 003 — Vital Signs

```sql
-- supabase/migrations/20260314000003_vital_signs.sql

CREATE TYPE vital_type AS ENUM (
  'blood_glucose',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'heart_rate',
  'weight',
  'bmi',
  'temperature',
  'oxygen_saturation',
  'steps',
  'active_minutes'
);

CREATE TYPE vital_source AS ENUM ('manual', 'device', 'ehr_import');

CREATE TABLE vital_signs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            vital_type NOT NULL,
  value           NUMERIC(10, 2) NOT NULL,
  unit            TEXT NOT NULL,
  source          vital_source NOT NULL DEFAULT 'manual',
  device_id       UUID,                                  -- FK to device_integrations
  alert_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — vital records are immutable once created
);

ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can insert and view their own vitals"
  ON vital_signs FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Providers can view their panel patient vitals"
  ON vital_signs FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id));

-- Critical indexes for time-series queries
CREATE INDEX idx_vital_signs_patient_recorded
  ON vital_signs (patient_id, recorded_at DESC);

CREATE INDEX idx_vital_signs_patient_type_recorded
  ON vital_signs (patient_id, type, recorded_at DESC);

CREATE INDEX idx_vital_signs_alert
  ON vital_signs (patient_id, alert_triggered)
  WHERE alert_triggered = TRUE;
```

---

## Migration 004 — Medications & Adherence

```sql
-- supabase/migrations/20260314000004_medications.sql

CREATE TABLE medications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  generic_name  TEXT,
  drug_class    TEXT,
  rxcui         TEXT UNIQUE,                            -- RxNorm concept ID
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- Lookup table — no RLS needed, read-only reference data
);

CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES medications(id),
  prescriber_id   UUID NOT NULL REFERENCES profiles(id),
  dosage          TEXT NOT NULL,
  frequency       TEXT NOT NULL,                        -- e.g. "twice daily", "every 8 hours"
  instructions    TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  refills_remaining INT NOT NULL DEFAULT 0,
  pharmacy_id     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own prescriptions"
  ON prescriptions FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Providers can manage prescriptions for their patients"
  ON prescriptions FOR ALL
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id));

CREATE TABLE medication_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped', 'pending')),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  taken_at        TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage their own medication logs"
  ON medication_logs FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Providers can view medication logs for their patients"
  ON medication_logs FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id));

CREATE INDEX idx_prescriptions_patient_active
  ON prescriptions (patient_id, is_active);

CREATE INDEX idx_medication_logs_prescription_date
  ON medication_logs (prescription_id, scheduled_at DESC);

CREATE INDEX idx_medication_logs_patient_status
  ON medication_logs (patient_id, status, scheduled_at DESC);
```

---

## Migration 005 — Care Plans & Goals

```sql
-- supabase/migrations/20260314000005_care_plans.sql

CREATE TABLE care_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  description     TEXT,
  start_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date        DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  -- Vital alert thresholds (stored per patient, not hardcoded)
  alert_thresholds JSONB NOT NULL DEFAULT '{
    "blood_glucose": {"low": 70, "high": 250},
    "blood_pressure_systolic": {"high": 160},
    "blood_pressure_diastolic": {"high": 100},
    "heart_rate": {"low": 50, "high": 120}
  }'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_care_plans_updated_at
  BEFORE UPDATE ON care_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own care plans"
  ON care_plans FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Providers can manage care plans for their patients"
  ON care_plans FOR ALL USING (provider_id = auth.uid());

CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id    UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  metric          TEXT,                                 -- e.g. "hba1c", "weight", "steps"
  target_value    NUMERIC,
  target_unit     TEXT,
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','achieved','paused','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view and update their own goals"
  ON goals FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "Providers can manage goals for their patients"
  ON goals FOR ALL USING (is_provider_for_patient(patient_id));

CREATE INDEX idx_care_plans_patient_active ON care_plans(patient_id, is_active);
CREATE INDEX idx_goals_care_plan ON goals(care_plan_id);
CREATE INDEX idx_goals_patient_status ON goals(patient_id, status);
```

---

## Migration 006 — Emergency Alerts

```sql
-- supabase/migrations/20260314000006_emergency_alerts.sql

CREATE TYPE alert_severity AS ENUM ('warning', 'urgent', 'critical');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved');

CREATE TABLE emergency_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vital_sign_id   UUID REFERENCES vital_signs(id),
  severity        alert_severity NOT NULL,
  status          alert_status NOT NULL DEFAULT 'open',
  trigger_type    TEXT NOT NULL,                        -- e.g. "high_blood_glucose"
  trigger_value   NUMERIC,
  threshold_value NUMERIC,
  message         TEXT NOT NULL,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_emergency_alerts_updated_at
  BEFORE UPDATE ON emergency_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own alerts"
  ON emergency_alerts FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Providers can view and update alerts for their patients"
  ON emergency_alerts FOR ALL
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id));

CREATE INDEX idx_emergency_alerts_patient_status
  ON emergency_alerts (patient_id, status, created_at DESC);

CREATE INDEX idx_emergency_alerts_open
  ON emergency_alerts (status, severity, created_at DESC)
  WHERE status = 'open';
```

---

## Migration 007 — AI Coach Conversations

```sql
-- supabase/migrations/20260314000007_coach_conversations.sql

CREATE TABLE coach_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Stores: [{role: "user"|"assistant", content: "...", timestamp: "..."}]
  metadata    JSONB DEFAULT '{}'::jsonb,
  -- Stores: {session_context: {...vitals_summary, medications, goals}}
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_coach_conversations_updated_at
  BEFORE UPDATE ON coach_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;

-- Patients can ONLY access their own conversations — no provider access
CREATE POLICY "Patients can manage their own conversations"
  ON coach_conversations FOR ALL USING (patient_id = auth.uid());

CREATE INDEX idx_coach_conversations_patient
  ON coach_conversations (patient_id, updated_at DESC);
```

---

## RLS Policy Matrix (Full Reference)

| Table               | Patient    | Provider                | Admin | Notes                                   |
| ------------------- | ---------- | ----------------------- | ----- | --------------------------------------- |
| profiles            | Own row    | Panel patients          | All   | Via is_provider_for_patient()           |
| patients            | Own row    | Panel patients          | All   |                                         |
| vital_signs         | Own rows   | Panel patients (SELECT) | All   | Immutable once inserted                 |
| prescriptions       | SELECT own | All for panel           | All   |                                         |
| medication_logs     | All own    | SELECT panel            | All   |                                         |
| care_plans          | SELECT own | All for their patients  | All   | Thresholds stored here                  |
| goals               | All own    | All for panel           | All   |                                         |
| emergency_alerts    | SELECT own | All for panel           | All   |                                         |
| coach_conversations | All own    | None                    | All   | Privacy — providers cannot read AI chat |
| messages            | Own rows   | Own rows                | All   | Patient ↔ provider only                 |
| appointments        | Own rows   | Own rows                | All   |                                         |
| food_logs           | All own    | SELECT panel            | All   |                                         |
| exercise_logs       | All own    | SELECT panel            | All   |                                         |

---

## Supabase Realtime Configuration

Enable Realtime on these tables (broadcast changes to subscribed clients):

```sql
-- Run in Supabase dashboard or migration
ALTER PUBLICATION supabase_realtime ADD TABLE vital_signs;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE medication_logs;
```
