import { describe, expect, it } from 'vitest';
import { vitalSignSchema } from '@/lib/validations/vitals.schema';

describe('vitalSignSchema', () => {
  it('accepts valid vital input', () => {
    const result = vitalSignSchema.safeParse({
      type: 'blood_glucose',
      value: 120,
      unit: 'mg/dL',
      notes: 'After breakfast',
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative values', () => {
    const result = vitalSignSchema.safeParse({
      type: 'heart_rate',
      value: -5,
      unit: 'bpm',
    });

    expect(result.success).toBe(false);
  });
});
