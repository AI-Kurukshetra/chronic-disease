'use client';

export default function Error() {
  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <h1 className="text-2xl font-semibold">Nutrition unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please refresh or try again later.</p>
    </div>
  );
}
