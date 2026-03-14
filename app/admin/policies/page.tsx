export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Policies | HealthOS' };
}

export default async function AdminPoliciesPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) redirect('/login');
    const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
    if (role.toLowerCase() !== 'admin') redirect('/login');

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Policies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review platform governance and access policies.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-3">
            {[
              ['Data retention policy', 'Updated 3 months ago'],
              ['Telehealth consent policy', 'Updated 1 month ago'],
              ['Provider onboarding checklist', 'Updated 2 weeks ago'],
            ].map((row) => (
              <div
                key={row[0]}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-semibold text-foreground">{row[0]}</span>
                <span className="text-xs text-muted-foreground">{row[1]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Policy acknowledgements</h2>
            <p className="text-sm text-muted-foreground">Completion status by role.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Providers', '92% complete'],
                ['Patients', '84% complete'],
                ['Caregivers', '76% complete'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-sm font-semibold text-foreground">{row[0]}</span>
                  <span className="text-xs text-muted-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Upcoming reviews</h2>
            <p className="text-sm text-muted-foreground">Scheduled policy reviews.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Incident response plan', 'Due in 12 days'],
                ['Data access policy', 'Due in 21 days'],
                ['AI usage policy', 'Due in 30 days'],
              ].map((row) => (
                <div
                  key={row[0]}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-sm font-semibold text-foreground">{row[0]}</span>
                  <span className="text-xs text-muted-foreground">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminPoliciesPage' });
    throw new Error('Unable to load policies.');
  }
}

