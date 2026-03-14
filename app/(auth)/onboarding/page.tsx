import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OnboardingForm } from '@/components/forms/OnboardingForm';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Onboarding | HealthOS',
  };
}

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('date_of_birth, phone, timezone')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('primary_condition')
    .eq('profile_id', user.id)
    .single();

  if (patientError) {
    throw patientError;
  }

  const defaultValues = {
    dateOfBirth: profile?.date_of_birth ?? '',
    phone: profile?.phone ?? '',
    timezone: profile?.timezone ?? '',
    primaryCondition: patient?.primary_condition ?? 'type2_diabetes',
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 2 of 5
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`h-2 flex-1 rounded-full ${step <= 2 ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Basic patient information</p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Finish your onboarding
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us a little more so we can personalize your care plan.
        </p>
        <div className="mt-6">
          <OnboardingForm defaultValues={defaultValues} />
        </div>
      </div>
    </main>
  );
}
