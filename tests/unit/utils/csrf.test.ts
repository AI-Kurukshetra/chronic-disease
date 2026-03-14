import { describe, expect, it, beforeEach } from 'vitest';
import { validateCsrf } from '@/lib/utils/csrf';

describe('validateCsrf', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('returns true for matching origin', () => {
    const request = new Request('http://localhost:3000/api/ai/chat', {
      headers: { origin: 'http://localhost:3000' },
    });

    expect(validateCsrf(request)).toBe(true);
  });

  it('returns false for mismatched origin', () => {
    const request = new Request('http://localhost:3000/api/ai/chat', {
      headers: { origin: 'http://evil.test' },
    });

    expect(validateCsrf(request)).toBe(false);
  });
});
