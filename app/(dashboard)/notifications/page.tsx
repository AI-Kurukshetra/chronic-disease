import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logServerError } from '@/lib/utils/errors';
import {
  NotificationsList,
  type NotificationItem,
} from '@/components/notifications/NotificationsList';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Notifications | HealthOS' };
}

export default async function NotificationsPage() {
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
      .from('notifications')
      .select('id, type, channel, status, payload, scheduled_at, sent_at, created_at')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logServerError(error, { action: 'NotificationsPage.load', userId: user.id });
    }

    const items = (data as NotificationItem[] | null) ?? [];
    const unreadCount = items.filter((n) => n.status === 'delivered' || n.status === 'sent').length;
    const failedCount = items.filter((n) => n.status === 'failed').length;

    return (
      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your medication reminders, alerts, and health updates.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{items.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Delivered
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground">{unreadCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Failed
            </p>
            <p
              className={`mt-2 text-3xl font-bold ${failedCount > 0 ? 'text-destructive' : 'text-foreground'}`}
            >
              {failedCount}
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Recent notifications</h2>
          <NotificationsList items={items} />
        </section>
      </main>
    );
  } catch (error) {
    logServerError(error, { action: 'NotificationsPage' });
    throw new Error('Unable to load notifications at this time.');
  }
}
