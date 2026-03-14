-- =============================================================================
-- HealthOS Provider Module Seed Data
-- Provider: Dr. Sarah Chen  (1d2d6233-952f-4a14-8bd7-b49e44370f61)
-- Adds 8 new patients on her panel with full clinical data:
--   vitals, care plans, goals, prescriptions, medication logs, appointments,
--   messages, emergency alerts, assessments, and provider notifications.
--
-- Prerequisites: seed.sql must have been run first.
-- Run in Supabase SQL Editor → New Query → Run (as service_role / superuser)
-- =============================================================================

DO $$
DECLARE
  -- ── Existing IDs ──────────────────────────────────────────────────────────
  v_provider_id   UUID := '1d2d6233-952f-4a14-8bd7-b49e44370f61';

  -- ── 8 New Patient Profile UUIDs ───────────────────────────────────────────
  v_p1  UUID := 'dddddddd-0001-0000-0000-000000000001'; -- Robert Johnson   (Hypertension, high)
  v_p2  UUID := 'dddddddd-0002-0000-0000-000000000002'; -- Emily Davis       (COPD, critical)
  v_p3  UUID := 'dddddddd-0003-0000-0000-000000000003'; -- Michael Brown     (Heart Failure, high)
  v_p4  UUID := 'dddddddd-0004-0000-0000-000000000004'; -- Jennifer Wilson   (Type 1 Diabetes, medium)
  v_p5  UUID := 'dddddddd-0005-0000-0000-000000000005'; -- David Martinez    (Rheumatoid Arthritis, low)
  v_p6  UUID := 'dddddddd-0006-0000-0000-000000000006'; -- Lisa Thompson     (CKD Stage 3, high)
  v_p7  UUID := 'dddddddd-0007-0000-0000-000000000007'; -- James Anderson    (Asthma, medium)
  v_p8  UUID := 'dddddddd-0008-0000-0000-000000000008'; -- Patricia Garcia   (Type 2 Diabetes + HTN, medium)

  -- ── Care Plan UUIDs ───────────────────────────────────────────────────────
  v_cp1 UUID := 'eeeeeeee-0001-0000-0000-000000000001';
  v_cp2 UUID := 'eeeeeeee-0002-0000-0000-000000000002';
  v_cp3 UUID := 'eeeeeeee-0003-0000-0000-000000000003';
  v_cp4 UUID := 'eeeeeeee-0004-0000-0000-000000000004';
  v_cp5 UUID := 'eeeeeeee-0005-0000-0000-000000000005';
  v_cp6 UUID := 'eeeeeeee-0006-0000-0000-000000000006';
  v_cp7 UUID := 'eeeeeeee-0007-0000-0000-000000000007';
  v_cp8 UUID := 'eeeeeeee-0008-0000-0000-000000000008';

  -- ── Additional Medication UUIDs ───────────────────────────────────────────
  v_m5  UUID := 'bbbbbbbb-0005-0000-0000-000000000001'; -- Amlodipine
  v_m6  UUID := 'bbbbbbbb-0006-0000-0000-000000000001'; -- Tiotropium
  v_m7  UUID := 'bbbbbbbb-0007-0000-0000-000000000001'; -- Carvedilol
  v_m8  UUID := 'bbbbbbbb-0008-0000-0000-000000000001'; -- Insulin Glargine
  v_m9  UUID := 'bbbbbbbb-0009-0000-0000-000000000001'; -- Methotrexate
  v_m10 UUID := 'bbbbbbbb-0010-0000-0000-000000000001'; -- Furosemide
  v_m11 UUID := 'bbbbbbbb-0011-0000-0000-000000000001'; -- Salbutamol
  v_m12 UUID := 'bbbbbbbb-0012-0000-0000-000000000001'; -- Prednisone

  -- ── Prescription UUIDs (2 per patient) ────────────────────────────────────
  v_rx1a UUID := 'ffffffff-0101-0000-0000-000000000001';
  v_rx1b UUID := 'ffffffff-0102-0000-0000-000000000001';
  v_rx2a UUID := 'ffffffff-0201-0000-0000-000000000001';
  v_rx2b UUID := 'ffffffff-0202-0000-0000-000000000001';
  v_rx3a UUID := 'ffffffff-0301-0000-0000-000000000001';
  v_rx3b UUID := 'ffffffff-0302-0000-0000-000000000001';
  v_rx4a UUID := 'ffffffff-0401-0000-0000-000000000001';
  v_rx4b UUID := 'ffffffff-0402-0000-0000-000000000001';
  v_rx5a UUID := 'ffffffff-0501-0000-0000-000000000001';
  v_rx5b UUID := 'ffffffff-0502-0000-0000-000000000001';
  v_rx6a UUID := 'ffffffff-0601-0000-0000-000000000001';
  v_rx6b UUID := 'ffffffff-0602-0000-0000-000000000001';
  v_rx7a UUID := 'ffffffff-0701-0000-0000-000000000001';
  v_rx7b UUID := 'ffffffff-0702-0000-0000-000000000001';
  v_rx8a UUID := 'ffffffff-0801-0000-0000-000000000001';
  v_rx8b UUID := 'ffffffff-0802-0000-0000-000000000001';

  -- ── Vital sign IDs used for emergency alerts ─────────────────────────────
  v_vital_alert1 UUID;
  v_vital_alert2 UUID;
  v_vital_alert3 UUID;

  -- ── Condition IDs (looked up after insert) ────────────────────────────────
  v_cond_copd  UUID;
  v_cond_hf    UUID;
  v_cond_t1d   UUID;
  v_cond_ra    UUID;
  v_cond_ckd   UUID;
  v_cond_asth  UUID;
  v_cond_htn   UUID;
  v_cond_t2d   UUID;
BEGIN

-- ============================================================
-- 0. AUTH.USERS (required by profiles FK before profile insert)
-- ============================================================
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  aud, role, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, is_sso_user
)
VALUES
  (v_p1, 'robert.johnson@healthos-demo.com',   crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p2, 'emily.davis@healthos-demo.com',       crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p3, 'michael.brown@healthos-demo.com',     crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p4, 'jennifer.wilson@healthos-demo.com',   crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p5, 'david.martinez@healthos-demo.com',    crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p6, 'lisa.thompson@healthos-demo.com',     crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p7, 'james.anderson@healthos-demo.com',    crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE),
  (v_p8, 'patricia.garcia@healthos-demo.com',   crypt('Demo1234!', gen_salt('bf')), NOW(), 'authenticated', 'authenticated',
   '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"patient"}'::jsonb, NOW(), NOW(), FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 1. NEW PATIENT PROFILES
-- ============================================================
INSERT INTO profiles (id, role, first_name, last_name, date_of_birth, phone, timezone, avatar_url)
VALUES
  (v_p1, 'patient', 'Robert',   'Johnson',  '1955-03-22', '+1-555-0201', 'America/Chicago',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=robert'),
  (v_p2, 'patient', 'Emily',    'Davis',    '1948-09-14', '+1-555-0202', 'America/Los_Angeles',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=emily'),
  (v_p3, 'patient', 'Michael',  'Brown',    '1962-06-30', '+1-555-0203', 'America/New_York',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=michael'),
  (v_p4, 'patient', 'Jennifer', 'Wilson',   '1990-11-05', '+1-555-0204', 'America/Denver',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer'),
  (v_p5, 'patient', 'David',    'Martinez', '1972-04-18', '+1-555-0205', 'America/Phoenix',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=david'),
  (v_p6, 'patient', 'Lisa',     'Thompson', '1965-08-27', '+1-555-0206', 'America/Chicago',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'),
  (v_p7, 'patient', 'James',    'Anderson', '1985-01-09', '+1-555-0207', 'America/New_York',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=james'),
  (v_p8, 'patient', 'Patricia', 'Garcia',   '1970-07-12', '+1-555-0208', 'America/Los_Angeles',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia')
ON CONFLICT (id) DO UPDATE SET
  first_name    = EXCLUDED.first_name,
  last_name     = EXCLUDED.last_name,
  date_of_birth = EXCLUDED.date_of_birth,
  phone         = EXCLUDED.phone;

-- ============================================================
-- 2. PATIENT RECORDS
-- ============================================================
INSERT INTO patients (profile_id, mrn, primary_condition, risk_level, enrollment_date, notes)
VALUES
  (v_p1, 'MRN-2001', 'hypertension',          'high',     '2024-01-15', 'Stage 2 hypertension. Family history of stroke.'),
  (v_p2, 'MRN-2002', 'copd',                  'critical', '2023-11-08', 'COPD Gold Stage III. Former smoker 40 pack-years.'),
  (v_p3, 'MRN-2003', 'heart_failure',          'high',     '2024-02-20', 'CHF EF 35%. On optimal medical therapy.'),
  (v_p4, 'MRN-2004', 'type1_diabetes',         'medium',   '2024-03-01', 'T1DM since age 12. Uses CGM. Well-controlled.'),
  (v_p5, 'MRN-2005', 'rheumatoid_arthritis',   'low',      '2024-04-10', 'RA in remission on MTX. Monitoring LFTs.'),
  (v_p6, 'MRN-2006', 'chronic_kidney_disease', 'high',     '2023-12-05', 'CKD Stage 3b, GFR 32. Diabetic nephropathy.'),
  (v_p7, 'MRN-2007', 'asthma',                 'medium',   '2024-05-20', 'Moderate persistent asthma. Allergic triggers.'),
  (v_p8, 'MRN-2008', 'type2_diabetes',         'medium',   '2024-06-01', 'T2DM + HTN. A1C 7.8%. Responding well to therapy.')
ON CONFLICT (profile_id) DO UPDATE SET
  primary_condition = EXCLUDED.primary_condition,
  risk_level        = EXCLUDED.risk_level,
  notes             = EXCLUDED.notes;

-- ============================================================
-- 3. ADDITIONAL MEDICAL CONDITIONS
-- ============================================================
INSERT INTO medical_conditions (code, name, description, category)
VALUES
  ('I10',   'Essential Hypertension',              'High blood pressure',                             'Cardiovascular'),
  ('J44.1', 'COPD with acute exacerbation',        'Chronic obstructive pulmonary disease',           'Respiratory'),
  ('I50.9', 'Heart Failure, unspecified',           'Congestive heart failure',                        'Cardiovascular'),
  ('E10.9', 'Type 1 Diabetes Mellitus',            'Type 1 diabetes without complications',           'Endocrine'),
  ('M06.9', 'Rheumatoid Arthritis, unspecified',   'Autoimmune inflammatory joint disease',           'Musculoskeletal'),
  ('N18.3', 'Chronic Kidney Disease Stage 3',      'CKD with GFR 30-59',                             'Renal'),
  ('J45.9', 'Asthma, unspecified',                 'Chronic inflammatory airway disease',             'Respiratory'),
  ('E11.9', 'Type 2 Diabetes Mellitus',            'Type 2 diabetes without complications',           'Endocrine')
ON CONFLICT (code) DO NOTHING;

SELECT id INTO v_cond_htn  FROM medical_conditions WHERE code = 'I10';
SELECT id INTO v_cond_copd FROM medical_conditions WHERE code = 'J44.1';
SELECT id INTO v_cond_hf   FROM medical_conditions WHERE code = 'I50.9';
SELECT id INTO v_cond_t1d  FROM medical_conditions WHERE code = 'E10.9';
SELECT id INTO v_cond_ra   FROM medical_conditions WHERE code = 'M06.9';
SELECT id INTO v_cond_ckd  FROM medical_conditions WHERE code = 'N18.3';
SELECT id INTO v_cond_asth FROM medical_conditions WHERE code = 'J45.9';
SELECT id INTO v_cond_t2d  FROM medical_conditions WHERE code = 'E11.9';

-- ============================================================
-- 4. PATIENT CONDITIONS
-- ============================================================
INSERT INTO patient_conditions (patient_id, condition_id, diagnosed_at, status, notes)
VALUES
  (v_p1, v_cond_htn,  '2018-06-10', 'active',   'BP frequently >160/100'),
  (v_p2, v_cond_copd, '2015-03-22', 'active',   'FEV1 45% predicted'),
  (v_p3, v_cond_hf,   '2020-11-15', 'active',   'LVEF 35% on echo'),
  (v_p4, v_cond_t1d,  '2002-08-30', 'active',   'CGM in use, target TIR >70%'),
  (v_p5, v_cond_ra,   '2019-02-14', 'remission','DAS28 score 2.1'),
  (v_p6, v_cond_ckd,  '2021-07-09', 'active',   'eGFR trending down'),
  (v_p6, v_cond_t2d,  '2016-04-01', 'active',   'Diabetic nephropathy underlying cause'),
  (v_p7, v_cond_asth, '2010-05-20', 'active',   'ACT score 18'),
  (v_p8, v_cond_t2d,  '2019-09-11', 'active',   'A1C 7.8%'),
  (v_p8, v_cond_htn,  '2020-01-15', 'active',   'BP 145/92 on medication')
ON CONFLICT (patient_id, condition_id) DO NOTHING;

-- ============================================================
-- 5. ADDITIONAL MEDICATIONS
-- ============================================================
INSERT INTO medications (id, name, generic_name, drug_class, typical_dosage)
VALUES
  (v_m5,  'Norvasc',        'Amlodipine',       'Calcium Channel Blocker', '5-10mg once daily'),
  (v_m6,  'Spiriva',        'Tiotropium',       'Anticholinergic Bronchodilator', '18mcg inhaled once daily'),
  (v_m7,  'Coreg',          'Carvedilol',       'Beta Blocker',            '3.125-25mg twice daily'),
  (v_m8,  'Lantus',         'Insulin Glargine', 'Long-acting Insulin',     '10-80 units at bedtime'),
  (v_m9,  'Rheumatrex',     'Methotrexate',     'DMARD',                   '7.5-25mg once weekly'),
  (v_m10, 'Lasix',          'Furosemide',       'Loop Diuretic',           '20-80mg once/twice daily'),
  (v_m11, 'Ventolin',       'Salbutamol',       'Short-acting Beta2 Agonist', '100-200mcg as needed'),
  (v_m12, 'Deltasone',      'Prednisone',       'Corticosteroid',          '5-40mg once daily')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. CARE PLANS
-- ============================================================
INSERT INTO care_plans (id, patient_id, provider_id, title, description, start_date, end_date, is_active, alert_thresholds)
VALUES
  (v_cp1, v_p1, v_provider_id,
   'Hypertension Control Program',
   'Intensive BP management targeting <130/80. Lifestyle modification + pharmacotherapy.',
   '2024-01-15', '2024-12-31', TRUE,
   '{"blood_pressure_systolic":{"high":160},"blood_pressure_diastolic":{"high":100},"heart_rate":{"low":50,"high":110}}'::jsonb),

  (v_cp2, v_p2, v_provider_id,
   'COPD Management & Pulmonary Rehab',
   'Maximise lung function, reduce exacerbations, smoking cessation support.',
   '2023-11-08', NULL, TRUE,
   '{"oxygen_saturation":{"low":92},"heart_rate":{"low":50,"high":120}}'::jsonb),

  (v_cp3, v_p3, v_provider_id,
   'Heart Failure Optimisation Plan',
   'GDMT titration, daily weight monitoring, fluid restriction, symptom diary.',
   '2024-02-20', NULL, TRUE,
   '{"heart_rate":{"low":50,"high":100},"blood_pressure_systolic":{"high":150},"blood_pressure_diastolic":{"high":95}}'::jsonb),

  (v_cp4, v_p4, v_provider_id,
   'Type 1 Diabetes CGM Program',
   'Target TIR >70%, minimise hypoglycaemia, quarterly A1C reviews.',
   '2024-03-01', NULL, TRUE,
   '{"blood_glucose":{"low":70,"high":250},"heart_rate":{"low":50,"high":120}}'::jsonb),

  (v_cp5, v_p5, v_provider_id,
   'Rheumatoid Arthritis Maintenance',
   'Maintain remission on MTX, monitor LFTs, DAS28 every 3 months.',
   '2024-04-10', NULL, TRUE,
   '{"heart_rate":{"low":50,"high":120}}'::jsonb),

  (v_cp6, v_p6, v_provider_id,
   'CKD Stage 3 Slow-Progression Plan',
   'Preserve GFR, BP <130/80, protein-restricted diet, nephrology co-management.',
   '2023-12-05', NULL, TRUE,
   '{"blood_pressure_systolic":{"high":140},"blood_glucose":{"low":70,"high":200}}'::jsonb),

  (v_cp7, v_p7, v_provider_id,
   'Asthma Action Plan',
   'Achieve good asthma control (ACT≥20), identify triggers, rescue inhaler protocol.',
   '2024-05-20', NULL, TRUE,
   '{"oxygen_saturation":{"low":94},"heart_rate":{"low":50,"high":120}}'::jsonb),

  (v_cp8, v_p8, v_provider_id,
   'Diabetes + Hypertension Dual Management',
   'Lower A1C to <7%, BP <130/80. Coordinated lifestyle and medication approach.',
   '2024-06-01', NULL, TRUE,
   '{"blood_glucose":{"low":70,"high":250},"blood_pressure_systolic":{"high":145}}'::jsonb)

ON CONFLICT (id) DO UPDATE SET
  title       = EXCLUDED.title,
  description = EXCLUDED.description,
  is_active   = EXCLUDED.is_active;

-- ============================================================
-- 7. GOALS
-- ============================================================
INSERT INTO goals (care_plan_id, patient_id, title, description, metric, target_value, target_unit, deadline, status)
VALUES
  -- Robert (Hypertension)
  (v_cp1, v_p1, 'Achieve target BP <130/80',       'Systolic BP consistently below 130',      'blood_pressure_systolic', 130, 'mmHg',    '2024-09-30', 'active'),
  (v_cp1, v_p1, 'Reduce sodium intake',             'Limit dietary sodium to <2g/day',         'sodium_intake',            2,  'g/day',   '2024-07-31', 'active'),
  (v_cp1, v_p1, 'Walk 30 minutes daily',            '150 min/week moderate activity',          'exercise_minutes',        30,  'min/day', '2024-08-31', 'active'),

  -- Emily (COPD)
  (v_cp2, v_p2, 'Complete pulmonary rehab program', '12-week supervised exercise',             'sessions_completed',       24, 'sessions','2024-05-31', 'achieved'),
  (v_cp2, v_p2, 'Achieve SpO2 >94% at rest',        'Maintain adequate oxygenation',           'oxygen_saturation',        94, '%',       '2024-12-31', 'active'),
  (v_cp2, v_p2, 'Zero hospital admissions',         'Prevent COPD exacerbations requiring hosp','admissions',              0, 'count',   '2024-12-31', 'active'),

  -- Michael (Heart Failure)
  (v_cp3, v_p3, 'Daily weight logging',             'Weigh every morning, report >2kg gain',  'daily_weigh_ins',          1, 'per day', '2024-12-31', 'active'),
  (v_cp3, v_p3, 'Fluid restriction 1.5L/day',       'Limit total fluid intake',               'fluid_intake',           1.5, 'L/day',   '2024-12-31', 'active'),
  (v_cp3, v_p3, 'Improve 6MWT to 350m',             'Six-minute walk test improvement',       '6mwt_distance',          350, 'metres',  '2024-09-30', 'active'),

  -- Jennifer (T1DM)
  (v_cp4, v_p4, 'Time in range >70%',              'CGM TIR 70-180 mg/dL >70% of time',       'time_in_range',           70, '%',       '2024-12-31', 'active'),
  (v_cp4, v_p4, 'A1C below 7.0%',                  'Quarterly lab target',                    'hba1c',                    7, '%',       '2024-09-30', 'active'),
  (v_cp4, v_p4, 'Reduce nocturnal hypoglycaemia',  'Fewer than 2 episodes/month',             'hypo_episodes',            2, 'per month','2024-08-31','active'),

  -- David (RA)
  (v_cp5, v_p5, 'Maintain DAS28 <2.6',             'Low disease activity score',              'das28_score',             2.6, 'score',  '2024-12-31', 'active'),
  (v_cp5, v_p5, 'LFTs within normal range',         'Monitor for MTX hepatotoxicity',          'alt',                     40, 'U/L',     '2024-12-31', 'active'),

  -- Lisa (CKD)
  (v_cp6, v_p6, 'Preserve eGFR above 28',          'Slow progression of CKD',                'egfr',                    28, 'mL/min',  '2024-12-31', 'active'),
  (v_cp6, v_p6, 'Protein intake <0.8g/kg/day',     'Dietary restriction to protect kidneys',  'protein_intake',         0.8, 'g/kg/day','2024-12-31', 'active'),
  (v_cp6, v_p6, 'A1C below 7.5%',                  'Glycaemic control in CKD context',        'hba1c',                  7.5, '%',       '2024-09-30', 'active'),

  -- James (Asthma)
  (v_cp7, v_p7, 'ACT score ≥20',                   'Well-controlled asthma',                  'act_score',               20, 'score',   '2024-09-30', 'active'),
  (v_cp7, v_p7, 'Reduce rescue inhaler use',        '<2 puffs/week of Salbutamol',            'rescue_inhaler_use',       2, 'puffs/wk','2024-12-31', 'active'),

  -- Patricia (T2DM + HTN)
  (v_cp8, v_p8, 'Reduce A1C to <7.5%',             'Current A1C 7.8%, target 7.5% by Sep',   'hba1c',                  7.5, '%',       '2024-09-30', 'active'),
  (v_cp8, v_p8, 'BP <130/80',                       'Dual condition management',               'blood_pressure_systolic', 130,'mmHg',   '2024-09-30', 'active'),
  (v_cp8, v_p8, 'Lose 5kg body weight',             'Weight reduction improves both conditions','body_weight',            80, 'kg',      '2024-12-31', 'active');

-- ============================================================
-- 8. PRESCRIPTIONS
-- ============================================================
INSERT INTO prescriptions (id, patient_id, medication_id, prescriber_id, dosage, frequency, instructions, start_date, is_active, refills_remaining)
VALUES
  -- Robert (Hypertension): Amlodipine + Lisinopril
  (v_rx1a, v_p1, v_m5,  v_provider_id, '10mg',   'once daily',  'Take in the morning',                                    '2024-01-15', TRUE,  5),
  (v_rx1b, v_p1, (SELECT id FROM medications WHERE name='Lisinopril' LIMIT 1),
                         v_provider_id, '20mg',   'once daily',  'Take with or without food, monitor K+',                  '2024-01-15', TRUE,  5),

  -- Emily (COPD): Tiotropium + Salbutamol
  (v_rx2a, v_p2, v_m6,  v_provider_id, '18mcg',  'once daily',  'Inhale using HandiHaler device',                         '2023-11-08', TRUE,  3),
  (v_rx2b, v_p2, v_m11, v_provider_id, '100mcg', 'as needed',   'Rescue inhaler - max 8 puffs/day',                       '2023-11-08', TRUE,  6),

  -- Michael (Heart Failure): Carvedilol + Furosemide
  (v_rx3a, v_p3, v_m7,  v_provider_id, '12.5mg', 'twice daily', 'Titrate up slowly, hold if HR<55',                       '2024-02-20', TRUE,  4),
  (v_rx3b, v_p3, v_m10, v_provider_id, '40mg',   'once daily',  'Take in the morning. Weigh daily, call if +2kg',         '2024-02-20', TRUE,  3),

  -- Jennifer (T1DM): Insulin Glargine + Metformin
  (v_rx4a, v_p4, v_m8,  v_provider_id, '28 units','at bedtime', 'Rotate injection sites. Adjust ±2u based on fasting BG', '2024-03-01', TRUE,  6),
  (v_rx4b, v_p4, (SELECT id FROM medications WHERE name='Metformin' LIMIT 1),
                         v_provider_id, '1000mg', 'twice daily', 'Take with meals to reduce GI effects',                   '2024-03-01', TRUE,  5),

  -- David (RA): Methotrexate + Prednisone
  (v_rx5a, v_p5, v_m9,  v_provider_id, '15mg',   'once weekly', 'Take on same day each week with folic acid',             '2024-04-10', TRUE,  3),
  (v_rx5b, v_p5, v_m12, v_provider_id, '5mg',    'once daily',  'Taper when disease activity allows',                     '2024-04-10', TRUE,  2),

  -- Lisa (CKD): Furosemide + Amlodipine
  (v_rx6a, v_p6, v_m10, v_provider_id, '20mg',   'once daily',  'Monitor electrolytes and renal function monthly',        '2023-12-05', TRUE,  4),
  (v_rx6b, v_p6, v_m5,  v_provider_id, '5mg',    'once daily',  'For renal protection and BP control',                    '2023-12-05', TRUE,  5),

  -- James (Asthma): Salbutamol + Prednisone (burst)
  (v_rx7a, v_p7, v_m11, v_provider_id, '200mcg', 'as needed',   'Rescue inhaler, shake well before use',                  '2024-05-20', TRUE,  8),
  (v_rx7b, v_p7, v_m12, v_provider_id, '30mg',   'once daily x5','Short course for acute exacerbation',                   '2024-05-20', FALSE, 0),

  -- Patricia (T2DM+HTN): Metformin + Amlodipine
  (v_rx8a, v_p8, (SELECT id FROM medications WHERE name='Metformin' LIMIT 1),
                         v_provider_id, '1000mg', 'twice daily', 'Take with breakfast and dinner',                         '2024-06-01', TRUE,  6),
  (v_rx8b, v_p8, v_m5,  v_provider_id, '5mg',    'once daily',  'For hypertension management',                            '2024-06-01', TRUE,  5)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 9. VITAL SIGNS (Last 14 days per patient)
-- ============================================================

-- Robert (Hypertension) — BP + Heart Rate
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p1, 'blood_pressure_systolic',
  ROUND((145 + (RANDOM() * 30 - 15))::numeric, 1),
  'mmHg', 'manual', (145 + (RANDOM() * 30 - 15)) > 160,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p1, 'blood_pressure_diastolic',
  ROUND((90 + (RANDOM() * 20 - 10))::numeric, 1),
  'mmHg', 'manual', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p1, 'heart_rate',
  ROUND((72 + (RANDOM() * 16 - 8))::numeric, 0),
  'bpm', 'manual', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- Emily (COPD) — SpO2 + Heart Rate
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p2, 'oxygen_saturation',
  ROUND((93 + (RANDOM() * 5 - 3))::numeric, 1),
  '%', 'device', (93 + (RANDOM() * 5 - 3)) < 92,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p2, 'heart_rate',
  ROUND((78 + (RANDOM() * 22 - 11))::numeric, 0),
  'bpm', 'device', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- Michael (Heart Failure) — BP + HR + Weight
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p3, 'blood_pressure_systolic',
  ROUND((130 + (RANDOM() * 28 - 14))::numeric, 1),
  'mmHg', 'manual', (130 + (RANDOM() * 28 - 14)) > 150,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p3, 'heart_rate',
  ROUND((68 + (RANDOM() * 20 - 10))::numeric, 0),
  'bpm', 'device', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p3, 'weight',
  ROUND((88 + (RANDOM() * 6 - 1))::numeric, 1),
  'kg', 'manual', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- Jennifer (T1DM) — Blood Glucose
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p4, 'blood_glucose',
  ROUND((120 + (RANDOM() * 80 - 40))::numeric, 1),
  'mg/dL', 'device', (120 + (RANDOM() * 80 - 40)) > 250 OR (120 + (RANDOM() * 80 - 40)) < 70,
  NOW() - ((g.day * 0.5) || ' days')::interval
FROM generate_series(1,28) AS g(day);

-- David (RA) — Heart Rate + Weight
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p5, 'heart_rate',
  ROUND((65 + (RANDOM() * 14 - 7))::numeric, 0),
  'bpm', 'manual', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p5, 'weight',
  ROUND((74 + (RANDOM() * 4 - 2))::numeric, 1),
  'kg', 'manual', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- Lisa (CKD) — BP + Blood Glucose
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p6, 'blood_pressure_systolic',
  ROUND((138 + (RANDOM() * 24 - 12))::numeric, 1),
  'mmHg', 'manual', (138 + (RANDOM() * 24 - 12)) > 140,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p6, 'blood_glucose',
  ROUND((145 + (RANDOM() * 60 - 30))::numeric, 1),
  'mg/dL', 'manual', (145 + (RANDOM() * 60 - 30)) > 200,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- James (Asthma) — SpO2 + Heart Rate
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p7, 'oxygen_saturation',
  ROUND((96 + (RANDOM() * 4 - 2))::numeric, 1),
  '%', 'manual', (96 + (RANDOM() * 4 - 2)) < 94,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p7, 'heart_rate',
  ROUND((74 + (RANDOM() * 16 - 8))::numeric, 0),
  'bpm', 'manual', FALSE,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- Patricia (T2DM+HTN) — BP + Blood Glucose
INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p8, 'blood_pressure_systolic',
  ROUND((140 + (RANDOM() * 20 - 10))::numeric, 1),
  'mmHg', 'manual', (140 + (RANDOM() * 20 - 10)) > 145,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

INSERT INTO vital_signs (patient_id, type, value, unit, source, alert_triggered, recorded_at)
SELECT v_p8, 'blood_glucose',
  ROUND((150 + (RANDOM() * 60 - 30))::numeric, 1),
  'mg/dL', 'manual', (150 + (RANDOM() * 60 - 30)) > 250,
  NOW() - (g.day || ' days')::interval
FROM generate_series(1,14) AS g(day);

-- ============================================================
-- 10. MEDICATION LOGS (Last 14 days — realistic adherence per patient)
-- ============================================================

-- Robert: 90% adherence
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx1a, v_p1,
  CASE WHEN RANDOM() < 0.90 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '08:00:00'::time,
  CASE WHEN RANDOM() < 0.90 THEN (NOW() - (g.day || ' days')::interval)::date + '08:05:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx1b, v_p1,
  CASE WHEN RANDOM() < 0.90 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '08:00:00'::time,
  CASE WHEN RANDOM() < 0.90 THEN (NOW() - (g.day || ' days')::interval)::date + '08:06:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

-- Emily: 85% adherence
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx2a, v_p2,
  CASE WHEN RANDOM() < 0.85 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '09:00:00'::time,
  CASE WHEN RANDOM() < 0.85 THEN (NOW() - (g.day || ' days')::interval)::date + '09:10:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

-- Michael: 95% adherence
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx3a, v_p3,
  CASE WHEN RANDOM() < 0.95 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '08:00:00'::time,
  CASE WHEN RANDOM() < 0.95 THEN (NOW() - (g.day || ' days')::interval)::date + '08:10:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx3b, v_p3,
  CASE WHEN RANDOM() < 0.95 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '08:00:00'::time,
  CASE WHEN RANDOM() < 0.95 THEN (NOW() - (g.day || ' days')::interval)::date + '08:15:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

-- Jennifer: 97% adherence
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx4a, v_p4,
  CASE WHEN RANDOM() < 0.97 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '22:00:00'::time,
  CASE WHEN RANDOM() < 0.97 THEN (NOW() - (g.day || ' days')::interval)::date + '22:05:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

-- Patricia: 80% adherence
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_rx8a, v_p8,
  CASE WHEN RANDOM() < 0.80 THEN 'taken' ELSE 'missed' END::medication_log_status,
  (NOW() - (g.day || ' days')::interval)::date + '07:30:00'::time,
  CASE WHEN RANDOM() < 0.80 THEN (NOW() - (g.day || ' days')::interval)::date + '07:35:00'::time ELSE NULL END
FROM generate_series(1,14) AS g(day);

-- ============================================================
-- 11. SYMPTOMS
-- ============================================================
INSERT INTO symptoms (patient_id, symptom, severity, notes, recorded_at)
VALUES
  (v_p1, 'Headache',           6, 'Morning headache, likely BP-related',              NOW() - '2 days'::interval),
  (v_p1, 'Dizziness',          4, 'After standing up quickly',                        NOW() - '5 days'::interval),
  (v_p2, 'Shortness of breath',8, 'At rest, worse than usual. No fever.',             NOW() - '1 day'::interval),
  (v_p2, 'Productive cough',   6, 'Increased sputum, yellow-green',                   NOW() - '3 days'::interval),
  (v_p2, 'Fatigue',            7, 'Unable to walk to mailbox without stopping',       NOW() - '2 days'::interval),
  (v_p3, 'Ankle swelling',     5, 'Bilateral, worsening in evenings',                 NOW() - '4 days'::interval),
  (v_p3, 'Shortness of breath',6, 'On exertion, improved with rest',                  NOW() - '6 days'::interval),
  (v_p4, 'Low blood sugar',    7, 'BG 54 mg/dL at 3AM, treated with juice',          NOW() - '3 days'::interval),
  (v_p4, 'Fatigue',            4, 'Post-hypoglycaemia fatigue',                       NOW() - '3 days'::interval),
  (v_p5, 'Joint stiffness',    3, 'Morning stiffness <30 min, well controlled',       NOW() - '7 days'::interval),
  (v_p6, 'Swollen ankles',     5, 'Fluid retention, weight up 1.5kg',                 NOW() - '2 days'::interval),
  (v_p6, 'Fatigue',            6, 'Persistent low energy throughout the day',         NOW() - '5 days'::interval),
  (v_p7, 'Wheezing',           5, 'Triggered by cold air on morning walk',            NOW() - '1 day'::interval),
  (v_p7, 'Chest tightness',    4, 'Relieved by rescue inhaler',                       NOW() - '2 days'::interval),
  (v_p8, 'Increased thirst',   5, 'Polydipsia, correlates with high BG readings',    NOW() - '4 days'::interval),
  (v_p8, 'Blurred vision',     4, 'Episodic, worse when BG is high',                 NOW() - '6 days'::interval);

-- ============================================================
-- 12. APPOINTMENTS (Past completed + Upcoming scheduled)
-- ============================================================
INSERT INTO appointments (patient_id, provider_id, appointment_type, status, scheduled_at, duration_minutes, meeting_url, notes)
VALUES
  -- Past appointments (completed)
  (v_p1, v_provider_id, 'telehealth', 'completed', NOW() - '28 days'::interval, 30, 'https://meet.healthos.app/rx001', 'BP review. Increased Amlodipine to 10mg.'),
  (v_p2, v_provider_id, 'in_person',  'completed', NOW() - '21 days'::interval, 45, NULL, 'COPD review. SpO2 91% — discussed O2 therapy.'),
  (v_p3, v_provider_id, 'telehealth', 'completed', NOW() - '14 days'::interval, 30, 'https://meet.healthos.app/rx003', 'HF follow-up. Weight stable. Carvedilol dose maintained.'),
  (v_p4, v_provider_id, 'telehealth', 'completed', NOW() - '10 days'::interval, 30, 'https://meet.healthos.app/rx004', 'CGM review. TIR 72%. Basal insulin unchanged.'),
  (v_p6, v_provider_id, 'in_person',  'completed', NOW() - '7 days'::interval,  45, NULL, 'CKD review. eGFR 30, holding stable. Referred to nephrology.'),
  (v_p5, v_provider_id, 'telehealth', 'completed', NOW() - '3 days'::interval,  20, 'https://meet.healthos.app/rx005', 'RA maintenance. DAS28 2.0, in remission.'),
  (v_p7, v_provider_id, 'in_person',  'completed', NOW() - '5 days'::interval,  30, NULL, 'Asthma review. ACT score 19, nearly controlled.'),
  (v_p8, v_provider_id, 'telehealth', 'completed', NOW() - '2 days'::interval,  30, 'https://meet.healthos.app/rx008', 'Dual management review. A1C 7.8%, plan adjustment.'),
  -- Upcoming appointments (scheduled)
  (v_p1, v_provider_id, 'telehealth', 'scheduled', NOW() + '7 days'::interval,  30, 'https://meet.healthos.app/s001', 'BP 4-week follow-up'),
  (v_p2, v_provider_id, 'in_person',  'scheduled', NOW() + '3 days'::interval,  60, NULL, 'Urgent COPD review — recent exacerbation symptoms'),
  (v_p3, v_provider_id, 'telehealth', 'scheduled', NOW() + '14 days'::interval, 30, 'https://meet.healthos.app/s003', 'Monthly HF check'),
  (v_p4, v_provider_id, 'telehealth', 'scheduled', NOW() + '5 days'::interval,  25, 'https://meet.healthos.app/s004', 'CGM data review + insulin adjustment'),
  (v_p6, v_provider_id, 'in_person',  'scheduled', NOW() + '10 days'::interval, 45, NULL, 'CKD + nephrology co-consult'),
  (v_p7, v_provider_id, 'telehealth', 'scheduled', NOW() + '18 days'::interval, 25, 'https://meet.healthos.app/s007', 'Asthma seasonal review'),
  (v_p8, v_provider_id, 'telehealth', 'scheduled', NOW() + '21 days'::interval, 30, 'https://meet.healthos.app/s008', 'A1C result follow-up');

-- ============================================================
-- 13. MESSAGES (Provider ↔ each patient)
-- ============================================================
INSERT INTO messages (sender_id, recipient_id, subject, content, status, sent_at, read_at)
VALUES
  -- Robert ↔ Provider
  (v_provider_id, v_p1, 'BP Medication Update',
   'Hi Robert, I am increasing your Amlodipine to 10mg based on your last week''s readings. Please monitor daily and message me if you feel dizzy.',
   'read', NOW() - '7 days'::interval, NOW() - '7 days'::interval + '2 hours'::interval),
  (v_p1, v_provider_id, 'Re: BP Medication Update',
   'Thank you Dr. Chen. I started the new dose. My morning reading today was 138/88. Is that okay?',
   'read', NOW() - '6 days'::interval, NOW() - '6 days'::interval + '1 hour'::interval),
  (v_provider_id, v_p1, 'Re: BP Medication Update',
   'That''s good progress! 138/88 is improving. Keep logging daily. See you next week.',
   'delivered', NOW() - '6 days'::interval + '2 hours'::interval, NULL),

  -- Emily ↔ Provider
  (v_p2, v_provider_id, 'Breathing worse today',
   'Dr. Chen, my breathing has been much worse the last 2 days. SpO2 dropped to 90% this morning. Should I go to the ER?',
   'read', NOW() - '1 day'::interval, NOW() - '1 day'::interval + '30 minutes'::interval),
  (v_provider_id, v_p2, 'Re: Breathing worse today',
   'Emily, thank you for alerting me. Please come in tomorrow morning — I have fit you in at 10 AM. If symptoms worsen overnight (SpO2 < 88%, severe distress), go to the ER immediately.',
   'delivered', NOW() - '23 hours'::interval, NULL),

  -- Michael ↔ Provider
  (v_p3, v_provider_id, 'Weight increased 2.5kg',
   'Good morning. My weight went from 88kg to 90.5kg over 3 days. Ankles are also more swollen. Should I take an extra furosemide?',
   'read', NOW() - '4 days'::interval, NOW() - '4 days'::interval + '45 minutes'::interval),
  (v_provider_id, v_p3, 'Re: Weight increased 2.5kg',
   'Michael, good that you noticed this early. Yes, take an extra 20mg Furosemide today. Restrict fluids to 1.5L. I''ll call you tomorrow if no improvement. This is exactly why we track your weight daily.',
   'read', NOW() - '4 days'::interval + '1 hour'::interval, NOW() - '3 days'::interval),

  -- Jennifer ↔ Provider
  (v_p4, v_provider_id, 'Low BG overnight',
   'Dr. Chen, I had a bad hypo at 3AM — BG was 54. I treated with juice and it came up to 112. Should I reduce my Lantus dose?',
   'read', NOW() - '3 days'::interval, NOW() - '3 days'::interval + '1 hour'::interval),
  (v_provider_id, v_p4, 'Re: Low BG overnight',
   'Jennifer, thank you for tracking this. Reduce your Lantus by 2 units to 26 units tonight. Make sure you have a snack at bedtime. Let''s review your CGM data at our appointment Friday.',
   'read', NOW() - '3 days'::interval + '2 hours'::interval, NOW() - '2 days'::interval),

  -- Lisa ↔ Provider
  (v_p6, v_provider_id, 'Lab results question',
   'Hi Dr. Chen. My creatinine came back at 1.9 — that seems high to me. Is my CKD getting worse?',
   'read', NOW() - '8 days'::interval, NOW() - '8 days'::interval + '3 hours'::interval),
  (v_provider_id, v_p6, 'Re: Lab results question',
   'Lisa, your creatinine of 1.9 corresponds to an eGFR of about 30 which is CKD Stage 3b — consistent with last quarter. No significant change. We will review at your appointment and I am referring you to nephrology for co-management.',
   'read', NOW() - '8 days'::interval + '4 hours'::interval, NOW() - '7 days'::interval),

  -- James ↔ Provider
  (v_p7, v_provider_id, 'Asthma worse with weather change',
   'The cold weather this week really set off my asthma. Used my rescue inhaler 4 times yesterday. Is there anything I can take preventatively?',
   'read', NOW() - '2 days'::interval, NOW() - '2 days'::interval + '2 hours'::interval),
  (v_provider_id, v_p7, 'Re: Asthma worse with weather change',
   'James, 4 puffs in a day indicates your asthma is not well controlled. I am going to add a preventer inhaler — let''s discuss at your visit in 2 weeks. In the meantime, wear a scarf over your mouth in cold air.',
   'delivered', NOW() - '2 days'::interval + '3 hours'::interval, NULL),

  -- Patricia ↔ Provider
  (v_p8, v_provider_id, 'Having trouble with diet',
   'Dr. Chen, I have been finding it hard to stick to the low-carb diet. My BG has been running around 200 most days. Is there anything else I can do?',
   'read', NOW() - '5 days'::interval, NOW() - '5 days'::interval + '1 hour'::interval),
  (v_provider_id, v_p8, 'Re: Having trouble with diet',
   'Patricia, I understand — dietary changes take time. I am referring you to our dietitian for a personalised meal plan. Also, let''s consider adjusting your Metformin dose at our next visit. Keep logging your meals and BG.',
   'delivered', NOW() - '5 days'::interval + '2 hours'::interval, NULL);

-- ============================================================
-- 14. EMERGENCY ALERTS (Variety of severities and statuses)
-- ============================================================

-- Grab some vital IDs for linking (most recent alerts)
SELECT id INTO v_vital_alert1
FROM vital_signs
WHERE patient_id = v_p2 AND type = 'oxygen_saturation'
ORDER BY recorded_at DESC LIMIT 1;

SELECT id INTO v_vital_alert2
FROM vital_signs
WHERE patient_id = v_p1 AND type = 'blood_pressure_systolic'
ORDER BY recorded_at DESC LIMIT 1;

SELECT id INTO v_vital_alert3
FROM vital_signs
WHERE patient_id = v_p6 AND type = 'blood_pressure_systolic'
ORDER BY recorded_at DESC LIMIT 1;

INSERT INTO emergency_alerts (patient_id, vital_sign_id, severity, status, trigger_type, trigger_value, threshold_value, message, acknowledged_by, acknowledged_at, resolved_at, resolution_notes)
VALUES
  -- Critical: Emily SpO2 drop — OPEN (provider needs to act)
  (v_p2, v_vital_alert1, 'critical', 'open',
   'oxygen_saturation_low', 90.1, 92,
   'CRITICAL: Emily Davis SpO2 dropped to 90.1% — below the 92% threshold. Patient reports worsening dyspnoea.',
   NULL, NULL, NULL, NULL),

  -- Urgent: Robert BP spike — ACKNOWLEDGED
  (v_p1, v_vital_alert2, 'urgent', 'acknowledged',
   'blood_pressure_high', 168.0, 160,
   'URGENT: Robert Johnson systolic BP recorded at 168 mmHg — exceeds 160 mmHg threshold.',
   v_provider_id, NOW() - '2 days'::interval + '2 hours'::interval, NULL, NULL),

  -- Warning: Lisa elevated BP — RESOLVED
  (v_p6, v_vital_alert3, 'warning', 'resolved',
   'blood_pressure_high', 152.0, 140,
   'WARNING: Lisa Thompson systolic BP at 152 mmHg — above 140 mmHg CKD management threshold.',
   v_provider_id, NOW() - '5 days'::interval + '1 hour'::interval,
   NOW() - '5 days'::interval + '4 hours'::interval,
   'Medication reviewed, Amlodipine maintained. Patient advised on salt restriction.'),

  -- Critical: Michael weight gain — OPEN
  (v_p3, NULL, 'urgent', 'open',
   'weight_gain_rapid', 90.5, 88.0,
   'URGENT: Michael Brown weight increased 2.5 kg over 3 days (88.0 → 90.5 kg). Possible fluid retention in HF patient.',
   NULL, NULL, NULL, NULL),

  -- Warning: Jennifer hypoglycaemia — RESOLVED
  (v_p4, NULL, 'warning', 'resolved',
   'blood_glucose_low', 54.0, 70,
   'WARNING: Jennifer Wilson blood glucose 54 mg/dL at 3:00 AM — below hypoglycaemia threshold of 70 mg/dL.',
   v_provider_id, NOW() - '3 days'::interval + '1 hour'::interval,
   NOW() - '3 days'::interval + '3 hours'::interval,
   'Patient self-treated with juice. BG recovered to 112. Lantus reduced by 2 units.'),

  -- Warning: Patricia high glucose — OPEN
  (v_p8, NULL, 'warning', 'open',
   'blood_glucose_high', 268.0, 250,
   'WARNING: Patricia Garcia blood glucose 268 mg/dL — above 250 mg/dL threshold. Persistent hyperglycaemia this week.',
   NULL, NULL, NULL, NULL),

  -- Urgent: Emily recent exacerbation — ACKNOWLEDGED
  (v_p2, NULL, 'urgent', 'acknowledged',
   'oxygen_saturation_low', 91.5, 92,
   'URGENT: Emily Davis SpO2 91.5% — 2nd alert this week. Potential COPD exacerbation in progress.',
   v_provider_id, NOW() - '12 hours'::interval, NULL, NULL),

  -- Warning: James asthma — OPEN
  (v_p7, NULL, 'warning', 'open',
   'oxygen_saturation_low', 93.8, 94,
   'WARNING: James Anderson SpO2 93.8% — slightly below 94% asthma management threshold.',
   NULL, NULL, NULL, NULL);

-- ============================================================
-- 15. ASSESSMENTS (PHQ-9 and GAD-7 for several patients)
-- ============================================================
INSERT INTO assessments (patient_id, type, score, responses, completed_at)
VALUES
  -- Robert: PHQ-9 (mild depression — living with chronic illness)
  (v_p1, 'phq9', 8,
   '{"q1":1,"q2":1,"q3":1,"q4":2,"q5":0,"q6":1,"q7":1,"q8":1,"q9":0}'::jsonb,
   NOW() - '10 days'::interval),

  -- Emily: PHQ-9 (moderate — COPD affecting quality of life)
  (v_p2, 'phq9', 14,
   '{"q1":2,"q2":2,"q3":2,"q4":2,"q5":1,"q6":2,"q7":1,"q8":1,"q9":1}'::jsonb,
   NOW() - '5 days'::interval),

  -- Emily: GAD-7 (anxiety about COPD exacerbations)
  (v_p2, 'gad7', 12,
   '{"q1":2,"q2":2,"q3":2,"q4":2,"q5":1,"q6":1,"q7":2}'::jsonb,
   NOW() - '5 days'::interval),

  -- Michael: PHQ-9 (mild-moderate — heart failure impact)
  (v_p3, 'phq9', 10,
   '{"q1":2,"q2":1,"q3":1,"q4":2,"q5":1,"q6":1,"q7":1,"q8":1,"q9":0}'::jsonb,
   NOW() - '14 days'::interval),

  -- Jennifer: GAD-7 (anxiety about hypoglycaemia)
  (v_p4, 'gad7', 9,
   '{"q1":1,"q2":2,"q3":2,"q4":1,"q5":1,"q6":1,"q7":1}'::jsonb,
   NOW() - '7 days'::interval),

  -- Patricia: PHQ-9 (minimal — well-coping)
  (v_p8, 'phq9', 4,
   '{"q1":1,"q2":0,"q3":1,"q4":1,"q5":0,"q6":0,"q7":1,"q8":0,"q9":0}'::jsonb,
   NOW() - '12 days'::interval),

  -- Risk assessment for high-risk patients
  (v_p2, 'risk', 85,
   '{"copd_exacerbation_risk":"high","hospitalization_30d":0.35,"er_visit_90d":0.55,"overall":"critical"}'::jsonb,
   NOW() - '3 days'::interval),

  (v_p3, 'risk', 72,
   '{"hf_decompensation_risk":"high","hospitalization_30d":0.28,"er_visit_90d":0.42,"overall":"high"}'::jsonb,
   NOW() - '6 days'::interval),

  (v_p6, 'risk', 65,
   '{"ckd_progression_risk":"high","esrd_5yr":0.22,"dialysis_risk":"moderate","overall":"high"}'::jsonb,
   NOW() - '9 days'::interval);

-- ============================================================
-- 16. PROVIDER NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (recipient_id, type, channel, status, payload, sent_at, delivered_at)
VALUES
  (v_provider_id, 'critical_alert', 'in_app', 'delivered',
   '{"patient_name":"Emily Davis","alert_type":"SpO2 Critical","value":90.1,"threshold":92}'::jsonb,
   NOW() - '1 hour'::interval, NOW() - '55 minutes'::interval),

  (v_provider_id, 'critical_alert', 'push', 'delivered',
   '{"patient_name":"Emily Davis","alert_type":"SpO2 Critical","value":90.1,"threshold":92}'::jsonb,
   NOW() - '1 hour'::interval, NOW() - '54 minutes'::interval),

  (v_provider_id, 'urgent_alert', 'in_app', 'delivered',
   '{"patient_name":"Michael Brown","alert_type":"Rapid Weight Gain","value":2.5,"threshold":2,"unit":"kg"}'::jsonb,
   NOW() - '4 days'::interval, NOW() - '4 days'::interval + '5 minutes'::interval),

  (v_provider_id, 'appointment_reminder', 'in_app', 'delivered',
   '{"patient_name":"Emily Davis","appointment_type":"in_person","scheduled_at":"Tomorrow 10:00 AM"}'::jsonb,
   NOW() - '8 hours'::interval, NOW() - '8 hours'::interval + '2 minutes'::interval),

  (v_provider_id, 'appointment_reminder', 'in_app', 'delivered',
   '{"patient_name":"Jennifer Wilson","appointment_type":"telehealth","scheduled_at":"In 5 days 2:00 PM"}'::jsonb,
   NOW() - '2 days'::interval, NOW() - '2 days'::interval + '2 minutes'::interval),

  (v_provider_id, 'message_received', 'in_app', 'delivered',
   '{"sender_name":"James Anderson","preview":"The cold weather this week really set off my asthma..."}'::jsonb,
   NOW() - '2 days'::interval, NOW() - '2 days'::interval + '1 minute'::interval),

  (v_provider_id, 'message_received', 'in_app', 'delivered',
   '{"sender_name":"Patricia Garcia","preview":"I have been finding it hard to stick to the low-carb diet..."}'::jsonb,
   NOW() - '5 days'::interval, NOW() - '5 days'::interval + '1 minute'::interval),

  (v_provider_id, 'warning_alert', 'in_app', 'delivered',
   '{"patient_name":"Patricia Garcia","alert_type":"Blood Glucose High","value":268,"threshold":250}'::jsonb,
   NOW() - '1 day'::interval, NOW() - '1 day'::interval + '3 minutes'::interval),

  (v_provider_id, 'lab_result', 'in_app', 'delivered',
   '{"patient_name":"Lisa Thompson","test":"Serum Creatinine","value":1.9,"unit":"mg/dL","status":"abnormal"}'::jsonb,
   NOW() - '8 days'::interval, NOW() - '8 days'::interval + '10 minutes'::interval),

  (v_provider_id, 'care_plan_due', 'in_app', 'delivered',
   '{"patient_name":"Robert Johnson","care_plan":"Hypertension Control Program","days_until_end":90}'::jsonb,
   NOW() - '3 days'::interval, NOW() - '3 days'::interval + '5 minutes'::interval);

RAISE NOTICE 'Provider seed data inserted successfully.';
RAISE NOTICE '  - 8 new patients added to Dr. Sarah Chen panel';
RAISE NOTICE '  - 8 care plans, 20+ goals, 16 prescriptions';
RAISE NOTICE '  - 200+ vital signs, medication logs';
RAISE NOTICE '  - 15 appointments (7 upcoming), 16 messages';
RAISE NOTICE '  - 8 emergency alerts, 9 assessments, 10 provider notifications';

END $$;



