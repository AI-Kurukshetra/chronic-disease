export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Quality | HealthOS' };
}

export default async function AdminQualityPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) redirect('/login');
    const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
    if (role.toLowerCase() !== 'admin') redirect('/login');

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Quality metrics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Care quality and engagement benchmarks.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Average response time', '2h 14m'],
            ['Follow-up compliance', '92%'],
            ['Patient satisfaction', '4.7 / 5'],
          ].map((item) => (
            <div key={item[0]} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item[0]}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{item[1]}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Quality checklist</h2>
          <div className="mt-4 space-y-3">
            {[
              ['Care plan adherence review', 'Due in 3 days'],
              ['Provider response SLA', 'On track'],
              ['Monthly risk review', 'Completed'],
            ].map((row) => (
              <div
                key={row[0]}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-semibold text-foreground">{row[0]}</span>
                <span className="text-xs text-muted-foreground">{row[1]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Care quality signals</h2>
            <p className="text-sm text-muted-foreground">Composite quality scores.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Risk escalations resolved <24h', '91%'],
                ['Medication adherence >80%', '76%'],
                ['Telehealth follow-up rate', '88%'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-sm font-semibold text-foreground">{row[0]}</span>
                  <span className="text-xs text-muted-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Patient feedback</h2>
            <p className="text-sm text-muted-foreground">Recent sentiment snapshots.</p>
            <div className="mt-4 space-y-3">
              {[
                ['“Care team is responsive and helpful.”', '4.8/5'],
                ['“AI coaching keeps me on track.”', '4.6/5'],
                ['“Telehealth visits are convenient.”', '4.7/5'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-xs text-muted-foreground">{row[0]}</span>
                  <span className="text-xs text-muted-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminQualityPage' });
    throw new Error('Unable to load quality metrics.');
  }
}

