import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProviderAlertsPanel } from '@/components/shared/ProviderAlertsPanel';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Alerts | HealthOS',
  };
}

export default async function ProviderAlertsPage() {
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

    const { data, error } = await supabase
      .from('emergency_alerts')
      .select('id, patient_id, severity, status, message, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error('Unable to load alerts.');
    }

    const alerts = data ?? [];
    const criticalCount = alerts.filter(
      (alert) => alert.severity?.toLowerCase() === 'critical',
    ).length;
    const warningCount = alerts.filter(
      (alert) => alert.severity?.toLowerCase() === 'warning',
    ).length;

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Alerts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live alerts for your patient panel.</p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open alerts
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{alerts.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Critical
            </p>
            <p className="mt-2 text-3xl font-bold text-destructive">{criticalCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Warnings
            </p>
            <p className="mt-2 text-3xl font-bold text-warning">{warningCount}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent alerts</h2>
              <p className="text-sm text-muted-foreground">Prioritize urgent cases first.</p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Acknowledge all
            </button>
          </div>
          <ProviderAlertsPanel providerId={user.id} initialAlerts={alerts} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderAlertsPage' });
    throw new Error('Unable to load alerts at this time.');
  }
}
