import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { ProviderTrendChart } from '@/components/charts/ProviderTrendChart';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Reports | HealthOS',
  };
}

export default async function ProviderReportsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Population-level insights and adherence summaries.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average adherence
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">86%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vitals within range
            </p>
            <p className="mt-2 text-3xl font-bold text-success">72%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active care plans
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">18</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Trend summary</h2>
          <p className="text-sm text-muted-foreground">
            Weekly panel trends and risk distribution.
          </p>
          <div className="mt-4 rounded-xl bg-[linear-gradient(135deg,#2563EB12,#14B8A612)] p-4">
            <ProviderTrendChart />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderReportsPage' });
    throw new Error('Unable to load reports at this time.');
  }
}
