import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { VitalsDashboard } from '@/components/vitals/VitalsDashboard';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Vitals | HealthOS',
  };
}

export default async function VitalsPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data: vitals, error: vitalsError } = await supabase
      .from('vital_signs')
      .select('id, type, value, unit, recorded_at, alert_triggered')
      .eq('patient_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (vitalsError) {
      throw new Error('Unable to load vitals.');
    }

    const { data: carePlan, error: carePlanError } = await supabase
      .from('care_plans')
      .select('alert_thresholds')
      .eq('patient_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (carePlanError) {
      logServerError(carePlanError, { action: 'VitalsPage.carePlans', userId: user.id });
    }

    const alertThresholds = (carePlan?.alert_thresholds ?? null) as Record<
      string,
      { low?: number; high?: number }
    > | null;

    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6 transition-opacity duration-300 md:px-6 md:py-8">
        <VitalsDashboard
          patientId={user.id}
          initialVitals={vitals ?? []}
          alertThresholds={alertThresholds}
        />
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'VitalsPage' });
    throw new Error('Unable to load vitals at this time.');
  }
}
