import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { AppointmentForm } from '@/components/telehealth/AppointmentForm';
import { AppointmentList, type AppointmentListItem } from '@/components/telehealth/AppointmentList';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Telehealth | HealthOS',
  };
}

export default function Page() {
  return <TelehealthPage />;
}

async function TelehealthPage() {
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
      .from('appointments')
      .select('id, appointment_type, status, scheduled_at, duration_minutes, meeting_url, location')
      .eq('patient_id', user.id)
      .order('scheduled_at', { ascending: false })
      .limit(20);

    if (error) {
      logServerError(error, { action: 'TelehealthPage.appointments', userId: user.id });
    }

    return (
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Telehealth</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Schedule and manage your appointments.
          </p>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Schedule appointment</h2>
          <div className="mt-4">
            <AppointmentForm />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Upcoming & recent</h2>
          <AppointmentList items={(data as AppointmentListItem[] | null) ?? []} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'TelehealthPage' });
    throw new Error('Unable to load telehealth right now.');
  }
}
