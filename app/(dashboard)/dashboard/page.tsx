import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Droplet, HeartPulse, Pill, Scale } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { VITAL_ALERT_DEFAULTS } from '@/lib/constants/health.constants';
import { VitalSignCard } from '@/components/vitals/VitalSignCard';
import { VitalsTrendSection } from '@/components/vitals/VitalsTrendSection';
import type { PatientSummary } from '@/components/shared/ProgressSummary';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dashboard | HealthOS',
  };
}

type StatusTone = 'success' | 'warning' | 'destructive' | 'neutral';

function getStatusTone(
  value: number | null | undefined,
  thresholds?: { low?: number; high?: number },
): StatusTone {
  if (value === null || value === undefined || !thresholds) {
    return 'neutral';
  }

  if (thresholds.high !== undefined && value >= thresholds.high) {
    return 'destructive';
  }

  if (thresholds.low !== undefined && value <= thresholds.low) {
    return 'destructive';
  }

  if (thresholds.high !== undefined && value >= thresholds.high * 0.9) {
    return 'warning';
  }

  if (thresholds.low !== undefined && value <= thresholds.low * 1.1) {
    return 'warning';
  }

  return 'success';
}

function getAdherenceTone(rate: number | null | undefined): StatusTone {
  if (rate === null || rate === undefined) {
    return 'neutral';
  }
  if (rate >= 80) {
    return 'success';
  }
  if (rate >= 60) {
    return 'warning';
  }
  return 'destructive';
}

export default async function DashboardPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const [{ data: summary, error: summaryError }, { data: carePlan, error: carePlanError }] =
      await Promise.all([
        supabase.rpc('get_patient_dashboard_summary', { p_patient_id: user.id }),
        supabase
          .from('care_plans')
          .select('alert_thresholds')
          .eq('patient_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (summaryError) {
      logServerError(summaryError, { action: 'DashboardPage.summary', userId: user.id });
    }

    if (carePlanError) {
      logServerError(carePlanError, { action: 'DashboardPage.carePlan', userId: user.id });
    }

    const patientSummary = Array.isArray(summary)
      ? ((summary[0] as PatientSummary | undefined) ?? null)
      : (summary as PatientSummary | null);

    const thresholds =
      (carePlan?.alert_thresholds as Record<string, { low?: number; high?: number }> | null) ??
      VITAL_ALERT_DEFAULTS;

    const [
      { data: upcomingAppointment, error: appointmentError },
      { data: recentVitals, error: vitalsError },
      { data: recentMeals, error: mealsError },
      { data: recentMeds, error: medsError },
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('appointment_type, status, scheduled_at')
        .eq('patient_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('vital_signs')
        .select('type, value, unit, recorded_at')
        .eq('patient_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(3),
      supabase
        .from('food_logs')
        .select('meal_type, description, logged_at')
        .eq('patient_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(2),
      supabase
        .from('medication_logs')
        .select('status, scheduled_at')
        .eq('patient_id', user.id)
        .order('scheduled_at', { ascending: false })
        .limit(2),
    ]);

    if (appointmentError) {
      logServerError(appointmentError, { action: 'DashboardPage.appointment', userId: user.id });
    }
    if (vitalsError) {
      logServerError(vitalsError, { action: 'DashboardPage.vitals', userId: user.id });
    }
    if (mealsError) {
      logServerError(mealsError, { action: 'DashboardPage.meals', userId: user.id });
    }
    if (medsError) {
      logServerError(medsError, { action: 'DashboardPage.meds', userId: user.id });
    }

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 transition-opacity duration-300 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your health trends and stay ahead of your care plan.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <VitalSignCard
            title="Blood glucose"
            value={patientSummary?.latest_glucose}
            unit="mg/dL"
            status={getStatusTone(patientSummary?.latest_glucose, thresholds?.blood_glucose)}
            icon={<Droplet className="h-5 w-5" />}
            tone="primary"
          />
          <VitalSignCard
            title="Blood pressure"
            value={
              patientSummary?.latest_bp_systolic && patientSummary?.latest_bp_diastolic
                ? `${patientSummary.latest_bp_systolic}/${patientSummary.latest_bp_diastolic}`
                : null
            }
            unit="mmHg"
            status={
              getStatusTone(
                patientSummary?.latest_bp_systolic,
                thresholds?.blood_pressure_systolic,
              ) === 'destructive' ||
              getStatusTone(
                patientSummary?.latest_bp_diastolic,
                thresholds?.blood_pressure_diastolic,
              ) === 'destructive'
                ? 'destructive'
                : getStatusTone(
                      patientSummary?.latest_bp_systolic,
                      thresholds?.blood_pressure_systolic,
                    ) === 'warning' ||
                    getStatusTone(
                      patientSummary?.latest_bp_diastolic,
                      thresholds?.blood_pressure_diastolic,
                    ) === 'warning'
                  ? 'warning'
                  : 'success'
            }
            icon={<HeartPulse className="h-5 w-5" />}
            tone="secondary"
          />
          <VitalSignCard
            title="Weight"
            value={patientSummary?.latest_weight}
            unit="kg"
            status="neutral"
            icon={<Scale className="h-5 w-5" />}
            tone="warning"
          />
          <VitalSignCard
            title="Medication adherence"
            value={patientSummary?.adherence_rate_30d}
            unit="%"
            status={getAdherenceTone(patientSummary?.adherence_rate_30d)}
            icon={<Pill className="h-5 w-5" />}
            tone="success"
            helper="Last 30 days"
          />
        </section>

        <VitalsTrendSection patientId={user.id} alertThresholds={thresholds} />

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Recent activity</h2>
              <p className="text-sm text-muted-foreground">
                Latest vitals, meals, and medication logs.
              </p>
            </div>
            <div className="space-y-3 text-sm text-foreground">
              {(recentVitals ?? []).map((vital, index) => (
                <div key={`vital-${index}`} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{vital.type.replaceAll('_', ' ')}</span>
                  <span>
                    {vital.value} {vital.unit}
                  </span>
                </div>
              ))}
              {(recentMeals ?? []).map((meal, index) => (
                <div key={`meal-${index}`} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{meal.meal_type}</span>
                  <span>{meal.description}</span>
                </div>
              ))}
              {(recentMeds ?? []).map((med, index) => (
                <div key={`med-${index}`} className="flex items-center justify-between">
                  <span className="text-muted-foreground">Medication</span>
                  <span className="capitalize">{med.status}</span>
                </div>
              ))}
              {!recentVitals?.length && !recentMeals?.length && !recentMeds?.length && (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                  <p className="text-sm text-muted-foreground">No activity logged yet.</p>
                  <Link
                    href="/vitals"
                    className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Log your first vital
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Upcoming appointment</h2>
              <p className="text-sm text-muted-foreground">Stay prepared for your next visit.</p>
            </div>
            {upcomingAppointment ? (
              <div className="space-y-3 text-sm text-foreground">
                <div>
                  <p className="text-base font-semibold capitalize text-foreground">
                    {upcomingAppointment.appointment_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(upcomingAppointment.scheduled_at).toLocaleString('en-US')}
                  </p>
                </div>
                <Link
                  href="/telehealth"
                  className="inline-flex rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Manage appointments
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
                <Link
                  href="/telehealth"
                  className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Schedule telehealth
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'DashboardPage' });
    throw new Error('Unable to load the dashboard at this time.');
  }
}
