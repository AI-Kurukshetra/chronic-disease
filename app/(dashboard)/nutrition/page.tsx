import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { FoodLogForm } from '@/components/nutrition/FoodLogForm';
import { FoodLogList, type FoodLogListItem } from '@/components/nutrition/FoodLogList';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Nutrition | HealthOS',
  };
}

export default function Page() {
  return <NutritionPage />;
}

async function NutritionPage() {
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
      .from('food_logs')
      .select('id, meal_type, description, calories, protein_g, carbs_g, fat_g, logged_at')
      .eq('patient_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(20);

    if (error) {
      logServerError(error, { action: 'NutritionPage.foodLogs', userId: user.id });
    }

    return (
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Nutrition</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log meals and track your macro intake.
          </p>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Add meal</h2>
          <div className="mt-4">
            <FoodLogForm />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recent meals</h2>
          <FoodLogList items={(data as FoodLogListItem[] | null) ?? []} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'NutritionPage' });
    throw new Error('Unable to load nutrition right now.');
  }
}
