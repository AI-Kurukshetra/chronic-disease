-- Core identities, care plans, and goals

CREATE TYPE user_role AS ENUM ('patient', 'provider', 'admin');

CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid() REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mrn               TEXT UNIQUE,
  primary_condition TEXT NOT NULL DEFAULT 'type2_diabetes',
  enrollment_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_level        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (risk_level IN ('low','medium','high','critical')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id)
);

CREATE TABLE providers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  specialty          TEXT NOT NULL,
  license_number     TEXT NOT NULL UNIQUE,
  npi_number         TEXT UNIQUE,
  department         TEXT,
  accepting_patients BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id)
);

CREATE TABLE care_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id      UUID NOT NULL REFERENCES profiles(id),
  title            TEXT NOT NULL,
  description      TEXT,
  start_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date         DATE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  alert_thresholds JSONB NOT NULL DEFAULT '{
    "blood_glucose": {"low": 70, "high": 250},
    "blood_pressure_systolic": {"high": 160},
    "blood_pressure_diastolic": {"high": 100},
    "heart_rate": {"low": 50, "high": 120}
  }'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE goals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_plan_id UUID NOT NULL REFERENCES care_plans(id) ON DELETE CASCADE,
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  metric       TEXT,
  target_value NUMERIC,
  target_unit  TEXT,
  deadline     DATE,
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active','achieved','paused','cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_provider_for_patient(p_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM care_plans
    WHERE patient_id = p_patient_id
      AND provider_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_care_plans_updated_at
  BEFORE UPDATE ON care_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id AND get_user_role() IN ('patient','provider','admin'));

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id AND get_user_role() IN ('patient','provider','admin'));

CREATE POLICY "profiles_provider_panel_select"
  ON profiles FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(id) AND auth.uid() IS NOT NULL);

CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "patients_select_own"
  ON patients FOR SELECT
  USING (profile_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "patients_update_own"
  ON patients FOR UPDATE
  USING (profile_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "patients_provider_panel_select"
  ON patients FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(profile_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "patients_admin_all"
  ON patients FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "providers_owner_all"
  ON providers FOR ALL
  USING (profile_id = auth.uid() AND get_user_role() = 'provider');

CREATE POLICY "providers_patient_select_assigned"
  ON providers FOR SELECT
  USING (
    get_user_role() = 'patient'
    AND EXISTS (
      SELECT 1 FROM care_plans cp
      WHERE cp.provider_id = providers.profile_id
        AND cp.patient_id = auth.uid()
    )
  );

CREATE POLICY "providers_admin_all"
  ON providers FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "care_plans_patient_select"
  ON care_plans FOR SELECT
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "care_plans_provider_all"
  ON care_plans FOR ALL
  USING (provider_id = auth.uid() AND get_user_role() = 'provider');

CREATE POLICY "care_plans_admin_all"
  ON care_plans FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "goals_patient_all"
  ON goals FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "goals_provider_all"
  ON goals FOR ALL
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "goals_admin_all"
  ON goals FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_patients_profile_id ON patients(profile_id);
CREATE INDEX idx_patients_risk_level ON patients(risk_level);
CREATE INDEX idx_providers_profile_id ON providers(profile_id);
CREATE INDEX idx_care_plans_patient_active ON care_plans(patient_id, is_active);
CREATE INDEX idx_care_plans_provider ON care_plans(provider_id);
CREATE INDEX idx_goals_care_plan ON goals(care_plan_id);
CREATE INDEX idx_goals_patient_status ON goals(patient_id, status);
