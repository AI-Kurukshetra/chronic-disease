import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProgressDashboard } from '@/components/shared/ProgressDashboard';
import { logServerError } from '@/lib/utils/errors';
import type { PatientSummary } from '@/components/shared/ProgressSummary';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Progress | HealthOS',
  };
}

export default async function ProgressPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data, error } = await supabase.rpc('get_patient_dashboard_summary', {
      p_patient_id: user.id,
    });

    if (error) {
      logServerError(error, { action: 'ProgressPage.summary', userId: user.id });
    }

    const summary = Array.isArray(data)
      ? (data[0] as PatientSummary)
      : (data as PatientSummary | null);

    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6 transition-opacity duration-300 md:px-6 md:py-8">
        <ProgressDashboard patientId={user.id} summary={summary ?? null} />
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProgressPage' });
    throw new Error('Unable to load progress at this time.');
  }
}
