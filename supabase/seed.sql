-- =============================================================================
-- HealthOS Demo Seed Data
-- Patient:  John Mitchell  (c8e44cb3-6569-488e-a868-218a0a7020e0)
-- Provider: Dr. Sarah Chen (1d2d6233-952f-4a14-8bd7-b49e44370f61)
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Run)
-- =============================================================================

DO $$
DECLARE
  v_patient_id  UUID := 'c8e44cb3-6569-488e-a868-218a0a7020e0';
  v_provider_id UUID := '1d2d6233-952f-4a14-8bd7-b49e44370f61';

  -- fixed UUIDs so we can reference them
  v_plan_id     UUID := 'aaaaaaaa-0001-0000-0000-000000000001';
  v_med1_id     UUID := 'bbbbbbbb-0001-0000-0000-000000000001'; -- Metformin
  v_med2_id     UUID := 'bbbbbbbb-0002-0000-0000-000000000001'; -- Lisinopril
  v_med3_id     UUID := 'bbbbbbbb-0003-0000-0000-000000000001'; -- Atorvastatin
  v_med4_id     UUID := 'bbbbbbbb-0004-0000-0000-000000000001'; -- Aspirin
  v_presc1_id   UUID := 'cccccccc-0001-0000-0000-000000000001';
  v_presc2_id   UUID := 'cccccccc-0002-0000-0000-000000000001';
  v_presc3_id   UUID := 'cccccccc-0003-0000-0000-000000000001';
  v_presc4_id   UUID := 'cccccccc-0004-0000-0000-000000000001';
  v_cond1_id    UUID;
  v_cond2_id    UUID;
  v_cond3_id    UUID;
  v_vital_id    UUID;
  v_apt1_id     UUID;
  v_apt2_id     UUID;
  v_post1_id    UUID;
  v_post2_id    UUID;
  v_post3_id    UUID;
  d             INTEGER;
BEGIN

-- ============================================================
-- 1. PROFILES
-- ============================================================
INSERT INTO profiles (id, role, first_name, last_name, date_of_birth, phone, timezone, avatar_url)
VALUES
  (v_patient_id,  'patient',  'John',    'Mitchell', '1978-05-15', '+1-555-0142', 'America/New_York',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=john'),
  (v_provider_id, 'provider', 'Sarah',   'Chen',     '1975-11-03', '+1-555-0198', 'America/New_York',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah')
ON CONFLICT (id) DO UPDATE SET
  first_name  = EXCLUDED.first_name,
  last_name   = EXCLUDED.last_name,
  date_of_birth = EXCLUDED.date_of_birth,
  phone       = EXCLUDED.phone,
  timezone    = EXCLUDED.timezone;

-- ============================================================
-- 2. PATIENTS & PROVIDERS
-- ============================================================
INSERT INTO patients (profile_id, primary_condition, risk_level, emergency_contact_name, emergency_contact_phone)
VALUES (v_patient_id, 'type2_diabetes', 'medium', 'Linda Mitchell', '+1-555-0143')
ON CONFLICT (profile_id) DO UPDATE SET
  primary_condition = EXCLUDED.primary_condition,
  risk_level        = EXCLUDED.risk_level;

INSERT INTO providers (profile_id, specialty, license_number, department, npi_number)
VALUES (v_provider_id, 'Endocrinology', 'NY-MED-98765', 'Chronic Disease Management', '1234567890')
ON CONFLICT (profile_id) DO UPDATE SET
  specialty    = EXCLUDED.specialty,
  department   = EXCLUDED.department;

-- ============================================================
-- 3. MEDICAL CONDITIONS
-- ============================================================
INSERT INTO medical_conditions (code, name, description, category)
VALUES
  ('E11.9', 'Type 2 Diabetes Mellitus',       'Type 2 diabetes without complications',            'Endocrine'),
  ('I10',   'Essential Hypertension',          'High blood pressure without known cause',          'Cardiovascular'),
  ('E78.5', 'Hyperlipidemia',                  'Elevated cholesterol and triglycerides',           'Metabolic')
ON CONFLICT (code) DO NOTHING;

SELECT id INTO v_cond1_id FROM medical_conditions WHERE code = 'E11.9';
SELECT id INTO v_cond2_id FROM medical_conditions WHERE code = 'I10';
SELECT id INTO v_cond3_id FROM medical_conditions WHERE code = 'E78.5';

INSERT INTO patient_conditions (patient_id, condition_id, diagnosed_at, status, notes)
VALUES
  (v_patient_id, v_cond1_id, CURRENT_DATE - INTERVAL '3 years', 'active',    'Managed with Metformin, diet, and exercise'),
  (v_patient_id, v_cond2_id, CURRENT_DATE - INTERVAL '5 years', 'active',    'Controlled with Lisinopril'),
  (v_patient_id, v_cond3_id, CURRENT_DATE - INTERVAL '2 years', 'active',    'Controlled with Atorvastatin')
ON CONFLICT (patient_id, condition_id) DO NOTHING;

-- ============================================================
-- 4. CARE PLAN + GOALS
-- ============================================================
INSERT INTO care_plans (id, patient_id, provider_id, title, description, status, start_date, end_date)
VALUES (
  v_plan_id,
  v_patient_id,
  v_provider_id,
  'Comprehensive Diabetes & Hypertension Management',
  'Integrated plan targeting glucose control (HbA1c < 7.0%), blood pressure normalization, weight reduction, and cardiovascular risk minimisation through medication adherence, structured exercise, and dietary modification.',
  'active',
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '120 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (care_plan_id, patient_id, title, description, metric, target_value, target_unit, current_value, status, deadline)
VALUES
  (v_plan_id, v_patient_id, 'Reduce HbA1c',          'Target HbA1c below 7.0%',                    'HbA1c',          7.0,  '%',   7.4,  'in_progress', CURRENT_DATE + INTERVAL '90 days'),
  (v_plan_id, v_patient_id, 'Normalise Blood Pressure','Maintain BP below 130/80 mmHg consistently', 'Systolic BP',   130,  'mmHg', 138, 'in_progress', CURRENT_DATE + INTERVAL '60 days'),
  (v_plan_id, v_patient_id, 'Weight Loss',            'Lose 5 kg over 3 months',                    'Body Weight',   82.0, 'kg',   85.4,'in_progress', CURRENT_DATE + INTERVAL '90 days'),
  (v_plan_id, v_patient_id, 'Daily Activity',         'Achieve 30 active minutes per day',          'Active Minutes', 30,  'min',  24,  'in_progress', CURRENT_DATE + INTERVAL '30 days'),
  (v_plan_id, v_patient_id, 'Medication Adherence',   'Take all medications as prescribed (≥ 90%)', 'Adherence',      90,  '%',    87,  'in_progress', CURRENT_DATE + INTERVAL '30 days');

-- ============================================================
-- 5. MEDICATIONS
-- ============================================================
INSERT INTO medications (id, name, generic_name, drug_class, typical_dosage, rxcui)
VALUES
  (v_med1_id, 'Metformin',    'metformin hydrochloride', 'Biguanide',          '500 mg twice daily',  '860975'),
  (v_med2_id, 'Lisinopril',   'lisinopril',              'ACE Inhibitor',       '10 mg once daily',   '29046'),
  (v_med3_id, 'Atorvastatin', 'atorvastatin calcium',   'HMG-CoA Reductase Inhibitor', '20 mg once daily', '617311'),
  (v_med4_id, 'Aspirin',      'acetylsalicylic acid',   'Antiplatelet Agent',  '81 mg once daily',    '1191')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. PRESCRIPTIONS
-- ============================================================
INSERT INTO prescriptions (id, patient_id, medication_id, prescriber_id, dosage, frequency, instructions, start_date, refills_remaining, status)
VALUES
  (v_presc1_id, v_patient_id, v_med1_id, v_provider_id, '500 mg',  'twice_daily', 'Take with morning and evening meals to reduce GI upset', CURRENT_DATE - INTERVAL '60 days', 5, 'active'),
  (v_presc2_id, v_patient_id, v_med2_id, v_provider_id, '10 mg',   'once_daily',  'Take in the morning; monitor potassium levels',           CURRENT_DATE - INTERVAL '90 days', 3, 'active'),
  (v_presc3_id, v_patient_id, v_med3_id, v_provider_id, '20 mg',   'once_daily',  'Take in the evening; avoid grapefruit juice',             CURRENT_DATE - INTERVAL '60 days', 5, 'active'),
  (v_presc4_id, v_patient_id, v_med4_id, v_provider_id, '81 mg',   'once_daily',  'Take with food; cardiovascular prophylaxis',              CURRENT_DATE - INTERVAL '90 days', 11,'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. MEDICATION LOGS — 30 days, ~87% adherence
--    Missed days: presc1 days 4,11,18  presc2 day 22  presc3 days 7,14  presc4 day 28
-- ============================================================
-- Presc1 (Metformin AM) — missed days 4, 11, 18
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT
  v_presc1_id,
  v_patient_id,
  CASE WHEN d = ANY(ARRAY[4,11,18]) THEN 'missed' ELSE 'taken' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '8 hours',
  CASE WHEN d = ANY(ARRAY[4,11,18]) THEN NULL
       ELSE (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '8 hours' + (FLOOR(RANDOM()*20)+1) * INTERVAL '1 minute'
  END
FROM generate_series(1,30) AS d
ON CONFLICT DO NOTHING;

-- Presc1 (Metformin PM) — missed days 4, 11, 18
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT
  v_presc1_id,
  v_patient_id,
  CASE WHEN d = ANY(ARRAY[4,11,18]) THEN 'missed' ELSE 'taken' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '19 hours',
  CASE WHEN d = ANY(ARRAY[4,11,18]) THEN NULL
       ELSE (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '19 hours' + (FLOOR(RANDOM()*20)+1) * INTERVAL '1 minute'
  END
FROM generate_series(1,30) AS d
ON CONFLICT DO NOTHING;

-- Presc2 (Lisinopril) — missed day 22
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT
  v_presc2_id,
  v_patient_id,
  CASE WHEN d = 22 THEN 'missed' ELSE 'taken' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '8 hours',
  CASE WHEN d = 22 THEN NULL
       ELSE (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '8 hours' + (FLOOR(RANDOM()*15)+1) * INTERVAL '1 minute'
  END
FROM generate_series(1,30) AS d
ON CONFLICT DO NOTHING;

-- Presc3 (Atorvastatin) — missed days 7, 14
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT
  v_presc3_id,
  v_patient_id,
  CASE WHEN d = ANY(ARRAY[7,14]) THEN 'missed' ELSE 'taken' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '21 hours',
  CASE WHEN d = ANY(ARRAY[7,14]) THEN NULL
       ELSE (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '21 hours' + (FLOOR(RANDOM()*20)+1) * INTERVAL '1 minute'
  END
FROM generate_series(1,30) AS d
ON CONFLICT DO NOTHING;

-- Presc4 (Aspirin) — missed day 28
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT
  v_presc4_id,
  v_patient_id,
  CASE WHEN d = 28 THEN 'missed' ELSE 'taken' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '8 hours',
  CASE WHEN d = 28 THEN NULL
       ELSE (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '8 hours' + (FLOOR(RANDOM()*15)+1) * INTERVAL '1 minute'
  END
FROM generate_series(1,30) AS d
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. VITAL SIGNS — 30 days of readings (improving trends)
-- ============================================================

-- Blood glucose (fasting AM) — 168 → 114 mg/dL improvement
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'blood_glucose',
  ROUND((168 - (d - 1) * 1.8 + (RANDOM() * 10 - 5))::NUMERIC, 1),
  'mg/dL',
  CASE WHEN d % 5 = 0 THEN 'device' ELSE 'manual' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '7 hours'
FROM generate_series(1,30) AS d;

-- Blood glucose (post-dinner) — higher values
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'blood_glucose',
  ROUND((195 - (d - 1) * 2.1 + (RANDOM() * 14 - 7))::NUMERIC, 1),
  'mg/dL',
  'manual',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '20 hours'
FROM generate_series(1,30) AS d;

-- Systolic BP — 148 → 130 mmHg
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'blood_pressure_systolic',
  ROUND((148 - (d - 1) * 0.6 + (RANDOM() * 6 - 3))::NUMERIC, 0),
  'mmHg',
  'manual',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '9 hours'
FROM generate_series(1,30) AS d;

-- Diastolic BP — 94 → 79 mmHg
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'blood_pressure_diastolic',
  ROUND((94 - (d - 1) * 0.5 + (RANDOM() * 4 - 2))::NUMERIC, 0),
  'mmHg',
  'manual',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '9 hours'
FROM generate_series(1,30) AS d;

-- Heart rate — stable 78 → 72 bpm
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'heart_rate',
  ROUND((78 - (d - 1) * 0.2 + (RANDOM() * 6 - 3))::NUMERIC, 0),
  'bpm',
  CASE WHEN d % 3 = 0 THEN 'device' ELSE 'manual' END,
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '9 hours'
FROM generate_series(1,30) AS d;

-- Oxygen saturation — stable 97-99%
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'oxygen_saturation',
  ROUND((97.5 + RANDOM() * 1.5)::NUMERIC, 1),
  '%',
  'device',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '9 hours'
FROM generate_series(1,30) AS d;

-- Weight — 87.2 → 85.4 kg
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'weight',
  ROUND((87.2 - (d - 1) * 0.06 + (RANDOM() * 0.4 - 0.2))::NUMERIC, 1),
  'kg',
  'manual',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '7 hours 30 minutes'
FROM generate_series(1,30) AS d;

-- Steps — 4000–8500/day with upward trend
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'steps',
  ROUND((4200 + (d - 1) * 140 + (RANDOM() * 800 - 400))::NUMERIC, 0),
  'steps',
  'device',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '23 hours'
FROM generate_series(1,30) AS d;

-- Active minutes — 12 → 34 min/day
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT
  v_patient_id,
  'active_minutes',
  ROUND((12 + (d - 1) * 0.73 + (RANDOM() * 6 - 3))::NUMERIC, 0),
  'min',
  'device',
  (CURRENT_DATE - ((30 - d) * INTERVAL '1 day'))::TIMESTAMPTZ + INTERVAL '23 hours'
FROM generate_series(1,30) AS d;

-- Pick one vital id for emergency alert
SELECT id INTO v_vital_id FROM vital_signs
WHERE patient_id = v_patient_id AND type = 'blood_glucose'
ORDER BY recorded_at ASC LIMIT 1;

-- ============================================================
-- 9. SYMPTOMS — 9 entries over 30 days
-- ============================================================
INSERT INTO symptoms (patient_id, symptom, severity, notes, logged_at)
VALUES
  (v_patient_id, 'Fatigue',           7, 'Heavy fatigue after lunch, hard to concentrate',           NOW() - INTERVAL '28 days'),
  (v_patient_id, 'Increased Thirst',  6, 'Drinking more than usual, possible hyperglycaemia',       NOW() - INTERVAL '25 days'),
  (v_patient_id, 'Headache',          5, 'Mild throbbing headache, likely blood pressure related',   NOW() - INTERVAL '21 days'),
  (v_patient_id, 'Blurred Vision',    4, 'Brief episode in the morning, resolved after 20 min',     NOW() - INTERVAL '18 days'),
  (v_patient_id, 'Fatigue',           5, 'Moderate afternoon fatigue, slept poorly night before',   NOW() - INTERVAL '14 days'),
  (v_patient_id, 'Nausea',            3, 'Mild nausea shortly after taking Metformin with breakfast',NOW() - INTERVAL '10 days'),
  (v_patient_id, 'Headache',          3, 'Mild headache in the afternoon, resolved with rest',       NOW() - INTERVAL '7 days'),
  (v_patient_id, 'Fatigue',           4, 'Tired after long walk, possibly over-exerted',            NOW() - INTERVAL '3 days'),
  (v_patient_id, 'Dizziness',         2, 'Brief lightheadedness when standing up quickly',          NOW() - INTERVAL '1 day');

-- ============================================================
-- 10. FOOD LOGS — 20 entries (7 days)
-- ============================================================
INSERT INTO food_logs (patient_id, meal_type, description, calories, protein_g, carbs_g, fat_g, fiber_g, logged_at)
VALUES
  -- Day -6
  (v_patient_id,'breakfast','Greek yogurt with walnuts and blueberries',        310,  22, 30,  12, 3,  NOW()-INTERVAL '6 days'+INTERVAL '8h'),
  (v_patient_id,'lunch',    'Whole-grain turkey wrap with avocado',             480,  32, 45,  18, 7,  NOW()-INTERVAL '6 days'+INTERVAL '13h'),
  (v_patient_id,'dinner',   'Grilled salmon, roasted broccoli, brown rice',     560,  42, 48,  16, 8,  NOW()-INTERVAL '6 days'+INTERVAL '19h'),
  -- Day -5
  (v_patient_id,'breakfast','Oatmeal with cinnamon, apple slices, skim milk',   350,  14, 58,   6, 6,  NOW()-INTERVAL '5 days'+INTERVAL '8h'),
  (v_patient_id,'lunch',    'Grilled chicken salad with olive oil dressing',    420,  38, 18,  18, 5,  NOW()-INTERVAL '5 days'+INTERVAL '13h'),
  (v_patient_id,'dinner',   'Lentil soup with whole-grain bread',               490,  28, 72,   8, 18, NOW()-INTERVAL '5 days'+INTERVAL '19h'),
  (v_patient_id,'snack',    'Celery sticks with hummus',                        110,   5, 14,   5, 4,  NOW()-INTERVAL '5 days'+INTERVAL '16h'),
  -- Day -4
  (v_patient_id,'breakfast','Scrambled eggs (3) with spinach and tomato',       310,  24, 10,  18, 3,  NOW()-INTERVAL '4 days'+INTERVAL '8h'),
  (v_patient_id,'lunch',    'Quinoa bowl with roasted vegetables',              460,  18, 68,  12, 9,  NOW()-INTERVAL '4 days'+INTERVAL '13h'),
  (v_patient_id,'dinner',   'Baked chicken thigh, sweet potato, green beans',   510,  38, 52,  14, 7,  NOW()-INTERVAL '4 days'+INTERVAL '19h'),
  -- Day -3
  (v_patient_id,'breakfast','Whole-wheat toast with almond butter and banana',  380,  12, 54,  14, 6,  NOW()-INTERVAL '3 days'+INTERVAL '8h'),
  (v_patient_id,'lunch',    'Tuna salad on mixed greens, no croutons',          390,  36, 12,  18, 4,  NOW()-INTERVAL '3 days'+INTERVAL '13h'),
  (v_patient_id,'dinner',   'Turkey meatballs with zucchini noodles',           440,  38, 22,  16, 4,  NOW()-INTERVAL '3 days'+INTERVAL '19h'),
  (v_patient_id,'snack',    'Apple with 1 oz low-fat cheese',                   130,   7, 18,   4, 3,  NOW()-INTERVAL '3 days'+INTERVAL '16h'),
  -- Day -2
  (v_patient_id,'breakfast','Berry smoothie: almond milk, spinach, mixed berries',270, 10, 38, 8, 6,  NOW()-INTERVAL '2 days'+INTERVAL '8h'),
  (v_patient_id,'lunch',    'Black bean and vegetable stir-fry with tofu',      430,  24, 58,  10, 14, NOW()-INTERVAL '2 days'+INTERVAL '13h'),
  (v_patient_id,'dinner',   'Baked cod, asparagus, quinoa',                     490,  44, 40,  10, 8,  NOW()-INTERVAL '2 days'+INTERVAL '19h'),
  -- Day -1
  (v_patient_id,'breakfast','Overnight oats with chia seeds and strawberries',  340,  14, 52,   8, 9,  NOW()-INTERVAL '1 day' +INTERVAL '8h'),
  (v_patient_id,'lunch',    'Grilled vegetable and feta wrap',                  410,  16, 52,  14, 6,  NOW()-INTERVAL '1 day' +INTERVAL '13h'),
  (v_patient_id,'dinner',   'Shrimp stir-fry with bok choy and brown rice',     520,  38, 56,  12, 6,  NOW()-INTERVAL '1 day' +INTERVAL '19h');

-- ============================================================
-- 11. EXERCISE LOGS — 14 entries over 30 days
-- ============================================================
INSERT INTO exercise_logs (patient_id, activity_type, duration_minutes, calories, distance_km, notes, source, logged_at)
VALUES
  (v_patient_id,'walking',  25, 115, 2.1, 'Morning neighbourhood walk',                         'manual', NOW()-INTERVAL '28 days'),
  (v_patient_id,'cycling',  30, 210, 8.4, 'Stationary bike at home',                            'manual', NOW()-INTERVAL '26 days'),
  (v_patient_id,'walking',  20,  90, 1.7, 'Lunchtime walk around the office block',             'manual', NOW()-INTERVAL '24 days'),
  (v_patient_id,'swimming', 35, 280, NULL,'Community pool — 20 laps freestyle',                  'manual', NOW()-INTERVAL '22 days'),
  (v_patient_id,'walking',  30, 138, 2.5, 'Evening walk with dog',                              'device', NOW()-INTERVAL '20 days'),
  (v_patient_id,'yoga',     45, 160, NULL,'Beginner yoga class online — improved flexibility',   'manual', NOW()-INTERVAL '18 days'),
  (v_patient_id,'walking',  35, 161, 3.0, 'Longer morning walk — felt great',                   'device', NOW()-INTERVAL '16 days'),
  (v_patient_id,'cycling',  40, 290, 11.2,'Outdoor cycling on the greenway',                    'manual', NOW()-INTERVAL '14 days'),
  (v_patient_id,'walking',  30, 138, 2.6, 'Post-dinner evening stroll',                         'device', NOW()-INTERVAL '12 days'),
  (v_patient_id,'strength', 45, 240, NULL,'Light resistance training — upper body focus',        'manual', NOW()-INTERVAL '10 days'),
  (v_patient_id,'walking',  40, 184, 3.4, 'Extended morning walk — personal best distance',     'device', NOW()-INTERVAL '7 days'),
  (v_patient_id,'yoga',     50, 175, NULL,'Intermediate yoga — improved balance and breathing',  'manual', NOW()-INTERVAL '5 days'),
  (v_patient_id,'cycling',  35, 255, 9.8, 'Stationary bike interval session',                   'manual', NOW()-INTERVAL '3 days'),
  (v_patient_id,'walking',  45, 207, 3.9, 'Long park walk — listened to health podcast',        'device', NOW()-INTERVAL '1 day');

-- ============================================================
-- 12. ASSESSMENTS — PHQ-9 and GAD-7 (showing improvement)
-- ============================================================
INSERT INTO assessments (patient_id, type, score, responses, completed_at)
VALUES
  -- PHQ-9 initial (score 8 = mild depression)
  (v_patient_id, 'phq9', 8,
   '{"q1":1,"q2":2,"q3":1,"q4":1,"q5":1,"q6":1,"q7":0,"q8":1,"q9":0}',
   NOW() - INTERVAL '28 days'),
  -- GAD-7 initial (score 7 = mild anxiety)
  (v_patient_id, 'gad7', 7,
   '{"q1":1,"q2":2,"q3":1,"q4":1,"q5":1,"q6":1,"q7":0}',
   NOW() - INTERVAL '28 days'),
  -- PHQ-9 follow-up (score 6 = mild, improving)
  (v_patient_id, 'phq9', 6,
   '{"q1":1,"q2":1,"q3":1,"q4":1,"q5":1,"q6":0,"q7":0,"q8":1,"q9":0}',
   NOW() - INTERVAL '7 days'),
  -- GAD-7 follow-up (score 5 = mild, improving)
  (v_patient_id, 'gad7', 5,
   '{"q1":1,"q2":1,"q3":1,"q4":1,"q5":0,"q6":1,"q7":0}',
   NOW() - INTERVAL '7 days');

-- ============================================================
-- 13. APPOINTMENTS
-- ============================================================
INSERT INTO appointments (id, patient_id, provider_id, appointment_type, status, scheduled_at, duration_minutes, notes, meeting_url)
VALUES
  ('dddddddd-0001-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'telehealth', 'completed',
   NOW() - INTERVAL '21 days', 30,
   'Quarterly diabetes review. HbA1c 7.8 → 7.4. Medication adjusted. Goal: further reduction over 90 days.',
   'https://meet.healthos.app/room/completed-21d'),
  ('dddddddd-0002-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'in_person', 'completed',
   NOW() - INTERVAL '7 days',  45,
   'Blood pressure check and medication review. BP improved 148/94 → 132/82. Continue current plan.',
   NULL),
  ('dddddddd-0003-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'telehealth', 'scheduled',
   NOW() + INTERVAL '7 days',  30,
   'Follow-up telehealth: glucose trends and exercise progress review.',
   'https://meet.healthos.app/room/upcoming-7d'),
  ('dddddddd-0004-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'in_person', 'scheduled',
   NOW() + INTERVAL '30 days', 60,
   'Comprehensive 3-month review: labs, full physical, care plan update.',
   NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 14. MESSAGES
-- ============================================================
INSERT INTO messages (sender_id, recipient_id, subject, content, status, sent_at)
VALUES
  (v_provider_id, v_patient_id,
   'Your Latest Lab Results',
   'Hi John, your HbA1c is down to 7.4% — great progress! Your fasting glucose trend is also improving. Keep up the consistent medication schedule and let''s aim for 7.0% at your next check. Dr. Chen',
   'read', NOW() - INTERVAL '20 days'),
  (v_patient_id, v_provider_id,
   'RE: Your Latest Lab Results',
   'Thank you Dr. Chen! I have been really sticking to the diet plan and trying to walk every day. Is it okay to do some light cycling too? — John',
   'read', NOW() - INTERVAL '19 days'),
  (v_provider_id, v_patient_id,
   'RE: RE: Your Latest Lab Results',
   'Absolutely, John! Cycling is excellent for blood sugar management. Start with 20–30 minute sessions and listen to your body. Document it in the exercise log and we can review at your next visit. Dr. Chen',
   'read', NOW() - INTERVAL '19 days'),
  (v_patient_id, v_provider_id,
   'Metformin Side Effect Question',
   'Hi Dr. Chen, I have been experiencing some mild nausea about 30 minutes after taking Metformin in the mornings. Should I be concerned? — John',
   'read', NOW() - INTERVAL '10 days'),
  (v_provider_id, v_patient_id,
   'RE: Metformin Side Effect Question',
   'Hi John, mild nausea with Metformin is very common, especially in the first few weeks. Try taking it with a larger meal rather than just a light breakfast. If it persists beyond 2 more weeks, we can consider the extended-release formulation. Dr. Chen',
   'read', NOW() - INTERVAL '9 days'),
  (v_patient_id, v_provider_id,
   'Upcoming Appointment Confirmation',
   'Hi Dr. Chen, confirming I will be at the telehealth call next week. I have logged all my readings and have a few questions about the goal targets. — John',
   'sent', NOW() - INTERVAL '1 day');

-- ============================================================
-- 15. EMERGENCY ALERTS
-- ============================================================
INSERT INTO emergency_alerts (patient_id, vital_sign_id, severity, status, trigger_type, trigger_value, threshold_value, message, created_at, resolved_at)
VALUES
  (v_patient_id, v_vital_id, 'warning', 'resolved',
   'blood_glucose', 252, 200,
   'Fasting blood glucose of 252 mg/dL detected — significantly above target range of 80–130 mg/dL. Consider reviewing yesterday''s dietary intake.',
   NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days'),
  (v_patient_id, v_vital_id, 'critical', 'resolved',
   'blood_pressure_systolic', 168, 150,
   'Systolic blood pressure of 168 mmHg detected. Patient contacted; advised rest and monitoring. Resolved following medication.',
   NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
  (v_patient_id, v_vital_id, 'warning', 'open',
   'blood_glucose', 188, 180,
   'Post-dinner blood glucose of 188 mg/dL exceeds recommended post-meal threshold of 180 mg/dL.',
   NOW() - INTERVAL '2 days', NULL);

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (recipient_id, type, channel, status, payload, scheduled_at, sent_at)
VALUES
  (v_patient_id, 'medication_reminder', 'in_app', 'delivered',
   '{"title":"Time for Metformin","message":"Take your morning Metformin 500 mg with breakfast","prescription_id":"cccccccc-0001-0000-0000-000000000001"}',
   NOW() - INTERVAL '1 day' + INTERVAL '8h', NOW() - INTERVAL '1 day' + INTERVAL '8h'),
  (v_patient_id, 'medication_reminder', 'in_app', 'delivered',
   '{"title":"Time for Lisinopril","message":"Take your morning Lisinopril 10 mg","prescription_id":"cccccccc-0002-0000-0000-000000000001"}',
   NOW() - INTERVAL '1 day' + INTERVAL '8h', NOW() - INTERVAL '1 day' + INTERVAL '8h'),
  (v_patient_id, 'appointment_reminder', 'in_app', 'delivered',
   '{"title":"Upcoming Telehealth Appointment","message":"You have a telehealth visit with Dr. Chen in 7 days","appointment_id":"dddddddd-0003-0000-0000-000000000001"}',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (v_patient_id, 'health_alert', 'in_app', 'delivered',
   '{"title":"Elevated Glucose Alert","message":"Your post-dinner glucose of 188 mg/dL is above your target. Consider a short walk after dinner."}',
   NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (v_patient_id, 'goal_update', 'in_app', 'delivered',
   '{"title":"Great Progress!","message":"You have reached 28 active minutes today — almost at your 30-minute goal!"}',
   NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (v_patient_id, 'medication_reminder', 'in_app', 'queued',
   '{"title":"Time for Evening Metformin","message":"Take your evening Metformin 500 mg with dinner","prescription_id":"cccccccc-0001-0000-0000-000000000001"}',
   NOW() + INTERVAL '2h', NULL),
  (v_patient_id, 'appointment_reminder', 'email', 'queued',
   '{"title":"Appointment Reminder: Dr. Chen in 7 days","message":"Telehealth appointment on ' || (CURRENT_DATE + INTERVAL '7 days')::TEXT || ' at 10:00 AM"}',
   NOW() + INTERVAL '6h', NULL),
  (v_patient_id, 'health_tip', 'in_app', 'queued',
   '{"title":"Daily Health Tip","message":"Drinking water before meals can help with blood sugar control and portion management."}',
   NOW() + INTERVAL '12h', NULL);

-- ============================================================
-- 17. INSURANCE PLAN
-- ============================================================
INSERT INTO insurance_plans (patient_id, provider_name, plan_name, plan_type, member_id_encrypted, group_number, effective_date, expiry_date)
VALUES (
  v_patient_id,
  'BlueCross BlueShield',
  'Gold PPO 1500',
  'PPO',
  'BCBS-ENCRYPTED-MBR-45822',
  'GRP-78654',
  CURRENT_DATE - INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '11 months'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 18. DEVICE INTEGRATIONS
-- ============================================================
INSERT INTO device_integrations (patient_id, device_type, vendor, model, status, last_sync_at)
VALUES
  (v_patient_id, 'Continuous Glucose Monitor', 'Dexcom',  'G7',           'connected',    NOW() - INTERVAL '2 hours'),
  (v_patient_id, 'Blood Pressure Monitor',     'Omron',   'Evolv BP7000', 'connected',    NOW() - INTERVAL '1 day'),
  (v_patient_id, 'Fitness Tracker',            'Fitbit',  'Charge 6',     'connected',    NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 19. COACH CONVERSATIONS
-- ============================================================
INSERT INTO coach_conversations (patient_id, messages, metadata)
VALUES (
  v_patient_id,
  '[
    {"role":"user","content":"My blood sugar was 188 after dinner last night. Is that too high?"},
    {"role":"assistant","content":"A post-meal glucose of 188 mg/dL is above the recommended target of under 180 mg/dL for someone with Type 2 diabetes. This is a common occurrence after carbohydrate-rich meals. A few strategies that may help: (1) a 10–15 minute walk after eating can significantly reduce post-meal spikes, (2) try spreading carbohydrates more evenly across the meal, and (3) consider which foods caused the spike — refined carbs and sugary drinks tend to be the biggest contributors. Would you like me to help you review your dinner log to identify potential culprits?"},
    {"role":"user","content":"I had pasta for dinner. Should I avoid it completely?"},
    {"role":"assistant","content":"You don''t need to eliminate pasta completely! The key is portion control and type of pasta. Whole-grain or legume-based pasta has a lower glycaemic index than regular white pasta. Aim for a half-cup cooked serving (about the size of a tennis ball) and pair it with plenty of non-starchy vegetables and lean protein — this slows digestion and reduces the glucose spike. Cooking pasta ''al dente'' (slightly firm) also lowers its glycaemic impact. Try these changes and log your next pasta meal — let''s see how your glucose responds!"},
    {"role":"user","content":"That makes sense. What about exercise — how soon should I walk after eating?"},
    {"role":"assistant","content":"Research shows that walking 15–30 minutes after a meal is ideal for blood sugar management. Your muscles use glucose for fuel during activity, which directly helps lower post-meal spikes. Even a gentle 10-minute stroll can make a meaningful difference. If walking isn''t possible, other light activities like standing, stretching, or light household tasks also help. Based on your exercise logs, you''re already building a great activity habit — keep it up!"}
  ]'::JSONB,
  '{"topic":"glucose_management","session_count":1,"last_topic":"post_meal_glucose"}'
);

-- ============================================================
-- 20. CAREGIVERS (if table exists)
-- ============================================================
INSERT INTO caregivers (patient_id, caregiver_name, caregiver_email, relationship, status, permissions, invited_at, accepted_at)
VALUES
  (v_patient_id, 'Linda Mitchell', 'linda.mitchell@email.com', 'spouse',  'active',
   '{"view_vitals":true,"view_medications":true,"view_appointments":true,"receive_alerts":true}',
   NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days'),
  (v_patient_id, 'Robert Mitchell','rob.mitchell@email.com',   'sibling', 'pending',
   '{"view_vitals":true,"view_medications":false,"view_appointments":false,"receive_alerts":true}',
   NOW() - INTERVAL '2 days',  NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 21. COMMUNITY POSTS & REPLIES (if tables exist)
-- ============================================================
INSERT INTO community_posts (id, author_id, title, content, category, tags, like_count)
VALUES
  ('eeeeeeee-0001-0000-0000-000000000001'::UUID,
   v_patient_id,
   'Finally hit 30 active minutes every day this week!',
   'Hi everyone! After months of struggling with consistency I finally managed a full week of at least 30 active minutes per day. Mostly walking and a couple of cycling sessions. My fasting glucose this morning was 118 — the lowest it has been in over a year. Small wins! Anyone else finding that consistency with exercise matters more than intensity?',
   'exercise', ARRAY['exercise','glucose','motivation','milestone'], 14),
  ('eeeeeeee-0002-0000-0000-000000000001'::UUID,
   v_patient_id,
   'Tips for managing Metformin nausea in the first weeks?',
   'I started Metformin about 3 weeks ago and still getting morning nausea about 30 minutes after taking it. My doctor said it''s normal but I''m wondering if others have tips to manage it. I''m taking it with breakfast but maybe my breakfast is too light?',
   'medications', ARRAY['metformin','side-effects','tips','diabetes'], 8),
  ('eeeeeeee-0003-0000-0000-000000000001'::UUID,
   v_patient_id,
   'Reading recommendations for understanding Type 2 Diabetes better?',
   'I was diagnosed 3 years ago but feel like I still have gaps in my understanding of what''s actually happening in my body. Can anyone recommend books, podcasts, or reliable websites that explain diabetes in plain English? I learn better when I understand the "why" behind my treatment.',
   'education', ARRAY['education','type2-diabetes','resources','learning'], 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_replies (post_id, author_id, content)
VALUES
  ('eeeeeeee-0001-0000-0000-000000000001'::UUID,
   v_provider_id,
   'Fantastic milestone, John! Consistency absolutely is more important than intensity, especially for blood sugar management. Regular moderate activity sensitises your cells to insulin far more effectively than occasional intense sessions. Keep logging — we can review these numbers at your next appointment!'),
  ('eeeeeeee-0002-0000-0000-000000000001'::UUID,
   v_provider_id,
   'Great question. Metformin nausea is very common and usually resolves within 4–6 weeks. Taking it with a larger, carbohydrate-containing meal helps significantly. The extended-release (XR) version also tends to cause much less nausea if it persists — worth discussing with your prescriber.'),
  ('eeeeeeee-0003-0000-0000-000000000001'::UUID,
   v_provider_id,
   'For plain-language diabetes education, I recommend "The Diabetes Code" by Dr. Jason Fung (focus on the lifestyle sections), the American Diabetes Association website (diabetes.org), and the "Mastering Diabetes" podcast. Also, explore the Education section in this app — we have curated articles specifically for your condition.')
ON CONFLICT DO NOTHING;

END $$;
