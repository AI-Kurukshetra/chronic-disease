import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import { CaregiverInviteForm } from '@/components/caregivers/CaregiverInviteForm';
import { CaregiverList, type CaregiverItem } from '@/components/caregivers/CaregiverList';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Caregivers | HealthOS' };
}

export default async function CaregiversPage() {
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
      .from('caregivers')
      .select('id, caregiver_email, caregiver_name, relationship, status, invited_at, accepted_at')
      .eq('patient_id', user.id)
      .order('invited_at', { ascending: false });

    if (error) {
      logServerError(error, { action: 'CaregiversPage.load', userId: user.id });
    }

    const items = (data as CaregiverItem[] | null) ?? [];
    const activeCount = items.filter((c) => c.status === 'active').length;

    return (
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Family & Caregivers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite trusted family members or caregivers to view your health progress.
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-800">
            <strong>Privacy note:</strong> Caregivers you invite can view your vitals, medications,
            and progress — but cannot make changes on your behalf. You can revoke access at any
            time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active caregivers
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total invited
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{items.length}</p>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Invite a caregiver</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            They will receive an email invitation to access your health dashboard.
          </p>
          <CaregiverInviteForm />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Your caregivers</h2>
          <CaregiverList items={items} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'CaregiversPage' });
    throw new Error('Unable to load caregivers at this time.');
  }
}
