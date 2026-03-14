'use client';

export default function OnboardingError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-destructive/20 bg-card p-8 shadow-card">
        <h1 className="text-xl font-semibold text-destructive">Unable to load onboarding</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please refresh the page or try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
