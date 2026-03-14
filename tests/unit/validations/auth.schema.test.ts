import { describe, expect, it } from 'vitest';
import { registerSchema, onboardingSchema } from '@/lib/validations/auth.schema';

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      firstName: 'Asha',
      lastName: 'Patel',
      email: 'asha@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      firstName: 'Asha',
      lastName: 'Patel',
      email: 'asha@example.com',
      password: 'StrongPass123',
      confirmPassword: 'Mismatch',
    });

    expect(result.success).toBe(false);
  });
});

describe('onboardingSchema', () => {
  it('rejects invalid date format', () => {
    const result = onboardingSchema.safeParse({
      dateOfBirth: '12/31/1990',
    });

    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = onboardingSchema.safeParse({
      dateOfBirth: '1990-12-31',
      phone: '5551234567',
      timezone: 'America/New_York',
      primaryCondition: 'type2_diabetes',
    });

    expect(result.success).toBe(true);
  });
});
