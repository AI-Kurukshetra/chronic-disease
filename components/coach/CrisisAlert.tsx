export interface CrisisAlertProps {
  onDismiss: () => void;
}

export function CrisisAlert({ onDismiss }: CrisisAlertProps) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive-light p-6 text-sm text-destructive">
      <h2 className="text-base font-semibold">Immediate support recommended</h2>
      <p className="mt-2">
        If you are in danger, call 911. You can also reach the 988 Suicide and Crisis Lifeline for
        free, confidential support.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 rounded-lg border border-destructive/40 bg-card px-3 py-2 text-xs font-semibold text-destructive transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
      >
        Dismiss
      </button>
    </div>
  );
}
