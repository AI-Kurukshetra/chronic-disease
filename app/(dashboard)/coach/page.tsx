import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CoachChat } from '@/components/coach/CoachChat';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'AI Coach | HealthOS',
  };
}

export default async function CoachPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data: conversation, error: conversationError } = await supabase
      .from('coach_conversations')
      .select('id, messages')
      .eq('patient_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (conversationError) {
      logServerError(conversationError, { action: 'CoachPage.conversation', userId: user.id });
    }

    const initialMessages = Array.isArray(conversation?.messages)
      ? (conversation.messages as Array<{ role: 'user' | 'assistant'; content: string }>).map(
          (message) => ({
            role: message.role,
            content: message.content,
          }),
        )
      : [];

    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Health Coach</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask questions about your progress, habits, or health goals.
          </p>
        </div>
        <div className="h-[70vh]">
          <CoachChat
            conversationId={conversation?.id ?? undefined}
            initialMessages={initialMessages}
          />
        </div>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'CoachPage' });
    throw new Error('Unable to load the AI coach at this time.');
  }
}
