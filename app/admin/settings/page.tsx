export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Settings | HealthOS' };
}

export default async function AdminSettingsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform preferences and access controls.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </p>
            <p className="mt-2 text-sm text-foreground">2FA enforced · MFA reminders enabled</p>
            <p className="mt-2 text-xs text-muted-foreground">Last updated 3 days ago.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notifications
            </p>
            <p className="mt-2 text-sm text-foreground">Critical alerts → SMS, Email</p>
            <p className="mt-2 text-xs text-muted-foreground">Reminder cadence: 2 hours.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Data retention
            </p>
            <p className="mt-2 text-sm text-foreground">Clinical data retained for 7 years</p>
            <p className="mt-2 text-xs text-muted-foreground">HIPAA compliant archival policy.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Integrations
            </p>
            <p className="mt-2 text-sm text-foreground">Supabase · Stripe · Twilio · Resend</p>
            <p className="mt-2 text-xs text-muted-foreground">Last sync 1 hour ago.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Admin preferences</h2>
          <p className="text-sm text-muted-foreground">Default controls for platform operations.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['Default care plan template', 'Chronic Care - Standard'],
              ['Alert escalation window', '30 minutes'],
              ['Provider verification SLA', '48 hours'],
              ['Weekly summary report', 'Enabled'],
            ].map((row) => (
              <div key={row[0]} className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-xs text-muted-foreground">{row[0]}</p>
                <p className="text-sm font-semibold text-foreground">{row[1]}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  } catch (err) {
    logServerError(err, { action: 'AdminSettingsPage' });
    throw new Error('Unable to load settings.');
  }
}

