export interface NotificationItem {
  id: string;
  type: string;
  channel: string;
  status: string;
  payload: Record<string, unknown>;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface NotificationsListProps {
  items: NotificationItem[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800',
    sent: 'bg-blue-100 text-blue-800',
    queued: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  );
}

function ChannelIcon({ channel }: { channel: string }) {
  const icons: Record<string, string> = {
    in_app: '🔔',
    push: '📱',
    sms: '💬',
    email: '✉️',
  };
  return <span aria-label={channel}>{icons[channel] ?? '📩'}</span>;
}

function getNotificationTitle(item: NotificationItem): string {
  if (item.payload?.title && typeof item.payload.title === 'string') {
    return item.payload.title;
  }
  return item.type.replace(/_/g, ' ');
}

function getNotificationBody(item: NotificationItem): string {
  if (item.payload?.body && typeof item.payload.body === 'string') {
    return item.payload.body;
  }
  if (item.payload?.message && typeof item.payload.message === 'string') {
    return item.payload.message;
  }
  return '--';
}

export function NotificationsList({ items }: NotificationsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-12 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-card transition-colors hover:bg-muted/40"
        >
          <span className="mt-0.5 text-xl" aria-hidden>
            <ChannelIcon channel={item.channel} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold capitalize text-foreground">
                {getNotificationTitle(item)}
              </p>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {getNotificationBody(item)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.sent_at
                ? `Sent ${new Date(item.sent_at).toLocaleString('en-US')}`
                : item.scheduled_at
                  ? `Scheduled ${new Date(item.scheduled_at).toLocaleString('en-US')}`
                  : `Created ${new Date(item.created_at).toLocaleString('en-US')}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
