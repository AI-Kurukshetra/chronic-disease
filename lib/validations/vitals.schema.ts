import { z } from 'zod';

export const VITAL_TYPES = [
  'blood_glucose',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'heart_rate',
  'weight',
  'bmi',
  'temperature',
  'oxygen_saturation',
  'steps',
  'active_minutes',
] as const;

export type VitalType = (typeof VITAL_TYPES)[number];

export const VITAL_UNITS: Record<VitalType, string> = {
  blood_glucose: 'mg/dL',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
  heart_rate: 'bpm',
  weight: 'kg',
  bmi: 'kg/m2',
  temperature: 'C',
  oxygen_saturation: '%',
  steps: 'steps',
  active_minutes: 'min',
};

export const vitalSignSchema = z.object({
  type: z.enum(VITAL_TYPES),
  value: z
    .number({ required_error: 'Value is required' })
    .positive('Value must be positive')
    .max(9999, 'Value is too high - please check'),
  unit: z.string().trim().min(1, 'Unit is required'),
  notes: z.string().trim().max(500).optional(),
  recorded_at: z.string().datetime().optional(),
});

export type VitalSignInput = z.infer<typeof vitalSignSchema>;
