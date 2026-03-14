import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Overview | HealthOS',
  };
}

export default async function ProviderOverviewPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Snapshot of your care panel and urgent alerts.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Patients
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">12</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open alerts
            </p>
            <p className="mt-2 text-3xl font-bold text-warning">3</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              High risk
            </p>
            <p className="mt-2 text-3xl font-bold text-destructive">2</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Care plan highlights</h2>
          <p className="text-sm text-muted-foreground">Key focus areas for this week.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              'Glucose monitoring',
              'Medication adherence',
              'Telehealth follow-ups',
              'Lifestyle coaching',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">{item}</p>
                <p className="mt-1 text-xs text-muted-foreground">Review tasks and outcomes.</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderOverviewPage' });
    throw new Error('Unable to load provider overview at this time.');
  }
}
