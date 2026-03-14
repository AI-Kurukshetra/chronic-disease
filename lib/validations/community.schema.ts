import { z } from 'zod';

export const POST_CATEGORIES = [
  'general',
  'diabetes',
  'heart_health',
  'weight_management',
  'mental_health',
  'medications',
  'exercise',
  'nutrition',
  'success_story',
  'question',
] as const;

export const POST_CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  diabetes: 'Diabetes',
  heart_health: 'Heart Health',
  weight_management: 'Weight Management',
  mental_health: 'Mental Health',
  medications: 'Medications',
  exercise: 'Exercise',
  nutrition: 'Nutrition',
  success_story: 'Success Story',
  question: 'Question',
};

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be under 200 characters'),
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(10, 'Please write at least 10 characters')
    .max(5000, 'Post must be under 5000 characters'),
  category: z.enum(POST_CATEGORIES),
});

export const createReplySchema = z.object({
  content: z
    .string({ required_error: 'Reply cannot be empty' })
    .trim()
    .min(2, 'Reply must be at least 2 characters')
    .max(2000, 'Reply must be under 2000 characters'),
  postId: z.string().uuid(),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type CreateReplyFormData = z.infer<typeof createReplySchema>;
