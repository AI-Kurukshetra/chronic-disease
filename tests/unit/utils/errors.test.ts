import { describe, expect, it } from 'vitest';
import { AppError, hashIdentifier, toSafeError } from '@/lib/utils/errors';

describe('errors utilities', () => {
  it('hashIdentifier returns deterministic hash', () => {
    const hashA = hashIdentifier('user-123');
    const hashB = hashIdentifier('user-123');
    expect(hashA).toBe(hashB);
    expect(hashA.length).toBeGreaterThan(10);
  });

  it('toSafeError returns app error details', () => {
    const err = new AppError('Something went wrong', 'TEST_ERROR', 400);
    const result = toSafeError(err);
    expect(result.code).toBe('TEST_ERROR');
    expect(result.message).toBe('Something went wrong');
  });
});
