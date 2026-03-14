export interface AppointmentListItem {
  id: string;
  appointment_type: 'telehealth' | 'in_person';
  status: string;
  scheduled_at: string;
  duration_minutes: number | null;
  meeting_url: string | null;
  location: string | null;
}

export interface AppointmentListProps {
  items: AppointmentListItem[];
}

export function AppointmentList({ items }: AppointmentListProps) {
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
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
        </svg>
        <p className="text-sm text-muted-foreground">No appointments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {item.appointment_type === 'telehealth' ? 'Telehealth' : 'In-person'} ·{' '}
                {item.status}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(item.scheduled_at).toLocaleString('en-US')}
                {item.duration_minutes ? ` · ${item.duration_minutes} min` : ''}
              </p>
            </div>
            {item.meeting_url && (
              <a
                className="text-sm font-medium text-primary underline"
                href={item.meeting_url}
                target="_blank"
                rel="noreferrer"
              >
                Join link
              </a>
            )}
          </div>
          {item.location && <p className="mt-2 text-sm text-muted-foreground">{item.location}</p>}
        </div>
      ))}
    </div>
  );
}
