import { SkeletonForm } from '@/components/shared/Skeletons';

export default function OnboardingLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-card">
        <SkeletonForm />
      </div>
    </main>
  );
}
