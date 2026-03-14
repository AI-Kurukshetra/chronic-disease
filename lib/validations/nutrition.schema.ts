import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const dateTimeString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date and time');

export const foodLogSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  description: z.string().trim().min(2, 'Description is required').max(240),
  calories: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(5000).optional()),
  proteinG: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(500).optional()),
  carbsG: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(500).optional()),
  fatG: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(300).optional()),
  loggedAt: z.preprocess(emptyToUndefined, dateTimeString.optional()),
});

export type FoodLogFormData = z.infer<typeof foodLogSchema>;
