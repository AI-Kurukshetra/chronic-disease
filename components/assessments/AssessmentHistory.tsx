export interface AssessmentHistoryItem {
  id: string;
  type: string;
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  phq9: 'PHQ-9 (Depression)',
  gad7: 'GAD-7 (Anxiety)',
  risk: 'Risk Assessment',
};

const MAX_SCORES: Record<string, number> = {
  phq9: 27,
  gad7: 21,
  risk: 100,
};

function getInterpretation(type: string, score: number): string {
  if (type === 'phq9') {
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Mod. severe';
    return 'Severe';
  }
  if (type === 'gad7') {
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    return 'Severe';
  }
  return '--';
}

export function AssessmentHistory({ items }: { items: AssessmentHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-10 text-center">
        <p className="text-sm text-muted-foreground">No assessments completed yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Assessment</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Interpretation</th>
            <th className="px-4 py-3">Completed</th>
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
              <td className="px-4 py-3 font-medium text-foreground">
                {TYPE_LABELS[item.type] ?? item.type}
              </td>
              <td className="px-4 py-3 text-foreground">
                {item.score != null ? `${item.score} / ${MAX_SCORES[item.type] ?? '?'}` : '--'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.score != null ? getInterpretation(item.type, item.score) : '--'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.completed_at
                  ? new Date(item.completed_at).toLocaleDateString('en-US')
                  : new Date(item.created_at).toLocaleDateString('en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
