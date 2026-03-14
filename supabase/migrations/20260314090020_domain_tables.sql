-- Clinical domain tables

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

CREATE TYPE alert_severity AS ENUM ('warning', 'urgent', 'critical');
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved');

CREATE TYPE medication_log_status AS ENUM ('taken', 'missed', 'skipped', 'pending');

CREATE TYPE appointment_type AS ENUM ('telehealth', 'in_person');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

CREATE TYPE notification_channel AS ENUM ('in_app', 'push', 'sms', 'email');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'cancelled');

CREATE TYPE assessment_type AS ENUM ('phq9', 'gad7', 'risk');

CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

CREATE TYPE device_status AS ENUM ('connected', 'revoked', 'error', 'pending');

CREATE TABLE medical_conditions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_conditions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  condition_id  UUID NOT NULL REFERENCES medical_conditions(id) ON DELETE CASCADE,
  diagnosed_at  DATE,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'resolved', 'remission')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, condition_id)
);

CREATE TABLE medications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  generic_name   TEXT,
  drug_class     TEXT,
  typical_dosage TEXT,
  rxcui          TEXT UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prescriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id     UUID NOT NULL REFERENCES medications(id),
  prescriber_id     UUID NOT NULL REFERENCES profiles(id),
  dosage            TEXT NOT NULL,
  frequency         TEXT NOT NULL,
  instructions      TEXT,
  start_date        DATE NOT NULL,
  end_date          DATE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  refills_remaining INT NOT NULL DEFAULT 0,
  pharmacy_id       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE medication_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          medication_log_status NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  taken_at        TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE device_integrations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_type            TEXT NOT NULL,
  vendor                 TEXT NOT NULL,
  status                 device_status NOT NULL DEFAULT 'pending',
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at       TIMESTAMPTZ,
  last_sync_at           TIMESTAMPTZ,
  metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vital_signs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            vital_type NOT NULL,
  value           NUMERIC(10, 2) NOT NULL,
  unit            TEXT NOT NULL,
  source          vital_source NOT NULL DEFAULT 'manual',
  device_id       UUID REFERENCES device_integrations(id),
  alert_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE symptoms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symptom     TEXT NOT NULL,
  severity    INT NOT NULL CHECK (severity BETWEEN 1 AND 10),
  notes       TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE food_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  description TEXT NOT NULL,
  calories    NUMERIC(8,2),
  protein_g   NUMERIC(8,2),
  carbs_g     NUMERIC(8,2),
  fat_g       NUMERIC(8,2),
  logged_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exercise_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type    TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  calories         NUMERIC(8,2),
  source           TEXT,
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id      UUID NOT NULL REFERENCES profiles(id),
  appointment_type appointment_type NOT NULL,
  status           appointment_status NOT NULL DEFAULT 'scheduled',
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  location         TEXT,
  meeting_url      TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject      TEXT,
  content      TEXT NOT NULL,
  status       message_status NOT NULL DEFAULT 'sent',
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  channel      notification_channel NOT NULL,
  status       notification_status NOT NULL DEFAULT 'queued',
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assessments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         assessment_type NOT NULL,
  score        INT,
  responses    JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coach_conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages   JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insurance_plans (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_name          TEXT NOT NULL,
  plan_name              TEXT,
  member_id_encrypted    TEXT,
  group_number_encrypted TEXT,
  policy_number_encrypted TEXT,
  coverage_start_date    DATE,
  coverage_end_date      DATE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE emergency_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vital_sign_id    UUID REFERENCES vital_signs(id),
  severity         alert_severity NOT NULL,
  status           alert_status NOT NULL DEFAULT 'open',
  trigger_type     TEXT NOT NULL,
  trigger_value    NUMERIC,
  threshold_value  NUMERIC,
  message          TEXT NOT NULL,
  acknowledged_by  UUID REFERENCES profiles(id),
  acknowledged_at  TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_medical_conditions_updated_at
  BEFORE UPDATE ON medical_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_patient_conditions_updated_at
  BEFORE UPDATE ON patient_conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_medication_logs_updated_at
  BEFORE UPDATE ON medication_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_device_integrations_updated_at
  BEFORE UPDATE ON device_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vital_signs_updated_at
  BEFORE UPDATE ON vital_signs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_symptoms_updated_at
  BEFORE UPDATE ON symptoms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_food_logs_updated_at
  BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_exercise_logs_updated_at
  BEFORE UPDATE ON exercise_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_coach_conversations_updated_at
  BEFORE UPDATE ON coach_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_insurance_plans_updated_at
  BEFORE UPDATE ON insurance_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_emergency_alerts_updated_at
  BEFORE UPDATE ON emergency_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medical_conditions_select_authenticated"
  ON medical_conditions FOR SELECT
  USING (get_user_role() IN ('patient','provider','admin') AND auth.uid() IS NOT NULL);

CREATE POLICY "medical_conditions_admin_all"
  ON medical_conditions FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "patient_conditions_patient_all"
  ON patient_conditions FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "patient_conditions_provider_select"
  ON patient_conditions FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "patient_conditions_admin_all"
  ON patient_conditions FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "medications_select_authenticated"
  ON medications FOR SELECT
  USING (get_user_role() IN ('patient','provider','admin') AND auth.uid() IS NOT NULL);

CREATE POLICY "medications_admin_all"
  ON medications FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "prescriptions_patient_select"
  ON prescriptions FOR SELECT
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "prescriptions_provider_all"
  ON prescriptions FOR ALL
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "prescriptions_admin_all"
  ON prescriptions FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "medication_logs_patient_all"
  ON medication_logs FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "medication_logs_provider_select"
  ON medication_logs FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "medication_logs_admin_all"
  ON medication_logs FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "device_integrations_patient_all"
  ON device_integrations FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "device_integrations_provider_select"
  ON device_integrations FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "device_integrations_admin_all"
  ON device_integrations FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "vital_signs_patient_insert"
  ON vital_signs FOR INSERT
  WITH CHECK (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "vital_signs_patient_select"
  ON vital_signs FOR SELECT
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "vital_signs_provider_select"
  ON vital_signs FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "vital_signs_admin_select"
  ON vital_signs FOR SELECT
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "symptoms_patient_all"
  ON symptoms FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "symptoms_provider_select"
  ON symptoms FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "symptoms_admin_all"
  ON symptoms FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "food_logs_patient_all"
  ON food_logs FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "food_logs_provider_select"
  ON food_logs FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "food_logs_admin_all"
  ON food_logs FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "exercise_logs_patient_all"
  ON exercise_logs FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "exercise_logs_provider_select"
  ON exercise_logs FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "exercise_logs_admin_all"
  ON exercise_logs FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "appointments_patient_all"
  ON appointments FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "appointments_provider_all"
  ON appointments FOR ALL
  USING (provider_id = auth.uid() AND get_user_role() = 'provider');

CREATE POLICY "appointments_admin_all"
  ON appointments FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "messages_participants_select"
  ON messages FOR SELECT
  USING (
    (auth.uid() = sender_id OR auth.uid() = recipient_id)
    AND get_user_role() IN ('patient','provider','admin')
  );

CREATE POLICY "messages_sender_insert"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND get_user_role() IN ('patient','provider','admin')
  );

CREATE POLICY "messages_participants_update"
  ON messages FOR UPDATE
  USING (
    (auth.uid() = sender_id OR auth.uid() = recipient_id)
    AND get_user_role() IN ('patient','provider','admin')
  );

CREATE POLICY "messages_admin_all"
  ON messages FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "notifications_recipient_all"
  ON notifications FOR ALL
  USING (recipient_id = auth.uid() AND get_user_role() IN ('patient','provider','admin') AND auth.uid() IS NOT NULL);

CREATE POLICY "notifications_admin_all"
  ON notifications FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "assessments_patient_all"
  ON assessments FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "assessments_provider_select"
  ON assessments FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "assessments_admin_all"
  ON assessments FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "coach_conversations_patient_all"
  ON coach_conversations FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "coach_conversations_admin_all"
  ON coach_conversations FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "insurance_plans_patient_all"
  ON insurance_plans FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "insurance_plans_provider_select"
  ON insurance_plans FOR SELECT
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "insurance_plans_admin_all"
  ON insurance_plans FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE POLICY "emergency_alerts_patient_select"
  ON emergency_alerts FOR SELECT
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "emergency_alerts_provider_all"
  ON emergency_alerts FOR ALL
  USING (get_user_role() = 'provider' AND is_provider_for_patient(patient_id) AND auth.uid() IS NOT NULL);

CREATE POLICY "emergency_alerts_admin_all"
  ON emergency_alerts FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE INDEX idx_patient_conditions_patient_id ON patient_conditions(patient_id);
CREATE INDEX idx_patient_conditions_condition_id ON patient_conditions(condition_id);
CREATE INDEX idx_medications_name ON medications(name);
CREATE INDEX idx_prescriptions_patient_active ON prescriptions(patient_id, is_active);
CREATE INDEX idx_prescriptions_medication_id ON prescriptions(medication_id);
CREATE INDEX idx_prescriptions_prescriber_id ON prescriptions(prescriber_id);
CREATE INDEX idx_medication_logs_prescription_date
  ON medication_logs (prescription_id, scheduled_at DESC);
CREATE INDEX idx_medication_logs_patient_status
  ON medication_logs (patient_id, status, scheduled_at DESC);
CREATE INDEX idx_device_integrations_patient
  ON device_integrations (patient_id, status);
CREATE INDEX idx_vital_signs_patient_recorded
  ON vital_signs (patient_id, recorded_at DESC);
CREATE INDEX idx_vital_signs_patient_type_recorded
  ON vital_signs (patient_id, type, recorded_at DESC);
CREATE INDEX idx_vital_signs_alert
  ON vital_signs (patient_id, alert_triggered)
  WHERE alert_triggered = TRUE;
CREATE INDEX idx_symptoms_patient_recorded
  ON symptoms (patient_id, recorded_at DESC);
CREATE INDEX idx_food_logs_patient_logged
  ON food_logs (patient_id, logged_at DESC);
CREATE INDEX idx_exercise_logs_patient_logged
  ON exercise_logs (patient_id, logged_at DESC);
CREATE INDEX idx_appointments_patient
  ON appointments (patient_id, scheduled_at DESC);
CREATE INDEX idx_appointments_provider
  ON appointments (provider_id, scheduled_at DESC);
CREATE INDEX idx_messages_participants
  ON messages (sender_id, recipient_id, sent_at DESC);
CREATE INDEX idx_notifications_recipient_status
  ON notifications (recipient_id, status, created_at DESC);
CREATE INDEX idx_assessments_patient
  ON assessments (patient_id, completed_at DESC);
CREATE INDEX idx_coach_conversations_patient
  ON coach_conversations (patient_id, updated_at DESC);
CREATE INDEX idx_insurance_plans_patient
  ON insurance_plans (patient_id);
CREATE INDEX idx_emergency_alerts_patient_status
  ON emergency_alerts (patient_id, status, created_at DESC);
CREATE INDEX idx_emergency_alerts_open
  ON emergency_alerts (status, severity, created_at DESC)
  WHERE status = 'open';

CREATE OR REPLACE FUNCTION notify_vital_alert()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT := current_setting('app.edge_function_url', true);
  service_key TEXT := current_setting('app.service_role_key', true);
BEGIN
  IF edge_url IS NULL OR service_key IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := edge_url || '/check-vital-alerts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_vital_alert_check
  AFTER INSERT ON vital_signs
  FOR EACH ROW EXECUTE FUNCTION notify_vital_alert();

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE vital_signs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE emergency_alerts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE medication_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
