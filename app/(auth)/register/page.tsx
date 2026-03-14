import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/forms/RegisterForm';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Register | HealthOS',
  };
}

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 1 of 5
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`h-2 flex-1 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Account creation</p>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create your HealthOS account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start with the basics and we will guide you through onboarding next.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="font-medium text-foreground underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
