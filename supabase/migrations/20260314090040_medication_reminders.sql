-- Medication reminder scheduling fields

ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS next_reminder_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_timezone TEXT DEFAULT 'UTC';

CREATE INDEX IF NOT EXISTS idx_prescriptions_next_reminder
  ON prescriptions (next_reminder_at)
  WHERE is_active = TRUE;
