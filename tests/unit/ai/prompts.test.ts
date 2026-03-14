import { describe, expect, it } from 'vitest';
import { buildCoachSystemPrompt } from '@/lib/ai/prompts';

describe('buildCoachSystemPrompt', () => {
  it('includes vital summary', () => {
    const prompt = buildCoachSystemPrompt({
      vitals: [
        { type: 'blood_glucose', value: 145, unit: 'mg/dL', recorded_at: new Date().toISOString() },
      ],
      prescriptions: [],
      goals: [],
    });

    expect(prompt).toContain('blood glucose');
    expect(prompt).toContain('145');
  });

  it('contains safety limits', () => {
    const prompt = buildCoachSystemPrompt({ vitals: [], prescriptions: [], goals: [] });
    expect(prompt).toContain('Never diagnose');
    expect(prompt).toContain('Never prescribe');
  });
});
