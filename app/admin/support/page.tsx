export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Support | HealthOS' };
}

export default async function AdminSupportPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Support</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track active tickets and escalation paths.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Open tickets', '8'],
            ['High priority', '2'],
            ['Avg response', '1h 05m'],
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
          <h2 className="text-xl font-semibold text-foreground">Latest tickets</h2>
          <div className="mt-4 space-y-3">
            {[
              ['Provider verification delay', 'Assigned to Ops', '30m ago'],
              ['Billing webhook retry', 'Assigned to Eng', '2h ago'],
              ['Patient login issue', 'Assigned to Support', '5h ago'],
            ].map((row) => (
              <div
                key={row[0]}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{row[0]}</p>
                  <p className="text-xs text-muted-foreground">{row[1]}</p>
                </div>
                <span className="text-xs text-muted-foreground">{row[2]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Escalations</h2>
            <p className="text-sm text-muted-foreground">Issues requiring admin attention.</p>
            <div className="mt-4 space-y-3">
              {[
                ['SMS delivery failures', 'Investigating'],
                ['Provider credential review', 'Pending'],
                ['Data export request', 'Approved'],
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
            <h2 className="text-xl font-semibold text-foreground">Team workload</h2>
            <p className="text-sm text-muted-foreground">Support capacity overview.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Support', '12 open tickets'],
                ['Ops', '5 open tasks'],
                ['Engineering', '3 active incidents'],
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
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminSupportPage' });
    throw new Error('Unable to load support data.');
  }
}

