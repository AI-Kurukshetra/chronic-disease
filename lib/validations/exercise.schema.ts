import { z } from 'zod';

export const ACTIVITY_TYPES = [
  'walking',
  'running',
  'cycling',
  'swimming',
  'strength_training',
  'yoga',
  'hiit',
  'stretching',
  'dancing',
  'other',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  walking: 'Walking',
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  strength_training: 'Strength Training',
  yoga: 'Yoga',
  hiit: 'HIIT',
  stretching: 'Stretching',
  dancing: 'Dancing',
  other: 'Other',
};

export const exerciseLogSchema = z.object({
  activityType: z.enum(ACTIVITY_TYPES, { required_error: 'Activity type is required' }),
  durationMinutes: z
    .number({
      required_error: 'Duration is required',
      invalid_type_error: 'Duration must be a number',
    })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(600, 'Duration seems too long — please check'),
  calories: z
    .number({ invalid_type_error: 'Calories must be a number' })
    .min(0, 'Calories cannot be negative')
    .max(5000, 'Calories seems too high — please check')
    .optional(),
  loggedAt: z.string().optional(),
});

export type ExerciseLogFormData = z.infer<typeof exerciseLogSchema>;
