import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { SymptomLogForm } from '@/components/symptoms/SymptomLogForm';
import { SymptomLogList, type SymptomLogItem } from '@/components/symptoms/SymptomLogList';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Symptoms | HealthOS' };
}

export default async function SymptomsPage() {
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
      .from('symptoms')
      .select('id, symptom, severity, notes, recorded_at')
      .eq('patient_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(30);

    if (error) {
      logServerError(error, { action: 'SymptomsPage.logs', userId: user.id });
    }

    const recentItems = data ?? [];
    const avgSeverity =
      recentItems.length > 0
        ? (recentItems.reduce((s, i) => s + i.severity, 0) / recentItems.length).toFixed(1)
        : null;

    const highSeverityCount = recentItems.filter((i) => i.severity >= 7).length;

    return (
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Symptoms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and monitor your symptoms over time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average severity (recent)
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {avgSeverity ?? '--'}
              <span className="text-sm font-normal text-muted-foreground"> / 10</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Based on last {recentItems.length} entries
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              High severity (≥7)
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{highSeverityCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Entries requiring attention</p>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Log a symptom</h2>
          <div className="mt-4">
            <SymptomLogForm />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recent symptoms</h2>
          <SymptomLogList items={(data as SymptomLogItem[] | null) ?? []} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'SymptomsPage' });
    throw new Error('Unable to load symptoms at this time.');
  }
}
