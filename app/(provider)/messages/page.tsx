import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Messages | HealthOS',
  };
}

export default async function ProviderMessagesPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
    if (role.toLowerCase() !== 'provider') {
      redirect('/login');
    }

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Communicate securely with patients and care coordinators.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Inbox</h2>
              <p className="text-sm text-muted-foreground">Latest patient messages</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              New message
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {['Medication question', 'Follow-up on glucose', 'Diet update'].map((subject) => (
              <div key={subject} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">2 hours ago · Pending reply</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderMessagesPage' });
    throw new Error('Unable to load messages at this time.');
  }
}
