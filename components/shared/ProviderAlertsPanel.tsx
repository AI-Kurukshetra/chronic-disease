'use client';

import { useRealtimeAlerts, type EmergencyAlert } from '@/lib/hooks/useRealtimeAlerts';

export interface ProviderAlertsPanelProps {
  providerId: string;
  initialAlerts: EmergencyAlert[];
}

export function ProviderAlertsPanel({ providerId, initialAlerts }: ProviderAlertsPanelProps) {
  const alerts = useRealtimeAlerts(providerId, initialAlerts);

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <p className="text-sm text-muted-foreground">No open alerts right now.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          We will notify you when something needs attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const severity = alert.severity?.toLowerCase();
        const severityBadge =
          severity === 'critical'
            ? 'bg-destructive/10 text-destructive'
            : severity === 'warning'
              ? 'bg-warning/10 text-warning'
              : 'bg-success/10 text-success';

        return (
          <div key={alert.id} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityBadge}`}>
                {alert.severity}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(alert.created_at).toLocaleString('en-US')}
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground">{alert.message}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">Status: {alert.status}</span>
              <span className="rounded-full bg-muted px-2 py-1">
                Patient: {alert.patient_id.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
