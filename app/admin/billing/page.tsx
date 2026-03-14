export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Admin Billing | HealthOS' };
}

export default async function AdminBillingPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Subscription health and revenue indicators.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Monthly recurring revenue', '$48,200'],
            ['Active subscriptions', '42'],
            ['Failed payments', '3'],
          ].map((item) => (
            <div key={item[0]} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item[0]}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{item[1]}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-foreground">Recent invoices</h2>
          <div className="mt-4 space-y-3">
            {[
              ['HealthOS Plan - March', 'Paid', '$1,200'],
              ['Enterprise add-on', 'Pending', '$450'],
              ['SMS overage', 'Paid', '$90'],
            ].map((row) => (
              <div
                key={row[0]}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{row[0]}</p>
                  <p className="text-xs text-muted-foreground">{row[1]}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{row[2]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground">Revenue breakdown</h2>
            <p className="text-sm text-muted-foreground">Primary revenue sources.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Subscriptions', '$32,800'],
                ['Telehealth visits', '$9,400'],
                ['Premium coaching', '$6,000'],
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
            <h2 className="text-xl font-semibold text-foreground">Dunning status</h2>
            <p className="text-sm text-muted-foreground">Recovery workflow progress.</p>
            <div className="mt-4 space-y-3">
              {[
                ['Retrying payment', '2 accounts'],
                ['Past due 7+ days', '1 account'],
                ['Cancelled last 30 days', '3 accounts'],
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
    logServerError(err, { action: 'AdminBillingPage' });
    throw new Error('Unable to load billing data.');
  }
}

