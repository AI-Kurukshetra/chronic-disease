export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Users | HealthOS' };
}

export default async function AdminUsersPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review platform users and verification status.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">New signups</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">12</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Providers pending
              </p>
              <p className="mt-2 text-2xl font-semibold text-warning">3</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Disabled accounts
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">1</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Most active cohort
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">Type 2 Diabetes</p>
              <p className="mt-1 text-xs text-muted-foreground">Avg 4.6 check-ins / week</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Top referral source
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">Care Team Network</p>
              <p className="mt-1 text-xs text-muted-foreground">32% of new signups</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-4 bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Last active</span>
            </div>
            {[
              ['Sarah Chen', 'Provider', 'Verified', '2h ago'],
              ['Emily Davis', 'Patient', 'Active', '5h ago'],
              ['David Martinez', 'Patient', 'Active', '1d ago'],
              ['Patricia Garcia', 'Patient', 'Active', '2d ago'],
            ].map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-4 border-t border-border/60 px-4 py-3 text-sm text-foreground"
              >
                <span>{row[0]}</span>
                <span className="text-muted-foreground">{row[1]}</span>
                <span>{row[2]}</span>
                <span className="text-muted-foreground">{row[3]}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminUsersPage' });
    throw new Error('Unable to load admin users.');
  }
}

