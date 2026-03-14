import { z } from 'zod';

export const wellnessAssessmentSchema = z.object({
  mood: z.number().int().min(0).max(3),
  sleep: z.number().int().min(0).max(3),
  stress: z.number().int().min(0).max(3),
});

export type WellnessAssessmentInput = z.infer<typeof wellnessAssessmentSchema>;
