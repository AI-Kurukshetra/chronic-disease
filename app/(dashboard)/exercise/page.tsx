import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { ExerciseLogForm } from '@/components/exercise/ExerciseLogForm';
import { ExerciseLogList, type ExerciseLogItem } from '@/components/exercise/ExerciseLogList';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Exercise | HealthOS' };
}

export default async function ExercisePage() {
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
      .from('exercise_logs')
      .select('id, activity_type, duration_minutes, calories, logged_at')
      .eq('patient_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(20);

    if (error) {
      logServerError(error, { action: 'ExercisePage.logs', userId: user.id });
    }

    const totalMinutesThisWeek = (() => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return (data ?? [])
        .filter((l) => new Date(l.logged_at) >= weekAgo)
        .reduce((sum, l) => sum + l.duration_minutes, 0);
    })();

    const totalCaloriesThisWeek = (() => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return (data ?? [])
        .filter((l) => new Date(l.logged_at) >= weekAgo && l.calories != null)
        .reduce((sum, l) => sum + (l.calories ?? 0), 0);
    })();

    return (
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Exercise & Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log workouts and track your weekly activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active minutes (7 days)
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{totalMinutesThisWeek}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Goal: 150 min/week</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Calories burned (7 days)
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {Math.round(totalCaloriesThisWeek)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">kcal from logged activities</p>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Log activity</h2>
          <div className="mt-4">
            <ExerciseLogForm />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recent activities</h2>
          <ExerciseLogList items={(data as ExerciseLogItem[] | null) ?? []} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ExercisePage' });
    throw new Error('Unable to load exercise data at this time.');
  }
}
