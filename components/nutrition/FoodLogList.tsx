export interface FoodLogListItem {
  id: string;
  meal_type: string;
  description: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  logged_at: string;
}

export interface FoodLogListProps {
  items: FoodLogListItem[];
}

export function FoodLogList({ items }: FoodLogListProps) {
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
          <path d="M5 4h14v16H5z" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
        </svg>
        <p className="text-sm text-muted-foreground">No meals logged yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Meal</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Macros</th>
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
              <td className="px-4 py-3 font-medium capitalize text-foreground">{item.meal_type}</td>
              <td className="px-4 py-3 text-foreground">{item.description}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.calories ?? '--'} cal · {item.protein_g ?? '--'}p · {item.carbs_g ?? '--'}c ·{' '}
                {item.fat_g ?? '--'}f
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
