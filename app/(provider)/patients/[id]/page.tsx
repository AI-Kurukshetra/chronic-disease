import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import type { PatientSummary } from '@/components/shared/ProgressSummary';

interface ProviderPatientPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProviderPatientPageProps): Promise<Metadata> {
  return {
    title: `Patient ${params.id} | HealthOS`,
  };
}

export default async function ProviderPatientPage({ params }: ProviderPatientPageProps) {
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', params.id)
      .maybeSingle();

    if (profileError) {
      logServerError(profileError, { action: 'ProviderPatientPage.profile', userId: user.id });
    }

    if (!profile) {
      notFound();
    }

    const { data: summary, error: summaryError } = await supabase.rpc(
      'get_patient_dashboard_summary',
      { p_patient_id: params.id },
    );

    if (summaryError) {
      logServerError(summaryError, { action: 'ProviderPatientPage.summary', userId: user.id });
    }

    const patientSummary = Array.isArray(summary)
      ? ((summary[0] as PatientSummary | undefined) ?? null)
      : (summary as PatientSummary | null);

    const { data: vitals, error: vitalsError } = await supabase
      .from('vital_signs')
      .select('id, type, value, unit, recorded_at')
      .eq('patient_id', params.id)
      .order('recorded_at', { ascending: false })
      .limit(10);

    if (vitalsError) {
      logServerError(vitalsError, { action: 'ProviderPatientPage.vitals', userId: user.id });
    }

    const { data: logs, error: logsError } = await supabase
      .from('medication_logs')
      .select('id, status, scheduled_at')
      .eq('patient_id', params.id)
      .order('scheduled_at', { ascending: false })
      .limit(6);

    if (logsError) {
      logServerError(logsError, { action: 'ProviderPatientPage.logs', userId: user.id });
    }

    return (
      <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
        <header>
          <h1 className="text-2xl font-semibold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patient overview and recent activity.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Glucose
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {patientSummary?.latest_glucose ?? '--'} mg/dL
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Blood Pressure
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {patientSummary?.latest_bp_systolic ?? '--'}/
              {patientSummary?.latest_bp_diastolic ?? '--'} mmHg
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Adherence (30d)
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {patientSummary?.adherence_rate_30d ?? '--'}%
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent vitals</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {(vitals ?? []).map((vital) => (
                  <tr
                    key={vital.id}
                    className="border-t border-border/50 text-sm text-foreground transition-colors duration-200 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{vital.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {vital.value} {vital.unit}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(vital.recorded_at).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
                {(!vitals || vitals.length === 0) && (
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
                      No vitals yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Medication adherence</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {(logs ?? []).map((log) => (
              <div key={log.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold text-foreground">{log.status}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.scheduled_at).toLocaleString('en-US')}
                </p>
              </div>
            ))}
            {(!logs || logs.length === 0) && (
              <div className="rounded-xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
                No medication logs yet.
              </div>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderPatientPage' });
    throw new Error('Unable to load patient details at this time.');
  }
}
