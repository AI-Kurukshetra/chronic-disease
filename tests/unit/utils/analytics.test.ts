import { describe, expect, it } from 'vitest';
import { buildAdherenceTrend } from '@/lib/utils/analytics';

describe('buildAdherenceTrend', () => {
  it('calculates adherence rates per day', () => {
    const result = buildAdherenceTrend([
      { status: 'taken', scheduled_at: '2026-03-10T08:00:00Z' },
      { status: 'missed', scheduled_at: '2026-03-10T20:00:00Z' },
      { status: 'taken', scheduled_at: '2026-03-11T08:00:00Z' },
    ]);

    expect(result).toEqual([
      { date: '2026-03-10', rate: 50 },
      { date: '2026-03-11', rate: 100 },
    ]);
  });

  it('ignores pending logs', () => {
    const result = buildAdherenceTrend([
      { status: 'pending', scheduled_at: '2026-03-10T08:00:00Z' },
    ]);

    expect(result).toEqual([]);
  });
});
