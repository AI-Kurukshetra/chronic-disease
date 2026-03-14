export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Audit Logs | HealthOS' };
}

export default async function AdminAuditPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Audit logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent access and configuration changes.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid grid-cols-4 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Event</span>
            <span>User</span>
            <span>Location</span>
            <span>Time</span>
          </div>
          {[
            ['Role updated', 'Admin User', 'Admin Portal', '15m ago'],
            ['Care plan edited', 'Dr. Chen', 'Provider Portal', '3h ago'],
            ['Patient login', 'Emily Davis', 'Patient App', '6h ago'],
            ['Export created', 'Admin User', 'Compliance', '1d ago'],
          ].map((row) => (
            <div
              key={`${row[0]}-${row[1]}`}
              className="grid grid-cols-4 border-t border-border/60 px-4 py-3 text-sm text-foreground"
            >
              <span>{row[0]}</span>
              <span className="text-muted-foreground">{row[1]}</span>
              <span className="text-muted-foreground">{row[2]}</span>
              <span className="text-muted-foreground">{row[3]}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Audit highlights</h2>
            <p className="text-sm text-muted-foreground">Key actions flagged in the last 7 days.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Role change', 'Admin User → Provider', '2d ago'],
                ['RLS policy update', 'Care plans table', '3d ago'],
                ['Export generated', 'Compliance pack', '5d ago'],
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
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Export history</h2>
            <p className="text-sm text-muted-foreground">Recent exports and downloads.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Q1 Access Logs', 'CSV', 'Completed'],
                ['Compliance Pack', 'PDF', 'Completed'],
                ['Provider Panel Report', 'CSV', 'Queued'],
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
          </div>
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminAuditPage' });
    throw new Error('Unable to load audit logs.');
  }
}

