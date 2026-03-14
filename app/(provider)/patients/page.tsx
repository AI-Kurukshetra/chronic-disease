import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  ProviderPatientsTable,
  type ProviderPanelRow,
} from '@/components/shared/ProviderPatientsTable';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Patients | HealthOS',
  };
}

export default async function ProviderPatientsPage() {
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

    const { data, error } = await supabase.rpc('get_provider_panel_summary', {
      p_provider_id: user.id,
    });

    if (error) {
      throw new Error('Unable to load provider panel.');
    }

    const rows = (data ?? []) as ProviderPanelRow[];
    const totalPatients = rows.length;
    const highRisk = rows.filter((row) =>
      ['critical', 'high'].includes(row.risk_level?.toLowerCase()),
    ).length;
    const openAlerts = rows.reduce((sum, row) => sum + (row.open_alerts ?? 0), 0);

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Care panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor risk levels, adherence, and alerts across your assigned patients.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total patients
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalPatients}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              High risk
            </p>
            <p className="mt-2 text-3xl font-bold text-destructive">{highRisk}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open alerts
            </p>
            <p className="mt-2 text-3xl font-bold text-warning">{openAlerts}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Assigned patients</h2>
              <p className="text-sm text-muted-foreground">
                Keep an eye on adherence and risk trends.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Export
              </button>
              <button
                type="button"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Add patient
              </button>
            </div>
          </div>
          <ProviderPatientsTable rows={rows} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderPatientsPage' });
    throw new Error('Unable to load provider patients at this time.');
  }
}
