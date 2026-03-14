-- =============================================================================
-- HealthOS — Additional Seed Data (schema-accurate)
-- Patient:  John Mitchell  (c8e44cb3-6569-488e-a868-218a0a7020e0)
-- Provider: Dr. Sarah Chen (1d2d6233-952f-4a14-8bd7-b49e44370f61)
-- =============================================================================

DO $$
DECLARE
  v_patient_id  UUID := 'c8e44cb3-6569-488e-a868-218a0a7020e0';
  v_provider_id UUID := '1d2d6233-952f-4a14-8bd7-b49e44370f61';

  v_plan_id   UUID := 'aaaaaaaa-0001-0000-0000-000000000001';

  -- medication IDs (looked up by rxcui)
  v_med1_id   UUID;  -- Metformin
  v_med2_id   UUID;  -- Lisinopril
  v_med3_id   UUID := 'bbbbbbbb-0003-0000-0000-000000000001'; -- Atorvastatin (new, fixed)
  v_med4_id   UUID := 'bbbbbbbb-0004-0000-0000-000000000001'; -- Aspirin (new, fixed)

  -- prescription IDs (presc1+2 looked up, presc3+4 fixed new)
  v_presc1_id UUID;
  v_presc2_id UUID;
  v_presc3_id UUID := 'cccccccc-0003-0000-0000-000000000001';
  v_presc4_id UUID := 'cccccccc-0004-0000-0000-000000000001';

  v_cond3_id  UUID;
  v_vital_id  UUID;
BEGIN

-- ============================================================
-- 1. UPDATE PROFILES
-- ============================================================
UPDATE profiles SET
  first_name    = 'John',
  last_name     = 'Mitchell',
  date_of_birth = '1978-05-15',
  phone         = '+1-555-0142',
  timezone      = 'America/New_York',
  avatar_url    = 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
WHERE id = v_patient_id;

UPDATE profiles SET
  first_name    = 'Sarah',
  last_name     = 'Chen',
  date_of_birth = '1975-11-03',
  phone         = '+1-555-0198',
  timezone      = 'America/New_York',
  avatar_url    = 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
WHERE id = v_provider_id;

-- ============================================================
-- 2. UPDATE PATIENTS & PROVIDERS
-- ============================================================
UPDATE patients SET
  primary_condition = 'type2_diabetes',
  risk_level        = 'medium',
  notes             = 'Emergency contact: Linda Mitchell +1-555-0143 (spouse)'
WHERE profile_id = v_patient_id;

UPDATE providers SET
  specialty      = 'Endocrinology',
  license_number = 'NY-MED-98765',
  npi_number     = '1234567890',
  department     = 'Chronic Disease Management'
WHERE profile_id = v_provider_id;

-- ============================================================
-- 3. NEW CONDITION — Hyperlipidemia
-- ============================================================
INSERT INTO medical_conditions (code, name, description, category)
VALUES ('E78.5', 'Hyperlipidemia', 'Elevated cholesterol and triglycerides', 'Metabolic')
ON CONFLICT (code) DO NOTHING;

SELECT id INTO v_cond3_id FROM medical_conditions WHERE code = 'E78.5';

INSERT INTO patient_conditions (patient_id, condition_id, diagnosed_at, status, notes)
VALUES (v_patient_id, v_cond3_id, CURRENT_DATE - INTERVAL '2 years', 'active', 'Controlled with Atorvastatin')
ON CONFLICT (patient_id, condition_id) DO NOTHING;

-- ============================================================
-- 4. UPGRADE CARE PLAN
-- ============================================================
DELETE FROM goals      WHERE patient_id = v_patient_id;
DELETE FROM care_plans WHERE patient_id = v_patient_id;

INSERT INTO care_plans (id, patient_id, provider_id, title, description, is_active, start_date, end_date)
VALUES (
  v_plan_id, v_patient_id, v_provider_id,
  'Comprehensive Diabetes & Hypertension Management',
  'Integrated plan targeting glucose control (HbA1c < 7.0%), blood pressure normalisation, weight reduction, and cardiovascular risk minimisation.',
  TRUE,
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '120 days'
);

INSERT INTO goals (care_plan_id, patient_id, title, description, metric, target_value, target_unit, status, deadline)
VALUES
  (v_plan_id, v_patient_id, 'Reduce HbA1c',            'Target HbA1c below 7.0%',                    'HbA1c',          7.0,  '%',   'active', CURRENT_DATE + INTERVAL '90 days'),
  (v_plan_id, v_patient_id, 'Normalise Blood Pressure', 'Maintain BP below 130/80 mmHg consistently', 'Systolic BP',    130,  'mmHg','active', CURRENT_DATE + INTERVAL '60 days'),
  (v_plan_id, v_patient_id, 'Weight Loss',              'Lose 5 kg over 3 months',                    'Body Weight',    82.0, 'kg',  'active', CURRENT_DATE + INTERVAL '90 days'),
  (v_plan_id, v_patient_id, 'Daily Activity',           'Achieve 30 active minutes per day',          'Active Minutes', 30,   'min', 'active', CURRENT_DATE + INTERVAL '30 days'),
  (v_plan_id, v_patient_id, 'Medication Adherence',     'Take all medications as prescribed (>= 90%)','Adherence',      90,   '%',   'active', CURRENT_DATE + INTERVAL '30 days');

-- ============================================================
-- 5. NEW MEDICATIONS — Atorvastatin & Aspirin
-- ============================================================
INSERT INTO medications (id, name, generic_name, drug_class, typical_dosage, rxcui)
VALUES
  (v_med3_id, 'Atorvastatin', 'atorvastatin calcium', 'HMG-CoA Reductase Inhibitor', '20 mg once daily', '617311'),
  (v_med4_id, 'Aspirin',      'acetylsalicylic acid', 'Antiplatelet Agent',           '81 mg once daily', '1191')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. PRESCRIPTIONS
--    Look up existing Metformin & Lisinopril prescription IDs.
--    Insert new Atorvastatin & Aspirin prescriptions with fixed IDs.
-- ============================================================

-- Look up existing medication IDs
SELECT id INTO v_med1_id FROM medications WHERE rxcui = '860975' LIMIT 1;
SELECT id INTO v_med2_id FROM medications WHERE rxcui = '29046'  LIMIT 1;

-- Look up existing prescription IDs (created by original seed.sql)
SELECT id INTO v_presc1_id FROM prescriptions
  WHERE patient_id = v_patient_id AND medication_id = v_med1_id
  ORDER BY created_at ASC LIMIT 1;

SELECT id INTO v_presc2_id FROM prescriptions
  WHERE patient_id = v_patient_id AND medication_id = v_med2_id
  ORDER BY created_at ASC LIMIT 1;

-- Insert new prescriptions (with fixed IDs so we can reference them)
INSERT INTO prescriptions (id, patient_id, medication_id, prescriber_id, dosage, frequency, instructions, start_date, refills_remaining, is_active)
VALUES
  (v_presc3_id, v_patient_id, v_med3_id, v_provider_id, '20 mg', 'once_daily', 'Take in the evening; avoid grapefruit juice', CURRENT_DATE - INTERVAL '60 days', 5,  TRUE),
  (v_presc4_id, v_patient_id, v_med4_id, v_provider_id, '81 mg', 'once_daily', 'Take with food; cardiovascular prophylaxis',  CURRENT_DATE - INTERVAL '90 days', 11, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 7. FULL 30-DAY MEDICATION LOGS
--    Delete old logs first, then bulk-insert 30 days for all 4 prescriptions.
-- ============================================================
DELETE FROM medication_logs WHERE patient_id = v_patient_id;

-- Metformin AM (missed days 4, 11, 18)
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_presc1_id, v_patient_id,
  CASE WHEN gs = ANY(ARRAY[4,11,18]) THEN 'missed'::medication_log_status ELSE 'taken'::medication_log_status END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'8 hours',
  CASE WHEN gs = ANY(ARRAY[4,11,18]) THEN NULL
       ELSE (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'8 hours' + (FLOOR(RANDOM()*20)+1)*INTERVAL'1 minute' END
FROM generate_series(1,30) AS gs
WHERE v_presc1_id IS NOT NULL;

-- Metformin PM (missed days 4, 11, 18)
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_presc1_id, v_patient_id,
  CASE WHEN gs = ANY(ARRAY[4,11,18]) THEN 'missed'::medication_log_status ELSE 'taken'::medication_log_status END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'19 hours',
  CASE WHEN gs = ANY(ARRAY[4,11,18]) THEN NULL
       ELSE (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'19 hours' + (FLOOR(RANDOM()*20)+1)*INTERVAL'1 minute' END
FROM generate_series(1,30) AS gs
WHERE v_presc1_id IS NOT NULL;

-- Lisinopril (missed day 22)
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_presc2_id, v_patient_id,
  CASE WHEN gs = 22 THEN 'missed'::medication_log_status ELSE 'taken'::medication_log_status END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'8 hours',
  CASE WHEN gs = 22 THEN NULL
       ELSE (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'8 hours' + (FLOOR(RANDOM()*15)+1)*INTERVAL'1 minute' END
FROM generate_series(1,30) AS gs
WHERE v_presc2_id IS NOT NULL;

-- Atorvastatin (missed days 7, 14)
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_presc3_id, v_patient_id,
  CASE WHEN gs = ANY(ARRAY[7,14]) THEN 'missed'::medication_log_status ELSE 'taken'::medication_log_status END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'21 hours',
  CASE WHEN gs = ANY(ARRAY[7,14]) THEN NULL
       ELSE (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'21 hours' + (FLOOR(RANDOM()*20)+1)*INTERVAL'1 minute' END
FROM generate_series(1,30) AS gs;

-- Aspirin (missed day 28)
INSERT INTO medication_logs (prescription_id, patient_id, status, scheduled_at, taken_at)
SELECT v_presc4_id, v_patient_id,
  CASE WHEN gs = 28 THEN 'missed'::medication_log_status ELSE 'taken'::medication_log_status END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'8 hours',
  CASE WHEN gs = 28 THEN NULL
       ELSE (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'8 hours' + (FLOOR(RANDOM()*15)+1)*INTERVAL'1 minute' END
FROM generate_series(1,30) AS gs;

-- ============================================================
-- 8. 30 DAYS OF VITAL SIGNS
--    Must delete emergency_alerts first (FK -> vital_signs)
-- ============================================================
DELETE FROM emergency_alerts WHERE patient_id = v_patient_id;
DELETE FROM vital_signs      WHERE patient_id = v_patient_id;

-- Blood glucose fasting (168 -> 114 mg/dL)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'blood_glucose'::vital_type,
  ROUND((168 - (gs-1)*1.8 + (RANDOM()*10-5))::NUMERIC, 1),
  'mg/dL', CASE WHEN gs%5=0 THEN 'device'::vital_source ELSE 'manual'::vital_source END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'7 hours'
FROM generate_series(1,30) AS gs;

-- Blood glucose post-dinner (195 -> 132 mg/dL)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'blood_glucose'::vital_type,
  ROUND((195 - (gs-1)*2.1 + (RANDOM()*14-7))::NUMERIC, 1),
  'mg/dL', 'manual'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'20 hours'
FROM generate_series(1,30) AS gs;

-- Systolic BP (148 -> 130 mmHg)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'blood_pressure_systolic'::vital_type,
  ROUND((148 - (gs-1)*0.6 + (RANDOM()*6-3))::NUMERIC, 0),
  'mmHg', 'manual'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'9 hours'
FROM generate_series(1,30) AS gs;

-- Diastolic BP (94 -> 79 mmHg)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'blood_pressure_diastolic'::vital_type,
  ROUND((94 - (gs-1)*0.5 + (RANDOM()*4-2))::NUMERIC, 0),
  'mmHg', 'manual'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'9 hours'
FROM generate_series(1,30) AS gs;

-- Heart rate (78 -> 72 bpm)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'heart_rate'::vital_type,
  ROUND((78 - (gs-1)*0.2 + (RANDOM()*6-3))::NUMERIC, 0),
  'bpm', CASE WHEN gs%3=0 THEN 'device'::vital_source ELSE 'manual'::vital_source END,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'9 hours'
FROM generate_series(1,30) AS gs;

-- Oxygen saturation (97-99%)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'oxygen_saturation'::vital_type,
  ROUND((97.5 + RANDOM()*1.5)::NUMERIC, 1),
  '%', 'device'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'9 hours'
FROM generate_series(1,30) AS gs;

-- Weight (87.2 -> 85.4 kg)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'weight'::vital_type,
  ROUND((87.2 - (gs-1)*0.06 + (RANDOM()*0.4-0.2))::NUMERIC, 1),
  'kg', 'manual'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'7 hours 30 minutes'
FROM generate_series(1,30) AS gs;

-- Steps (4000 -> 8500/day)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'steps'::vital_type,
  ROUND((4200 + (gs-1)*140 + (RANDOM()*800-400))::NUMERIC, 0),
  'steps', 'device'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'23 hours'
FROM generate_series(1,30) AS gs;

-- Active minutes (12 -> 34 min/day)
INSERT INTO vital_signs (patient_id, type, value, unit, source, recorded_at)
SELECT v_patient_id, 'active_minutes'::vital_type,
  ROUND((12 + (gs-1)*0.73 + (RANDOM()*6-3))::NUMERIC, 0),
  'min', 'device'::vital_source,
  (CURRENT_DATE - ((30-gs)*INTERVAL'1 day'))::TIMESTAMPTZ + INTERVAL'23 hours'
FROM generate_series(1,30) AS gs;

-- Grab a vital id for emergency alerts
SELECT id INTO v_vital_id FROM vital_signs
  WHERE patient_id = v_patient_id AND type = 'blood_glucose'
  ORDER BY recorded_at ASC LIMIT 1;

-- ============================================================
-- 9. SYMPTOMS (recorded_at, NOT logged_at)
-- ============================================================
INSERT INTO symptoms (patient_id, symptom, severity, notes, recorded_at)
VALUES
  (v_patient_id,'Increased Thirst', 6,'Drinking more than usual, possible hyperglycaemia',        NOW()-INTERVAL'25 days'),
  (v_patient_id,'Headache',         5,'Mild throbbing headache, likely blood pressure related',    NOW()-INTERVAL'21 days'),
  (v_patient_id,'Blurred Vision',   4,'Brief episode in the morning, resolved after 20 min',      NOW()-INTERVAL'18 days'),
  (v_patient_id,'Fatigue',          5,'Moderate afternoon fatigue, slept poorly night before',    NOW()-INTERVAL'14 days'),
  (v_patient_id,'Nausea',           3,'Mild nausea shortly after taking Metformin with breakfast', NOW()-INTERVAL'10 days'),
  (v_patient_id,'Headache',         3,'Mild headache in the afternoon, resolved with rest',        NOW()-INTERVAL'7 days'),
  (v_patient_id,'Fatigue',          4,'Tired after long walk, possibly over-exerted',             NOW()-INTERVAL'3 days'),
  (v_patient_id,'Dizziness',        2,'Brief lightheadedness when standing up quickly',           NOW()-INTERVAL'1 day');

-- ============================================================
-- 10. FOOD LOGS (no fiber_g column)
-- ============================================================
INSERT INTO food_logs (patient_id, meal_type, description, calories, protein_g, carbs_g, fat_g, logged_at)
VALUES
  (v_patient_id,'breakfast','Greek yogurt with walnuts and blueberries',          310, 22, 30, 12, NOW()-INTERVAL'6 days'+INTERVAL'8h'),
  (v_patient_id,'lunch',    'Whole-grain turkey wrap with avocado',               480, 32, 45, 18, NOW()-INTERVAL'6 days'+INTERVAL'13h'),
  (v_patient_id,'dinner',   'Grilled salmon, roasted broccoli, brown rice',       560, 42, 48, 16, NOW()-INTERVAL'6 days'+INTERVAL'19h'),
  (v_patient_id,'breakfast','Oatmeal with cinnamon, apple slices, skim milk',     350, 14, 58,  6, NOW()-INTERVAL'5 days'+INTERVAL'8h'),
  (v_patient_id,'lunch',    'Grilled chicken salad with olive oil dressing',      420, 38, 18, 18, NOW()-INTERVAL'5 days'+INTERVAL'13h'),
  (v_patient_id,'dinner',   'Lentil soup with whole-grain bread',                 490, 28, 72,  8, NOW()-INTERVAL'5 days'+INTERVAL'19h'),
  (v_patient_id,'snack',    'Celery sticks with hummus',                          110,  5, 14,  5, NOW()-INTERVAL'5 days'+INTERVAL'16h'),
  (v_patient_id,'breakfast','Scrambled eggs (3) with spinach and tomato',         310, 24, 10, 18, NOW()-INTERVAL'4 days'+INTERVAL'8h'),
  (v_patient_id,'lunch',    'Quinoa bowl with roasted vegetables',                460, 18, 68, 12, NOW()-INTERVAL'4 days'+INTERVAL'13h'),
  (v_patient_id,'dinner',   'Baked chicken thigh, sweet potato, green beans',     510, 38, 52, 14, NOW()-INTERVAL'4 days'+INTERVAL'19h'),
  (v_patient_id,'breakfast','Whole-wheat toast with almond butter and banana',    380, 12, 54, 14, NOW()-INTERVAL'3 days'+INTERVAL'8h'),
  (v_patient_id,'lunch',    'Tuna salad on mixed greens, no croutons',            390, 36, 12, 18, NOW()-INTERVAL'3 days'+INTERVAL'13h'),
  (v_patient_id,'dinner',   'Turkey meatballs with zucchini noodles',             440, 38, 22, 16, NOW()-INTERVAL'3 days'+INTERVAL'19h'),
  (v_patient_id,'snack',    'Apple with 1 oz low-fat cheese',                     130,  7, 18,  4, NOW()-INTERVAL'3 days'+INTERVAL'16h'),
  (v_patient_id,'breakfast','Berry smoothie: almond milk, spinach, mixed berries',270, 10, 38,  8, NOW()-INTERVAL'2 days'+INTERVAL'8h'),
  (v_patient_id,'lunch',    'Black bean and vegetable stir-fry with tofu',        430, 24, 58, 10, NOW()-INTERVAL'2 days'+INTERVAL'13h'),
  (v_patient_id,'dinner',   'Baked cod, asparagus, quinoa',                       490, 44, 40, 10, NOW()-INTERVAL'2 days'+INTERVAL'19h');

-- ============================================================
-- 11. EXERCISE LOGS (no distance_km or notes columns)
-- ============================================================
INSERT INTO exercise_logs (patient_id, activity_type, duration_minutes, calories, source, logged_at)
VALUES
  (v_patient_id,'cycling',  30, 210, 'manual', NOW()-INTERVAL'26 days'),
  (v_patient_id,'walking',  20,  90, 'manual', NOW()-INTERVAL'24 days'),
  (v_patient_id,'swimming', 35, 280, 'manual', NOW()-INTERVAL'22 days'),
  (v_patient_id,'walking',  30, 138, 'device', NOW()-INTERVAL'20 days'),
  (v_patient_id,'yoga',     45, 160, 'manual', NOW()-INTERVAL'18 days'),
  (v_patient_id,'walking',  35, 161, 'device', NOW()-INTERVAL'16 days'),
  (v_patient_id,'cycling',  40, 290, 'manual', NOW()-INTERVAL'14 days'),
  (v_patient_id,'walking',  30, 138, 'device', NOW()-INTERVAL'12 days'),
  (v_patient_id,'strength', 45, 240, 'manual', NOW()-INTERVAL'10 days'),
  (v_patient_id,'walking',  40, 184, 'device', NOW()-INTERVAL'7 days'),
  (v_patient_id,'yoga',     50, 175, 'manual', NOW()-INTERVAL'5 days'),
  (v_patient_id,'cycling',  35, 255, 'manual', NOW()-INTERVAL'3 days'),
  (v_patient_id,'walking',  45, 207, 'device', NOW()-INTERVAL'1 day');

-- ============================================================
-- 12. ASSESSMENTS
-- ============================================================
INSERT INTO assessments (patient_id, type, score, responses, completed_at)
VALUES
  (v_patient_id,'phq9', 8,  '{"q1":1,"q2":2,"q3":1,"q4":1,"q5":1,"q6":1,"q7":0,"q8":1,"q9":0}', NOW()-INTERVAL'28 days'),
  (v_patient_id,'gad7', 7,  '{"q1":1,"q2":2,"q3":1,"q4":1,"q5":1,"q6":1,"q7":0}',               NOW()-INTERVAL'28 days'),
  (v_patient_id,'phq9', 6,  '{"q1":1,"q2":1,"q3":1,"q4":1,"q5":1,"q6":0,"q7":0,"q8":1,"q9":0}', NOW()-INTERVAL'7 days'),
  (v_patient_id,'gad7', 5,  '{"q1":1,"q2":1,"q3":1,"q4":1,"q5":0,"q6":1,"q7":0}',               NOW()-INTERVAL'7 days');

-- ============================================================
-- 13. APPOINTMENTS
-- ============================================================
INSERT INTO appointments (id, patient_id, provider_id, appointment_type, status, scheduled_at, duration_minutes, notes, meeting_url)
VALUES
  ('dddddddd-0001-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'telehealth', 'completed', NOW()-INTERVAL'21 days', 30,
   'Quarterly diabetes review. HbA1c 7.8 to 7.4. Medication adjusted.', 'https://meet.healthos.app/room/completed-21d'),
  ('dddddddd-0002-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'in_person',  'completed', NOW()-INTERVAL'7 days',  45,
   'Blood pressure check. BP improved 148/94 to 132/82. Continue current plan.', NULL),
  ('dddddddd-0004-0000-0000-000000000001'::UUID,
   v_patient_id, v_provider_id, 'in_person',  'scheduled', NOW()+INTERVAL'30 days', 60,
   'Comprehensive 3-month review: labs, full physical, care plan update.', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 14. MESSAGES
-- ============================================================
INSERT INTO messages (sender_id, recipient_id, subject, content, status, sent_at)
VALUES
  (v_provider_id, v_patient_id, 'Your Latest Lab Results',
   'Hi John, your HbA1c is down to 7.4% — great progress! Keep up the consistent medication schedule. Dr. Chen',
   'read', NOW()-INTERVAL'20 days'),
  (v_patient_id, v_provider_id, 'RE: Your Latest Lab Results',
   'Thank you Dr. Chen! I have been sticking to the diet plan and walking every day. Is light cycling okay too? — John',
   'read', NOW()-INTERVAL'19 days'),
  (v_provider_id, v_patient_id, 'RE: RE: Your Latest Lab Results',
   'Absolutely, John! Cycling is excellent for blood sugar. Start with 20-30 minute sessions. Dr. Chen',
   'read', NOW()-INTERVAL'19 days'),
  (v_patient_id, v_provider_id, 'Metformin Side Effect Question',
   'Hi Dr. Chen, I have been getting mild nausea 30 minutes after taking Metformin. Should I be concerned? — John',
   'read', NOW()-INTERVAL'10 days');

-- ============================================================
-- 15. EMERGENCY ALERTS
-- ============================================================
INSERT INTO emergency_alerts (patient_id, vital_sign_id, severity, status, trigger_type, trigger_value, threshold_value, message, created_at, resolved_at)
VALUES
  (v_patient_id, v_vital_id, 'warning',  'resolved',
   'blood_glucose',          252, 200, 'Fasting blood glucose of 252 mg/dL detected — above target range.',
   NOW()-INTERVAL'28 days', NOW()-INTERVAL'27 days'),
  (v_patient_id, v_vital_id, 'critical', 'resolved',
   'blood_pressure_systolic', 168, 150, 'Systolic BP of 168 mmHg detected. Patient advised rest and monitoring.',
   NOW()-INTERVAL'15 days', NOW()-INTERVAL'14 days');

-- ============================================================
-- 16. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (recipient_id, type, channel, status, payload, scheduled_at, sent_at)
VALUES
  (v_patient_id,'medication_reminder', 'in_app','delivered',
   '{"title":"Time for Lisinopril","message":"Take your morning Lisinopril 10 mg"}',
   NOW()-INTERVAL'1 day'+INTERVAL'8h',  NOW()-INTERVAL'1 day'+INTERVAL'8h'),
  (v_patient_id,'appointment_reminder','in_app','delivered',
   '{"title":"Upcoming Appointment","message":"Telehealth visit with Dr. Chen in 7 days"}',
   NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days'),
  (v_patient_id,'health_alert',        'in_app','delivered',
   '{"title":"Elevated Glucose","message":"Post-dinner glucose 188 mg/dL above target. Consider a short walk."}',
   NOW()-INTERVAL'2 days', NOW()-INTERVAL'2 days'),
  (v_patient_id,'goal_update',         'in_app','delivered',
   '{"title":"Great Progress!","message":"28 active minutes today — almost at your 30-minute goal!"}',
   NOW()-INTERVAL'3 days', NOW()-INTERVAL'3 days'),
  (v_patient_id,'medication_reminder', 'in_app','queued',
   '{"title":"Evening Metformin","message":"Take your evening Metformin 500 mg with dinner"}',
   NOW()+INTERVAL'2h', NULL),
  (v_patient_id,'appointment_reminder','email', 'queued',
   '{"title":"Appointment Reminder","message":"Telehealth with Dr. Chen in 7 days"}',
   NOW()+INTERVAL'6h', NULL),
  (v_patient_id,'health_tip',          'in_app','queued',
   '{"title":"Daily Health Tip","message":"Drinking water before meals can help with blood sugar control."}',
   NOW()+INTERVAL'12h', NULL);

-- ============================================================
-- 17. DEVICE INTEGRATIONS (no model column)
-- ============================================================
INSERT INTO device_integrations (patient_id, device_type, vendor, status, last_sync_at)
VALUES
  (v_patient_id,'Blood Pressure Monitor','Omron', 'connected', NOW()-INTERVAL'1 day'),
  (v_patient_id,'Fitness Tracker',       'Fitbit','connected', NOW()-INTERVAL'30 minutes')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 18. INSURANCE PLAN
-- ============================================================
DELETE FROM insurance_plans WHERE patient_id = v_patient_id;

INSERT INTO insurance_plans (patient_id, provider_name, plan_name, member_id_encrypted, group_number_encrypted, coverage_start_date, coverage_end_date)
VALUES (v_patient_id, 'BlueCross BlueShield', 'Gold PPO 1500',
  'BCBS-ENCRYPTED-MBR-45822', 'ENCRYPTED-GRP-78654',
  CURRENT_DATE - INTERVAL '1 year', CURRENT_DATE + INTERVAL '11 months');

-- ============================================================
-- 19. COACH CONVERSATION
-- ============================================================
DELETE FROM coach_conversations WHERE patient_id = v_patient_id;

INSERT INTO coach_conversations (patient_id, messages, metadata)
VALUES (v_patient_id,
  '[
    {"role":"user","content":"My blood sugar was 188 after dinner. Is that too high?"},
    {"role":"assistant","content":"A post-meal glucose of 188 mg/dL is above the recommended target of under 180 mg/dL. A 10-15 minute walk after eating can significantly reduce post-meal spikes. Would you like to review your dinner log?"},
    {"role":"user","content":"I had pasta for dinner. Should I avoid it completely?"},
    {"role":"assistant","content":"You do not need to eliminate pasta. The key is portion control — aim for a half-cup cooked serving with non-starchy vegetables and lean protein. Whole-grain pasta has a lower glycaemic index than regular white pasta."},
    {"role":"user","content":"How soon should I walk after eating?"},
    {"role":"assistant","content":"Walking 15-30 minutes after a meal is ideal. Your muscles use glucose for fuel, which directly lowers post-meal spikes. Even a gentle 10-minute stroll makes a meaningful difference. Based on your logs, you are already building a great habit!"}
  ]'::JSONB,
  '{"topic":"glucose_management","session_count":1}'
);

-- ============================================================
-- 20. CAREGIVERS (requires caregivers migration)
-- ============================================================
INSERT INTO caregivers (patient_id, caregiver_name, caregiver_email, relationship, status, permissions, invited_at, accepted_at)
VALUES
  (v_patient_id,'Linda Mitchell', 'linda.mitchell@email.com','spouse', 'active',
   '{"view_vitals":true,"view_medications":true,"view_appointments":true,"receive_alerts":true}',
   NOW()-INTERVAL'30 days', NOW()-INTERVAL'28 days'),
  (v_patient_id,'Robert Mitchell','rob.mitchell@email.com',  'sibling','pending',
   '{"view_vitals":true,"view_medications":false,"view_appointments":false,"receive_alerts":true}',
   NOW()-INTERVAL'2 days', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 21. COMMUNITY POSTS & REPLIES (requires community migration)
--     community_posts has NO tags column
--     category enum: general|diabetes|heart_health|weight_management|
--                    mental_health|medications|exercise|nutrition|success_story|question
-- ============================================================
INSERT INTO community_posts (id, author_id, title, content, category, like_count)
VALUES
  ('eeeeeeee-0001-0000-0000-000000000001'::UUID, v_patient_id,
   'Finally hit 30 active minutes every day this week!',
   'After months of struggling I managed a full week of 30+ active minutes per day. Mostly walking and cycling. My fasting glucose was 118 this morning — the lowest in over a year!',
   'exercise', 14),
  ('eeeeeeee-0002-0000-0000-000000000001'::UUID, v_patient_id,
   'Tips for managing Metformin nausea in the first weeks?',
   'Started Metformin 3 weeks ago and still getting morning nausea. My doctor said it is normal but wondering if others have tips to manage it.',
   'medications', 8),
  ('eeeeeeee-0003-0000-0000-000000000001'::UUID, v_patient_id,
   'Reading recommendations for understanding Type 2 Diabetes?',
   'Diagnosed 3 years ago but feel I still have gaps. Can anyone recommend books, podcasts, or websites that explain diabetes in plain English?',
   'diabetes', 11)
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_replies (post_id, author_id, content)
VALUES
  ('eeeeeeee-0001-0000-0000-000000000001'::UUID, v_provider_id,
   'Fantastic milestone John! Consistency is more important than intensity for blood sugar management. Regular moderate activity sensitises your cells to insulin far more effectively than occasional intense sessions.'),
  ('eeeeeeee-0002-0000-0000-000000000001'::UUID, v_provider_id,
   'Metformin nausea is very common and usually resolves within 4-6 weeks. Taking it with a larger meal helps significantly. The extended-release (XR) version also tends to cause less nausea if it persists.'),
  ('eeeeeeee-0003-0000-0000-000000000001'::UUID, v_provider_id,
   'I recommend "The Diabetes Code" by Dr. Jason Fung, the American Diabetes Association website, and the "Mastering Diabetes" podcast. Also check the Education section in this app.')
ON CONFLICT DO NOTHING;

END $$;
