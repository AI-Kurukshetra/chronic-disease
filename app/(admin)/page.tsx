import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { AdminOverviewChart } from '@/components/charts/AdminOverviewChart';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Admin | HealthOS',
  };
}

export default async function AdminPage() {
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
    if (role.toLowerCase() !== 'admin') {
      redirect('/login');
    }

    const [
      { count: patientCount },
      { count: providerCount },
      { count: alertCount },
      { count: activePlans },
    ] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('providers').select('id', { count: 'exact', head: true }),
      supabase
        .from('emergency_alerts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open'),
      supabase
        .from('care_plans')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ]);

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <header>
          <h1 className="text-2xl font-semibold">Admin overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">System-level metrics for HealthOS.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Patients
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{patientCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Providers
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{providerCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Open alerts
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{alertCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Active care plans
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{activePlans ?? 0}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Engagement & activity</h2>
            <p className="text-sm text-muted-foreground">
              Daily platform usage and active patient trend.
            </p>
            <div className="mt-4 rounded-xl bg-[linear-gradient(135deg,#2563EB12,#14B8A612)] p-4">
              <AdminOverviewChart />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Security status
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">All systems normal</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Last audit completed 2 days ago. No critical findings reported.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending requests
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">6</p>
              <p className="mt-1 text-sm text-muted-foreground">
                3 provider verifications · 2 billing reviews · 1 policy update
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Infrastructure
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">Uptime 99.98%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Last incident 14 days ago · Avg API latency 210ms
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Recent admin activity</h2>
            <p className="text-sm text-muted-foreground">Latest system actions and updates.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Policy updated', 'Telehealth consent v3.2', '30m ago'],
                ['Provider verified', 'Dr. Sarah Chen', '2h ago'],
                ['Billing sync', 'Stripe reconciliation', '6h ago'],
                ['Export created', 'Q1 compliance pack', '1d ago'],
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
            <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
            <p className="text-sm text-muted-foreground">Status of connected services.</p>
            <div className="mt-4 grid gap-3">
              {[
                ['Supabase', 'Healthy', 'Last sync 5m ago'],
                ['Stripe', 'Healthy', 'Webhooks 99% success'],
                ['Twilio', 'Degraded', 'SMS retries increasing'],
                ['Resend', 'Healthy', 'Delivery rate 98%'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{row[0]}</p>
                    <p className="text-xs text-muted-foreground">{row[2]}</p>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'AdminPage' });
    throw new Error('Unable to load admin overview at this time.');
  }
}
