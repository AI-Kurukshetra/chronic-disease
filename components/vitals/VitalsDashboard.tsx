import { VitalHistoryTable, type VitalHistoryItem } from '@/components/vitals/VitalHistoryTable';
import { VitalSignForm } from '@/components/forms/VitalSignForm';
import { VitalsTrendSection } from '@/components/vitals/VitalsTrendSection';

export interface VitalsDashboardProps {
  patientId: string;
  initialVitals: VitalHistoryItem[];
  alertThresholds?: Record<string, { low?: number; high?: number }> | null | undefined;
}

export function VitalsDashboard({
  patientId,
  initialVitals,
  alertThresholds,
}: VitalsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Vitals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your daily health readings.</p>
      </div>

      <section className="rounded-lg border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl font-semibold text-foreground">Log a new reading</h2>
        <div className="mt-4">
          <VitalSignForm />
        </div>
      </section>

      <VitalsTrendSection patientId={patientId} alertThresholds={alertThresholds} />

      <section>
        <h2 className="mb-3 text-xl font-semibold text-foreground">Recent readings</h2>
        <VitalHistoryTable vitals={initialVitals} alertThresholds={alertThresholds} />
      </section>
    </div>
  );
}
