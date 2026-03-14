-- RPC functions for dashboards and analytics

CREATE OR REPLACE FUNCTION get_adherence_rate(p_patient_id UUID, p_days INT DEFAULT 30)
RETURNS NUMERIC AS $$
  SELECT COALESCE(
    ROUND(
      (
        SUM(CASE WHEN status = 'taken' THEN 1 ELSE 0 END)::numeric /
        NULLIF(SUM(CASE WHEN status IN ('taken','missed','skipped') THEN 1 ELSE 0 END), 0)
      ) * 100,
      2
    ),
    0
  )
  FROM medication_logs
  WHERE patient_id = p_patient_id
    AND scheduled_at >= NOW() - (p_days || ' days')::interval;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_patient_dashboard_summary(p_patient_id UUID)
RETURNS TABLE (
  latest_glucose NUMERIC,
  latest_bp_systolic NUMERIC,
  latest_bp_diastolic NUMERIC,
  latest_weight NUMERIC,
  adherence_rate_30d NUMERIC,
  open_alerts INT,
  goals_active INT,
  goals_achieved INT
) AS $$
  SELECT
    (SELECT value FROM vital_signs
      WHERE patient_id = p_patient_id AND type = 'blood_glucose'
      ORDER BY recorded_at DESC LIMIT 1),
    (SELECT value FROM vital_signs
      WHERE patient_id = p_patient_id AND type = 'blood_pressure_systolic'
      ORDER BY recorded_at DESC LIMIT 1),
    (SELECT value FROM vital_signs
      WHERE patient_id = p_patient_id AND type = 'blood_pressure_diastolic'
      ORDER BY recorded_at DESC LIMIT 1),
    (SELECT value FROM vital_signs
      WHERE patient_id = p_patient_id AND type = 'weight'
      ORDER BY recorded_at DESC LIMIT 1),
    get_adherence_rate(p_patient_id, 30),
    (SELECT COUNT(*) FROM emergency_alerts
      WHERE patient_id = p_patient_id AND status = 'open'),
    (SELECT COUNT(*) FROM goals
      WHERE patient_id = p_patient_id AND status = 'active'),
    (SELECT COUNT(*) FROM goals
      WHERE patient_id = p_patient_id AND status = 'achieved');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION get_provider_panel_summary(p_provider_id UUID)
RETURNS TABLE (
  patient_id UUID,
  patient_name TEXT,
  risk_level TEXT,
  last_active TIMESTAMPTZ,
  open_alerts INT,
  adherence_rate NUMERIC
) AS $$
  SELECT
    pt.profile_id,
    (pr.first_name || ' ' || pr.last_name) AS patient_name,
    pt.risk_level,
    (SELECT MAX(recorded_at) FROM vital_signs vs WHERE vs.patient_id = pt.profile_id),
    (SELECT COUNT(*) FROM emergency_alerts ea
      WHERE ea.patient_id = pt.profile_id AND ea.status = 'open'),
    get_adherence_rate(pt.profile_id, 30)
  FROM care_plans cp
  JOIN patients pt ON pt.profile_id = cp.patient_id
  JOIN profiles pr ON pr.id = pt.profile_id
  WHERE cp.provider_id = p_provider_id
    AND cp.is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;
