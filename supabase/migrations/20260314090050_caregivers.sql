-- Family & Caregiver Access

CREATE TYPE caregiver_status AS ENUM ('pending', 'active', 'revoked');
CREATE TYPE caregiver_relationship AS ENUM ('spouse', 'parent', 'child', 'sibling', 'friend', 'other');

CREATE TABLE caregivers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_email  TEXT NOT NULL,
  caregiver_name   TEXT NOT NULL,
  relationship     caregiver_relationship NOT NULL DEFAULT 'other',
  status           caregiver_status NOT NULL DEFAULT 'pending',
  permissions      JSONB NOT NULL DEFAULT '{"view_vitals": true, "view_medications": true, "view_progress": true}'::jsonb,
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at      TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, caregiver_email)
);

CREATE TRIGGER trg_caregivers_updated_at
  BEFORE UPDATE ON caregivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caregivers_patient_all"
  ON caregivers FOR ALL
  USING (patient_id = auth.uid() AND get_user_role() = 'patient');

CREATE POLICY "caregivers_admin_all"
  ON caregivers FOR ALL
  USING (get_user_role() = 'admin' AND auth.uid() IS NOT NULL);

CREATE INDEX idx_caregivers_patient_id ON caregivers(patient_id, status);
CREATE INDEX idx_caregivers_email ON caregivers(caregiver_email);
