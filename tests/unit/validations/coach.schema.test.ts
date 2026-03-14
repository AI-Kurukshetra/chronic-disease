import { describe, expect, it } from 'vitest';
import { coachChatSchema } from '@/lib/validations/coach.schema';

describe('coachChatSchema', () => {
  it('accepts valid chat payload', () => {
    const result = coachChatSchema.safeParse({
      messages: [{ role: 'user', content: 'Hello' }],
      conversationId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result.success).toBe(true);
  });

  it('rejects oversized message', () => {
    const result = coachChatSchema.safeParse({
      messages: [{ role: 'user', content: 'x'.repeat(3000) }],
    });

    expect(result.success).toBe(false);
  });
});
