import { z } from 'zod';

export const CAREGIVER_RELATIONSHIPS = [
  'spouse',
  'parent',
  'child',
  'sibling',
  'friend',
  'other',
] as const;

export const caregiverInviteSchema = z.object({
  caregiverEmail: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please enter a valid email address'),
  caregiverName: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  relationship: z.enum(CAREGIVER_RELATIONSHIPS),
});

export type CaregiverInviteFormData = z.infer<typeof caregiverInviteSchema>;
