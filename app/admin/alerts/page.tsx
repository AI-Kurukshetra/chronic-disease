export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Alerts | HealthOS' };
}

export default async function AdminAlertsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">System alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Critical system and care alerts across the platform.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Critical', value: '2', tone: 'text-destructive' },
            { label: 'Urgent', value: '5', tone: 'text-warning' },
            { label: 'Warning', value: '9', tone: 'text-muted-foreground' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className={`mt-2 text-2xl font-semibold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Latest alerts</h2>
          <p className="text-sm text-muted-foreground">
            Monitor escalations and system-wide incidents.
          </p>
          <div className="mt-4 space-y-3">
            {[
              ['Critical', 'Emily Davis SpO2 dropped below 92%', '10m ago'],
              ['Urgent', 'Michael Brown rapid weight gain +2.5kg', '2h ago'],
              ['Warning', 'Patricia Garcia glucose > 250 mg/dL', '6h ago'],
            ].map((row) => (
              <div
                key={row[1]}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{row[0]}</p>
                  <p className="text-sm text-muted-foreground">{row[1]}</p>
                </div>
                <span className="text-xs text-muted-foreground">{row[2]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Alert coverage</h2>
            <p className="text-sm text-muted-foreground">Channels receiving escalations.</p>
            <div className="mt-4 space-y-3">
              {[
                ['In-app', '100% delivered'],
                ['SMS', '94% delivered'],
                ['Email', '97% delivered'],
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
            <h2 className="text-xl font-semibold text-foreground">Response SLA</h2>
            <p className="text-sm text-muted-foreground">Care team response times.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Critical', 'Median 8 min'],
                ['Urgent', 'Median 22 min'],
                ['Warning', 'Median 2h 10m'],
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
    logServerError(err, { action: 'AdminAlertsPage' });
    throw new Error('Unable to load admin alerts.');
  }
}

