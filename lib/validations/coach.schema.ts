import { z } from 'zod';

export const coachChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
    }),
  ),
  conversationId: z.string().uuid().optional(),
});

export type CoachChatInput = z.infer<typeof coachChatSchema>;
