import { describe, expect, it } from 'vitest';
import { logMedicationSchema } from '@/lib/validations/medications.schema';

describe('logMedicationSchema', () => {
  it('accepts valid input', () => {
    const result = logMedicationSchema.safeParse({
      prescriptionId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'taken',
      notes: 'Taken with food',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = logMedicationSchema.safeParse({
      prescriptionId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'missed',
    });

    expect(result.success).toBe(false);
  });
});
