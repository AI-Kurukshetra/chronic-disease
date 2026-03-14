export interface MedicationCardProps {
  title: string;
  rate: number | null;
  description?: string;
}

function getRateTone(rate: number | null): { color: string; label: string } {
  if (rate === null || Number.isNaN(rate)) {
    return { color: 'hsl(var(--muted-foreground))', label: 'Not available' };
  }
  if (rate >= 80) {
    return { color: 'hsl(var(--success))', label: 'On track' };
  }
  if (rate >= 60) {
    return { color: 'hsl(var(--warning))', label: 'Needs attention' };
  }
  return { color: 'hsl(var(--destructive))', label: 'At risk' };
}

export function MedicationCard({ title, rate, description }: MedicationCardProps) {
  const tone = getRateTone(rate);
  const percentage = typeof rate === 'number' ? Math.max(0, Math.min(100, rate)) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="mb-3 flex items-end justify-between">
        <p
          className={`text-3xl font-bold tabular-nums ${rate === null ? 'text-muted-foreground' : ''}`}
        >
          {rate === null ? '—' : `${rate}%`}
        </p>
        <span className="text-xs font-medium text-muted-foreground">{tone.label}</span>
      </div>
      <div className="w-full rounded-full bg-muted">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: tone.color }}
        />
      </div>
    </div>
  );
}
