import { describe, expect, it } from 'vitest';
import { checkoutSessionSchema } from '@/lib/validations/billing.schema';

describe('checkoutSessionSchema', () => {
  it('accepts valid price id', () => {
    const result = checkoutSessionSchema.safeParse({ priceId: 'price_123' });
    expect(result.success).toBe(true);
  });

  it('rejects empty price id', () => {
    const result = checkoutSessionSchema.safeParse({ priceId: '' });
    expect(result.success).toBe(false);
  });
});
