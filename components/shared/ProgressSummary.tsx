export interface PatientSummary {
  latest_glucose: number | null;
  latest_bp_systolic: number | null;
  latest_bp_diastolic: number | null;
  latest_weight: number | null;
  adherence_rate_30d: number | null;
  open_alerts: number | null;
  goals_active: number | null;
  goals_achieved: number | null;
}

export interface ProgressSummaryProps {
  summary: PatientSummary | null;
}

export function ProgressSummary({ summary }: ProgressSummaryProps) {
  const cards = [
    {
      label: 'Latest glucose',
      value: summary?.latest_glucose ?? null,
      unit: 'mg/dL',
    },
    {
      label: 'Latest blood pressure',
      value:
        summary?.latest_bp_systolic && summary?.latest_bp_diastolic
          ? `${summary.latest_bp_systolic}/${summary.latest_bp_diastolic}`
          : null,
      unit: 'mmHg',
    },
    {
      label: 'Latest weight',
      value: summary?.latest_weight ?? null,
      unit: 'kg',
    },
    {
      label: 'Adherence (30d)',
      value: summary?.adherence_rate_30d ?? null,
      unit: '%',
    },
    {
      label: 'Open alerts',
      value: summary?.open_alerts ?? null,
      unit: '',
    },
    {
      label: 'Active goals',
      value: summary?.goals_active ?? null,
      unit: '',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-6 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">
            {card.value !== null && card.value !== undefined && card.value !== ''
              ? `${card.value} ${card.unit}`.trim()
              : 'Not available'}
          </p>
        </div>
      ))}
    </section>
  );
}
