import { describe, expect, it } from 'vitest';
import { appointmentSchema } from '@/lib/validations/telehealth.schema';

describe('appointmentSchema', () => {
  it('accepts valid appointment', () => {
    const result = appointmentSchema.safeParse({
      appointmentType: 'telehealth',
      scheduledAt: '2025-01-01T10:00',
      durationMinutes: 30,
      notes: 'Follow-up visit',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid duration', () => {
    const result = appointmentSchema.safeParse({
      appointmentType: 'telehealth',
      scheduledAt: '2025-01-01T10:00',
      durationMinutes: 5,
    });

    expect(result.success).toBe(false);
  });
});
