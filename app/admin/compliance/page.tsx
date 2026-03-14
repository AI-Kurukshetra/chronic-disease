export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Compliance | HealthOS' };
}

export default async function AdminCompliancePage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Compliance center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            HIPAA, data retention, and audit readiness.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              HIPAA readiness
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">Compliant</p>
            <p className="mt-1 text-sm text-muted-foreground">
              All required policies signed in the last 30 days.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Data access reviews
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">Next review in 12 days</p>
            <p className="mt-1 text-sm text-muted-foreground">Quarterly access review scheduled.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Compliance tasks</h2>
          <div className="mt-4 space-y-3">
            {[
              [
                'Policy update',
                'Review telehealth consent policy for 2026 updates',
                'Due in 5 days',
              ],
              ['Audit prep', 'Export access logs for Q1 submission', 'Due in 12 days'],
              ['Security', 'Rotate service role keys', 'Due in 21 days'],
            ].map((task) => (
              <div
                key={task[0]}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <p className="text-sm font-semibold text-foreground">{task[0]}</p>
                <p className="text-sm text-muted-foreground">{task[1]}</p>
                <p className="mt-1 text-xs text-muted-foreground">{task[2]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Data retention</h2>
            <p className="text-sm text-muted-foreground">Retention and archival checkpoints.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Clinical records', '7 years', 'Next archive in 18 days'],
                ['Audit logs', '3 years', 'Next archive in 9 days'],
                ['Messaging data', '24 months', 'Next archive in 30 days'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{row[0]}</p>
                    <p className="text-xs text-muted-foreground">{row[2]}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Access reviews</h2>
            <p className="text-sm text-muted-foreground">Recent access control checks.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Provider access review', 'Completed', '6 days ago'],
                ['Admin role audit', 'Completed', '12 days ago'],
                ['Caregiver access audit', 'Scheduled', 'Due in 5 days'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{row[0]}</p>
                    <p className="text-xs text-muted-foreground">{row[2]}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminCompliancePage' });
    throw new Error('Unable to load compliance data.');
  }
}

