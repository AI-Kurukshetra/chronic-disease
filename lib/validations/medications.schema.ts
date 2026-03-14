import { z } from 'zod';

export const logMedicationSchema = z.object({
  prescriptionId: z.string().uuid(),
  status: z.enum(['taken', 'skipped']),
  notes: z.string().trim().max(200).optional(),
});

export type LogMedicationInput = z.infer<typeof logMedicationSchema>;
