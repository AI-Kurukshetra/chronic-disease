import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { PHQ9Form } from '@/components/assessments/PHQ9Form';
import { GAD7Form } from '@/components/assessments/GAD7Form';
import {
  AssessmentHistory,
  type AssessmentHistoryItem,
} from '@/components/assessments/AssessmentHistory';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Assessments | HealthOS' };
}

export default async function AssessmentsPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('id, type, score, completed_at, created_at')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      logServerError(error, { action: 'AssessmentsPage.load', userId: user.id });
    }

    return (
      <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6 md:px-6 md:py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Assessments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Standardized questionnaires to screen for depression and anxiety. Results are shared
            with your care team.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> These tools are for screening purposes only and are not a
            substitute for professional medical evaluation. If you are in crisis, please contact
            your care team or call emergency services.
          </p>
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">PHQ-9 — Depression Screening</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              9-item questionnaire · Takes about 2 minutes
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <PHQ9Form />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">GAD-7 — Anxiety Screening</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              7-item questionnaire · Takes about 2 minutes
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <GAD7Form />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Assessment history</h2>
          <AssessmentHistory items={(data as AssessmentHistoryItem[] | null) ?? []} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'AssessmentsPage' });
    throw new Error('Unable to load assessments at this time.');
  }
}
