export interface SymptomLogItem {
  id: string;
  symptom: string;
  severity: number;
  notes: string | null;
  recorded_at: string;
}

export interface SymptomLogListProps {
  items: SymptomLogItem[];
}

function SeverityBadge({ severity }: { severity: number }) {
  const color =
    severity <= 3
      ? 'bg-green-100 text-green-800'
      : severity <= 6
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {severity}/10
    </span>
  );
}

export function SymptomLogList({ items }: SymptomLogListProps) {
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
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
        </svg>
        <p className="text-sm text-muted-foreground">No symptoms logged yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Symptom</th>
            <th className="px-4 py-3">Severity</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3">Recorded</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={`border-t border-border/50 text-sm transition-colors duration-100 hover:bg-muted/50 ${
                index % 2 === 1 ? 'bg-muted/20' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium capitalize text-foreground">{item.symptom}</td>
              <td className="px-4 py-3">
                <SeverityBadge severity={item.severity} />
              </td>
              <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                {item.notes ?? '--'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(item.recorded_at).toLocaleString('en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
