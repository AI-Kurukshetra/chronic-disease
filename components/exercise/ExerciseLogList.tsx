import { ACTIVITY_LABELS, type ActivityType } from '@/lib/validations/exercise.schema';

export interface ExerciseLogItem {
  id: string;
  activity_type: string;
  duration_minutes: number;
  calories: number | null;
  logged_at: string;
}

export interface ExerciseLogListProps {
  items: ExerciseLogItem[];
}

export function ExerciseLogList({ items }: ExerciseLogListProps) {
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
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <p className="text-sm text-muted-foreground">No activities logged yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Activity</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Calories</th>
            <th className="px-4 py-3">Logged</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className={`border-t border-border/50 text-sm text-foreground transition-colors duration-100 hover:bg-muted/50 ${
                index % 2 === 1 ? 'bg-muted/20' : ''
              }`}
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {ACTIVITY_LABELS[item.activity_type as ActivityType] ?? item.activity_type}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{item.duration_minutes} min</td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.calories != null ? `${item.calories} kcal` : '--'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(item.logged_at).toLocaleString('en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
