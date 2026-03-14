export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 rounded-md bg-muted" />
        <div className="h-8 w-1/2 rounded-md bg-muted" />
        <div className="h-3 w-1/4 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/2 rounded-md bg-muted" />
        <div className="h-4 w-3/4 rounded-md bg-muted" />
        <div className="h-4 w-2/3 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 rounded-md bg-muted" />
        <div className="h-40 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="animate-pulse space-y-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="h-4 w-1/2 rounded-md bg-muted" />
        <div className="h-4 w-1/3 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/4 rounded-md bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
        <div className="h-4 w-1/4 rounded-md bg-muted" />
        <div className="h-10 w-full rounded-md bg-muted" />
      </div>
    </div>
  );
}
