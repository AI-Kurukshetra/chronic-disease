import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  MedicationPendingList,
  type PendingMedicationLog,
} from '@/components/medications/MedicationPendingList';
import { MedicationCard } from '@/components/medications/MedicationCard';
import { logServerError } from '@/lib/utils/errors';

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const pickFirst = <T,>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Medications | HealthOS',
  };
}

export default async function MedicationsPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const { data: pendingLogs, error: pendingError } = await supabase
      .from('medication_logs')
      .select('id, scheduled_at, prescriptions(id, dosage, frequency, medications(name))')
      .eq('patient_id', user.id)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: false })
      .limit(20);

    if (pendingError) {
      throw new Error('Unable to load medication reminders.');
    }

    const normalizedLogs: PendingMedicationLog[] = (pendingLogs ?? []).map((log) => {
      const record = log as {
        id: unknown;
        scheduled_at: unknown;
        prescriptions?: unknown;
      };

      const prescriptionsRaw = pickFirst(
        record.prescriptions as
          | {
              id: unknown;
              dosage: unknown;
              frequency: unknown;
              medications?: unknown;
            }
          | null
          | undefined,
      );

      const medicationsRaw = prescriptionsRaw
        ? pickFirst(
            prescriptionsRaw.medications as
              | {
                  name: unknown;
                }
              | null
              | undefined,
          )
        : null;

      return {
        id: toString(record.id),
        scheduled_at: toString(record.scheduled_at),
        prescriptions: prescriptionsRaw
          ? {
              id: toString(prescriptionsRaw.id),
              dosage: toString(prescriptionsRaw.dosage),
              frequency: toString(prescriptionsRaw.frequency),
              medications: medicationsRaw
                ? {
                    name: toString(medicationsRaw.name),
                  }
                : null,
            }
          : null,
      };
    });

    const { data: adherenceRate, error: adherenceError } = await supabase.rpc(
      'get_adherence_rate',
      {
        p_patient_id: user.id,
        p_days: 30,
      },
    );

    if (adherenceError) {
      logServerError(adherenceError, { action: 'MedicationsPage.adherence', userId: user.id });
    }

    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track reminders and adherence.</p>
        </div>

        <section className="mb-6">
          <MedicationCard
            title="Adherence (last 30 days)"
            rate={typeof adherenceRate === 'number' ? adherenceRate : null}
            description="Consistency with your medication schedule."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Pending reminders</h2>
          <MedicationPendingList logs={normalizedLogs} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'MedicationsPage' });
    throw new Error('Unable to load medications at this time.');
  }
}
