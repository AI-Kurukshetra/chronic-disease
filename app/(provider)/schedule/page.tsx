import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Schedule | HealthOS',
  };
}

export default async function ProviderSchedulePage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage upcoming telehealth visits and clinical check-ins.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {[
            { title: 'Telehealth · Maya Thompson', time: 'Mar 18 · 2:00 PM', status: 'Confirmed' },
            { title: 'Follow-up · James Lee', time: 'Mar 19 · 10:30 AM', status: 'Pending' },
            { title: 'Vitals review · Ana Ruiz', time: 'Mar 19 · 4:00 PM', status: 'Confirmed' },
            {
              title: 'Nutrition consult · Chris Park',
              time: 'Mar 20 · 9:00 AM',
              status: 'Pending',
            },
          ].map((visit) => (
            <div
              key={visit.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <p className="text-sm font-semibold text-foreground">{visit.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{visit.time}</p>
              <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {visit.status}
              </span>
            </div>
          ))}
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderSchedulePage' });
    throw new Error('Unable to load schedule at this time.');
  }
}
