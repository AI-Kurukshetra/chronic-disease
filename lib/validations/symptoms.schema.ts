import { z } from 'zod';

export const symptomLogSchema = z.object({
  symptom: z
    .string({ required_error: 'Symptom is required' })
    .trim()
    .min(2, 'Please describe the symptom (at least 2 characters)')
    .max(200, 'Description too long — keep it under 200 characters'),
  severity: z
    .number({
      required_error: 'Severity is required',
      invalid_type_error: 'Severity must be a number',
    })
    .int()
    .min(1, 'Minimum severity is 1')
    .max(10, 'Maximum severity is 10'),
  notes: z.string().trim().max(500, 'Notes must be under 500 characters').optional(),
  recordedAt: z.string().optional(),
});

export type SymptomLogFormData = z.infer<typeof symptomLogSchema>;
