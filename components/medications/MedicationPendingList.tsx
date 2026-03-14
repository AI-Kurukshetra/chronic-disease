import { MedicationLogForm } from '@/components/medications/MedicationLogForm';

export interface PendingMedicationLog {
  id: string;
  scheduled_at: string;
  prescriptions: {
    id: string;
    dosage: string;
    frequency: string;
    medications: { name: string } | null;
  } | null;
}

export interface MedicationPendingListProps {
  logs: PendingMedicationLog[];
}

export function MedicationPendingList({ logs }: MedicationPendingListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-12 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M7 7h10v10H7z" />
          <path d="M10 4h4v3h-4z" />
        </svg>
        <p className="text-sm text-muted-foreground">No pending medication reminders right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const medicationName = log.prescriptions?.medications?.name ?? 'Medication';
        const dosage = log.prescriptions?.dosage ?? '';
        const frequency = log.prescriptions?.frequency ?? '';

        return (
          <div
            key={log.id}
            className="rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{medicationName}</p>
                <p className="text-sm text-muted-foreground">
                  {dosage} {frequency}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Scheduled: {new Date(log.scheduled_at).toLocaleString('en-US')}
                </p>
              </div>
              {log.prescriptions && <MedicationLogForm prescriptionId={log.prescriptions.id} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
