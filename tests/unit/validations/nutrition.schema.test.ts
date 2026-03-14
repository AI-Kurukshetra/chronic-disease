import { describe, expect, it } from 'vitest';
import { foodLogSchema } from '@/lib/validations/nutrition.schema';

describe('foodLogSchema', () => {
  it('accepts valid meal log', () => {
    const result = foodLogSchema.safeParse({
      mealType: 'lunch',
      description: 'Grilled chicken salad',
      calories: 420,
      proteinG: 35,
      carbsG: 20,
      fatG: 15,
      loggedAt: '2025-01-01T12:30',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid meal type', () => {
    const result = foodLogSchema.safeParse({
      mealType: 'brunch',
      description: 'Meal',
      loggedAt: '2025-01-01T12:30',
    });

    expect(result.success).toBe(false);
  });
});
