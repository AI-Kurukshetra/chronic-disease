import Link from 'next/link';

export interface ProviderPanelRow {
  patient_id: string;
  patient_name: string;
  risk_level: string;
  last_active: string | null;
  open_alerts: number;
  adherence_rate: number;
}

export interface ProviderPatientsTableProps {
  rows: ProviderPanelRow[];
}

export function ProviderPatientsTable({ rows }: ProviderPatientsTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">No patients assigned yet.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Add patients to your panel to start monitoring care plans.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Risk level</th>
            <th className="px-4 py-3">Last active</th>
            <th className="px-4 py-3">Open alerts</th>
            <th className="px-4 py-3">Adherence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const risk = row.risk_level?.toLowerCase();
            const riskBadge =
              risk === 'critical'
                ? 'bg-destructive/10 text-destructive'
                : risk === 'high'
                  ? 'bg-warning/10 text-warning'
                  : risk === 'medium'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-success/10 text-success';
            const adherence = Math.min(Math.max(row.adherence_rate ?? 0, 0), 100);
            return (
              <tr
                key={row.patient_id}
                className={`border-t border-border/50 transition-colors duration-200 hover:bg-muted/50 ${
                  index % 2 === 1 ? 'bg-muted/20' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium">
                  <Link className="text-foreground underline" href={`/patients/${row.patient_id}`}>
                    {row.patient_name}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadge}`}>
                    {row.risk_level}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {row.last_active ? new Date(row.last_active).toLocaleString('en-US') : '—'}
                </td>
                <td className="px-4 py-3">
                  {row.open_alerts > 0 ? (
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                      {row.open_alerts} open
                    </span>
                  ) : (
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      None
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${adherence}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{adherence}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
