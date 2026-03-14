import { ProgressSummary, type PatientSummary } from '@/components/shared/ProgressSummary';
import { ProgressTrends } from '@/components/shared/ProgressTrends';

export interface ProgressDashboardProps {
  patientId: string;
  summary: PatientSummary | null;
}

export function ProgressDashboard({ patientId, summary }: ProgressDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your health trends and goals overview.</p>
      </div>

      <ProgressSummary summary={summary} />
      <ProgressTrends patientId={patientId} />
    </div>
  );
}
