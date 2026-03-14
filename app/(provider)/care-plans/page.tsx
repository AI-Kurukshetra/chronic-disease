import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Care Plans | HealthOS',
  };
}

export default async function ProviderCarePlansPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Care Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage goals, interventions, and patient adherence plans.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Active care plans</h2>
              <p className="text-sm text-muted-foreground">Last updated today</p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Create plan
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              'Diabetes management',
              'Hypertension control',
              'Lifestyle coaching',
              'Medication adherence',
            ].map((plan) => (
              <div key={plan} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{plan}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  3 active goals · 2 interventions
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderCarePlansPage' });
    throw new Error('Unable to load care plans at this time.');
  }
}
