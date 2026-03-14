import type { Metadata } from 'next';
import { LoginForm } from '@/components/forms/LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Login | HealthOS',
  };
}

export default function Page() {
  return (
    <main className="min-h-screen text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-12 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.2),_transparent_55%)]" />
          <div className="relative max-w-md space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              HealthOS
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back to your AI-powered care hub.
            </h1>
            <p className="text-base text-muted-foreground">
              Access your vitals, medication adherence, and care plan insights in one secure
              workspace.
            </p>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="grid gap-3">
                <div className="rounded-xl border border-border bg-card p-3 shadow-card">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Health score</span>
                    <span className="rounded-full bg-success-light px-2 py-0.5 text-success">
                      Stable
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-foreground">82</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 shadow-card">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Vitals trend</span>
                    <span>Last 7 days</span>
                  </div>
                  <svg className="mt-2 h-16 w-full" viewBox="0 0 220 60" fill="none">
                    <defs>
                      <linearGradient id="loginTrend" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M6 44 C 40 20, 80 28, 120 16 C 160 6, 190 10, 214 8"
                      stroke="url(#loginTrend)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-3 shadow-card">
                    <p className="text-xs text-muted-foreground">Adherence</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">92%</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 shadow-card">
                    <p className="text-xs text-muted-foreground">Next visit</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Mar 18 · 2 PM</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Preview: Patient dashboard insights
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card/80 p-8 shadow-card backdrop-blur">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Login</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in with your HealthOS account to continue.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
