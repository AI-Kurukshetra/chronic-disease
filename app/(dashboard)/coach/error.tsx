'use client';

export default function CoachError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <div className="rounded-lg border border-destructive/20 bg-card p-6 shadow-card">
        <h1 className="text-lg font-semibold text-destructive">Unable to load AI coach</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
