import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const dateTimeString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date and time');

export const appointmentSchema = z.object({
  appointmentType: z.enum(['telehealth', 'in_person']),
  scheduledAt: dateTimeString,
  durationMinutes: z.preprocess(emptyToUndefined, z.coerce.number().int().min(15).max(180)),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
