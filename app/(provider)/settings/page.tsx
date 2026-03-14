import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Settings | HealthOS',
  };
}

export default async function ProviderSettingsPage() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
    if (role.toLowerCase() !== 'provider') {
      redirect('/login');
    }

    return (
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure notification preferences and availability.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose how you want to be alerted.</p>
            <div className="mt-4 space-y-3 text-sm text-foreground">
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                Email alerts
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                SMS alerts
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  Off
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">Availability</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set your care team schedule windows.
            </p>
            <div className="mt-4 space-y-3 text-sm text-foreground">
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                Mon–Fri · 9:00 AM – 5:00 PM
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                Telehealth slots · 6 per day
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'ProviderSettingsPage' });
    throw new Error('Unable to load settings at this time.');
  }
}
