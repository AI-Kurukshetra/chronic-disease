export const CRISIS_KEYWORDS = [
  'suicidal',
  'want to die',
  'end my life',
  'kill myself',
  'chest pain',
  "can't breathe",
  'difficulty breathing',
  'stroke',
  'seizure',
  'unconscious',
  'fainted',
  'severe bleeding',
  'overdose',
  'took too many pills',
] as const;

export const VITAL_ALERT_DEFAULTS = {
  blood_glucose: { low: 70, high: 250 },
  blood_pressure_systolic: { high: 160 },
  blood_pressure_diastolic: { high: 100 },
  heart_rate: { low: 50, high: 120 },
  oxygen_saturation: { low: 94 },
} as const;
