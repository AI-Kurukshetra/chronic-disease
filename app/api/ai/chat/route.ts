import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { buildCoachSystemPrompt } from '@/lib/ai/prompts';
import { fetchAnonymizedContext, persistConversation } from '@/lib/ai/coach';
import { CRISIS_KEYWORDS } from '@/lib/constants/health.constants';
import { validateCsrf } from '@/lib/utils/csrf';
import { logServerError } from '@/lib/utils/errors';
import { coachChatSchema } from '@/lib/validations/coach.schema';

export async function POST(request: Request): Promise<Response> {
  if (!validateCsrf(request)) {
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.json();
  const parsed = coachChatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response('Invalid input', { status: 400 });
  }

  const latestUserMessage = parsed.data.messages
    .filter((message) => message.role === 'user')
    .at(-1)?.content;

  if (latestUserMessage) {
    const lowered = latestUserMessage.toLowerCase();
    const isCrisis = CRISIS_KEYWORDS.some((keyword) => lowered.includes(keyword));

    if (isCrisis) {
      const { error } = await supabase.from('emergency_alerts').insert({
        patient_id: user.id,
        severity: 'critical',
        trigger_type: 'ai_crisis_detection',
        message: 'Crisis keywords detected in AI coach conversation.',
      });

      if (error) {
        logServerError(error, { action: 'coach.crisisAlert', userId: user.id });
      }

      return Response.json(
        {
          crisis: true,
          message:
            'I am concerned about what you have shared. Please contact emergency services (911) or the 988 Suicide and Crisis Lifeline immediately.',
        },
        { status: 200 },
      );
    }
  }

  const context = await fetchAnonymizedContext(supabase, user.id);
  const systemPrompt = buildCoachSystemPrompt(context);

  const model = anthropic('claude-sonnet-4-20250514') as unknown as Parameters<
    typeof streamText
  >[0]['model'];

  const result = await streamText({
    model,
    system: systemPrompt,
    messages: parsed.data.messages,
    maxTokens: 600,
    temperature: 0.7,
    onFinish: async ({ text }) => {
      try {
        await persistConversation(
          supabase,
          user.id,
          parsed.data.messages,
          text,
          parsed.data.conversationId,
        );
      } catch (error) {
        logServerError(error, { action: 'coach.persistConversation', userId: user.id });
      }
    },
  });

  return result.toDataStreamResponse();
}
