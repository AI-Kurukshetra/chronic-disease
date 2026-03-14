export interface VitalHistoryItem {
  id: string;
  type: string;
  value: number;
  unit: string;
  recorded_at: string;
  alert_triggered: boolean;
}

export interface VitalHistoryTableProps {
  vitals: VitalHistoryItem[];
  alertThresholds?: Record<string, { low?: number; high?: number }> | null | undefined;
}

type DotStatus = 'success' | 'warning' | 'destructive';

function getDotStatus(
  vital: VitalHistoryItem,
  thresholds?: Record<string, { low?: number; high?: number }> | null,
): DotStatus {
  if (vital.alert_triggered) {
    return 'destructive';
  }

  const threshold = thresholds?.[vital.type];
  if (!threshold) {
    return 'success';
  }

  if (threshold.high !== undefined && vital.value >= threshold.high) {
    return 'destructive';
  }
  if (threshold.low !== undefined && vital.value <= threshold.low) {
    return 'destructive';
  }
  if (threshold.high !== undefined && vital.value >= threshold.high * 0.9) {
    return 'warning';
  }
  if (threshold.low !== undefined && vital.value <= threshold.low * 1.1) {
    return 'warning';
  }

  return 'success';
}

export function VitalHistoryTable({ vitals, alertThresholds }: VitalHistoryTableProps) {
  if (vitals.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-12 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 12h6l2-4 2 8 2-4h4" />
          <rect x="3" y="4" width="18" height="16" rx="2" />
        </svg>
        <p className="text-sm text-muted-foreground">No vitals logged yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Alert</th>
          </tr>
        </thead>
        <tbody>
          {vitals.map((vital, index) => {
            const status = getDotStatus(vital, alertThresholds);
            return (
              <tr
                key={vital.id}
                className={`border-t border-border/50 text-sm text-foreground transition-colors duration-100 hover:bg-muted/50 ${
                  index % 2 === 1 ? 'bg-muted/20' : ''
                }`}
              >
                <td className="px-4 py-3">{new Date(vital.recorded_at).toLocaleString('en-US')}</td>
                <td className="px-4 py-3 capitalize">{vital.type.replaceAll('_', ' ')}</td>
                <td className="px-4 py-3 tabular-nums">
                  {vital.value} {vital.unit}
                </td>
                <td className="px-4 py-3">
                  {status === 'destructive' ? (
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
                    </span>
                  ) : status === 'warning' ? (
                    <span className="inline-flex h-3 w-3 rounded-full bg-warning" />
                  ) : (
                    <span className="inline-flex h-3 w-3 rounded-full bg-success" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
