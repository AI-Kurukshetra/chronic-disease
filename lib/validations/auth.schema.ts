import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().trim().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export const onboardingSchema = z.object({
  dateOfBirth: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
      .optional(),
  ),
  phone: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(7, 'Phone number is too short').max(20).optional(),
  ),
  timezone: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1, 'Timezone is required').max(64).optional(),
  ),
  primaryCondition: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1, 'Condition is required').max(100).optional(),
  ),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
