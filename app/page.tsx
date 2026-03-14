import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  LineChart,
  MessageSquare,
  Pill,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'HealthOS | AI-Powered Chronic Care Platform',
    description:
      'HealthOS helps patients and care teams stay connected with AI insights, vitals monitoring, and proactive care planning.',
  };
}

export default function RootPage() {
  return (
    <main className="min-h-screen text-foreground">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <HeartPulse className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">HealthOS</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-card transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_60%,rgba(20,184,166,0.1),transparent)]" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> AI-Powered Chronic Care Platform
              </span>
              <h1 className="mt-5 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-6xl">
                Smarter Care for{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Chronic Conditions
                </span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                HealthOS connects patients, providers, and caregivers through AI-driven insights,
                real-time vitals monitoring, and personalised care plans — all in one secure
                platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40"
                >
                  Start Free Today <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  View Demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
                {['HIPAA Compliant', 'Free to start', 'No credit card required'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/5 to-secondary/30 blur-3xl" />
              <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Health Dashboard
                    </p>
                    <p className="text-lg font-bold text-foreground">Patient Overview</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary/15 to-secondary/15 px-3 py-1 text-xs font-semibold text-primary">
                    <Zap className="h-3 w-3" /> AI Active
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: 'Health Score',
                      value: '82',
                      color: 'text-primary',
                      sub: '↑ 4 pts this week',
                      subColor: 'text-success',
                    },
                    {
                      label: 'Adherence',
                      value: '92%',
                      color: 'text-secondary',
                      sub: 'Excellent',
                      subColor: 'text-success',
                    },
                    {
                      label: 'Streak',
                      value: '14d',
                      color: 'text-warning',
                      sub: 'Keep it up!',
                      subColor: 'text-warning',
                    },
                  ].map(({ label, value, color, sub, subColor }) => (
                    <div key={label} className="rounded-xl border border-border bg-background p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </p>
                      <p className={`mt-1 text-2xl font-extrabold ${color}`}>{value}</p>
                      <p className={`text-[10px] font-medium ${subColor}`}>{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Glucose trend (7 days)</span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                      Improving
                    </span>
                  </div>
                  <svg className="mt-3 h-24 w-full" viewBox="0 0 320 96" fill="none">
                    <defs>
                      <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                      <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M8 72 C 55 52, 100 60, 150 38 C 200 16, 250 28, 312 10"
                      fill="none"
                      stroke="url(#heroGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 72 C 55 52, 100 60, 150 38 C 200 16, 250 28, 312 10 L 312 96 L 8 96 Z"
                      fill="url(#heroFill)"
                    />
                    {[8, 60, 112, 162, 214, 264, 312].map((x, i) => {
                      const ys = [72, 52, 60, 38, 16, 28, 10];
                      return <circle key={i} cx={x} cy={ys[i]} r="3" fill="#2563EB" />;
                    })}
                  </svg>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Next Appointment
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Telehealth Visit</p>
                    <p className="text-xs text-muted-foreground">Mar 18 · 2:00 PM</p>
                  </div>
                  <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      AI Summary
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Glucose improving. Continue current plan and increase water intake.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-lg font-bold text-primary">
                    M
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">Maya Thompson</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Type 2 Diabetes · Care plan active
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: '50,000+', label: 'Active Patients', color: 'from-primary/20 to-primary/5' },
              {
                value: '1,200+',
                label: 'Care Providers',
                color: 'from-secondary/20 to-secondary/5',
              },
              {
                value: '98%',
                label: 'Patient Satisfaction',
                color: 'from-success/20 to-success/5',
              },
              { value: '40%', label: 'Fewer ER Visits', color: 'from-warning/20 to-warning/5' },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className={`rounded-2xl bg-gradient-to-br ${color} border border-border p-6 text-center`}
              >
                <p className="text-3xl font-extrabold text-foreground">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Platform Features
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
              Everything your care team needs
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Purpose-built tools for modern chronic disease management.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: 'AI Health Coach',
                desc: 'Personalised daily guidance powered by your lab results, vitals, and activity data. Adapts recommendations in real time.',
                color: 'from-primary/20 to-primary/5',
                iconColor: 'text-primary bg-primary/15',
              },
              {
                icon: Activity,
                title: 'Vitals Monitoring',
                desc: 'Track blood pressure, glucose, SpO₂, heart rate, and more. Configurable alert thresholds notify your care team instantly.',
                color: 'from-secondary/20 to-secondary/5',
                iconColor: 'text-secondary bg-secondary/15',
              },
              {
                icon: Pill,
                title: 'Medication Management',
                desc: 'Smart reminders, adherence tracking, and prescription history. Never miss a dose with push notifications and daily logs.',
                color: 'from-warning/20 to-warning/5',
                iconColor: 'text-warning bg-warning/15',
              },
              {
                icon: Stethoscope,
                title: 'Telehealth & Messaging',
                desc: 'Book video visits, chat with your care team, and share your health logs — all without leaving the app.',
                color: 'from-success/20 to-success/5',
                iconColor: 'text-success bg-success/15',
              },
              {
                icon: LineChart,
                title: 'Predictive Insights',
                desc: 'AI detects early warning patterns and risk factors before they become emergencies, enabling proactive intervention.',
                color: 'from-info/20 to-info/5',
                iconColor: 'text-info bg-info/15',
              },
              {
                icon: CalendarDays,
                title: 'Care Plan Management',
                desc: 'Structured, goal-based care plans with measurable milestones. Patients and providers stay aligned on progress.',
                color: 'from-destructive/10 to-destructive/5',
                iconColor: 'text-destructive bg-destructive/10',
              },
              {
                icon: Users,
                title: 'Family & Caregiver Access',
                desc: 'Invite family members and caregivers with granular permission controls to stay informed without compromising privacy.',
                color: 'from-primary/20 to-secondary/10',
                iconColor: 'text-primary bg-primary/15',
              },
              {
                icon: MessageSquare,
                title: 'Community Forums',
                desc: 'Connect with peers living with the same condition. Share experiences, tips, and encouragement in a moderated space.',
                color: 'from-secondary/20 to-primary/5',
                iconColor: 'text-secondary bg-secondary/15',
              },
              {
                icon: ShieldCheck,
                title: 'Healthcare-grade Security',
                desc: 'HIPAA-compliant, end-to-end encrypted, with full audit logs and role-based access control across all user types.',
                color: 'from-success/15 to-success/5',
                iconColor: 'text-success bg-success/15',
              },
            ].map(({ icon: Icon, title, desc, color, iconColor }) => (
              <div
                key={title}
                className={`group rounded-2xl border border-border bg-gradient-to-br ${color} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              Simple Onboarding
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
              Up and running in minutes
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              No complicated setup. Start managing your health today.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Sign up as a patient, provider, or caregiver in under 2 minutes.',
              },
              {
                step: '02',
                title: 'Complete your health profile',
                desc: 'Enter your conditions, medications, and goals to personalise your experience.',
              },
              {
                step: '03',
                title: 'Connect your care team',
                desc: 'Invite your doctor or allow your provider to link you to their panel.',
              },
              {
                step: '04',
                title: 'Start tracking & improving',
                desc: 'Log vitals, follow your care plan, and receive AI-powered daily guidance.',
              },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative flex flex-col">
                {i < 3 && (
                  <div className="absolute right-0 top-6 hidden h-0.5 w-1/2 bg-gradient-to-r from-border to-transparent md:block" />
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-extrabold text-white shadow-lg shadow-primary/20">
                  {step}
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three roles ── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
              Built for everyone in the care journey
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Three tailored experiences, one unified platform.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                role: 'Patient',
                emoji: '🧑‍⚕️',
                color: 'from-primary/20 to-primary/5 border-primary/20',
                accentColor: 'text-primary',
                points: [
                  'Personalised AI health coaching',
                  'Daily vitals & symptom logging',
                  'Medication reminders & tracking',
                  'Telehealth visit booking',
                  'Community peer support',
                  'Care plan progress visibility',
                ],
              },
              {
                role: 'Provider',
                emoji: '👨‍⚕️',
                color: 'from-secondary/20 to-secondary/5 border-secondary/20',
                accentColor: 'text-secondary',
                points: [
                  'Patient panel overview',
                  'Real-time alert management',
                  'Care plan creation & editing',
                  'Secure patient messaging',
                  'Lab & vitals trend reports',
                  'Telehealth scheduling',
                ],
              },
              {
                role: 'Admin',
                emoji: '🏥',
                color: 'from-success/15 to-success/5 border-success/20',
                accentColor: 'text-success',
                points: [
                  'Organisation-wide dashboard',
                  'User and role management',
                  'HIPAA audit logs',
                  'Analytics & outcomes reporting',
                  'Billing & subscription control',
                  'System configuration',
                ],
              },
            ].map(({ role, emoji, color, accentColor, points }) => (
              <div
                key={role}
                className={`rounded-2xl border bg-gradient-to-br ${color} p-6 shadow-card`}
              >
                <div className="text-4xl">{emoji}</div>
                <h3 className={`mt-3 text-xl font-extrabold ${accentColor}`}>{role}</h3>
                <ul className="mt-4 space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${accentColor}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Testimonials
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
              Trusted by patients & clinicians
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                quote:
                  'HealthOS completely changed how I manage my diabetes. The AI coach gives me daily tips that actually make sense for my lifestyle.',
                name: 'Maya Thompson',
                role: 'Patient · Type 2 Diabetes',
                rating: 5,
                initials: 'MT',
                color: 'from-primary/20 to-primary/5',
              },
              {
                quote:
                  'As a cardiologist, having real-time vitals and alerts for my panel has reduced unnecessary ER visits by over 35%. Game changer.',
                name: 'Dr. Arjun Patel',
                role: 'Cardiologist · HealthFirst Clinic',
                rating: 5,
                initials: 'AP',
                color: 'from-secondary/20 to-secondary/5',
              },
              {
                quote:
                  'My father has COPD and HealthOS lets me check his vitals and medication adherence remotely. It gives our whole family peace of mind.',
                name: 'Sarah Chen',
                role: 'Caregiver · Family Member',
                rating: 5,
                initials: 'SC',
                color: 'from-success/15 to-success/5',
              },
              {
                quote:
                  'The medication reminders alone have improved my adherence from 60% to 95%. My A1C dropped a full point in three months.',
                name: 'James Wilson',
                role: 'Patient · Hypertension & Diabetes',
                rating: 5,
                initials: 'JW',
                color: 'from-warning/20 to-warning/5',
              },
              {
                quote:
                  'I can now see my entire patient panel at a glance. The predictive alerts have helped me intervene early in several high-risk cases.',
                name: 'Dr. Lisa Rodriguez',
                role: 'Endocrinologist · Metro Health',
                rating: 5,
                initials: 'LR',
                color: 'from-primary/10 to-secondary/10',
              },
              {
                quote:
                  "The community forums connected me with others who have the same condition. I don't feel alone in my health journey anymore.",
                name: 'Priya Sharma',
                role: 'Patient · Rheumatoid Arthritis',
                rating: 5,
                initials: 'PS',
                color: 'from-destructive/10 to-destructive/5',
              },
            ].map(({ quote, name, role, rating, initials, color }) => (
              <div
                key={name}
                className={`rounded-2xl border border-border bg-gradient-to-br ${color} p-6 shadow-card`}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <span key={i} className="text-sm text-warning">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  &quot;{quote}&quot;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold text-foreground">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Compliance ── */}
      <section className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                <Shield className="h-3 w-3" /> Security & Compliance
              </span>
              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
                Healthcare-grade security you can trust
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built from the ground up for the highest standards in healthcare data privacy and
                security.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'HIPAA Compliant',
                    desc: 'Full compliance with all HIPAA regulations for data handling and privacy.',
                  },
                  {
                    title: 'End-to-end Encryption',
                    desc: 'All data encrypted in transit and at rest using AES-256.',
                  },
                  {
                    title: 'Role-based Access Control',
                    desc: 'Granular permissions ensure each user sees only what they should.',
                  },
                  {
                    title: 'Complete Audit Logs',
                    desc: 'Every data access and modification is logged and available for review.',
                  },
                  {
                    title: 'SOC 2 Type II Certified',
                    desc: 'Independently audited security controls and processes.',
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: 'HIPAA',
                  sub: 'Fully Compliant',
                  color: 'from-success/20 to-success/5',
                  iconColor: 'text-success',
                },
                {
                  icon: Shield,
                  title: 'SOC 2',
                  sub: 'Type II Certified',
                  color: 'from-primary/20 to-primary/5',
                  iconColor: 'text-primary',
                },
                {
                  icon: Zap,
                  title: '99.9%',
                  sub: 'Uptime SLA',
                  color: 'from-warning/20 to-warning/5',
                  iconColor: 'text-warning',
                },
                {
                  icon: Activity,
                  title: '< 200ms',
                  sub: 'Avg. Response',
                  color: 'from-secondary/20 to-secondary/5',
                  iconColor: 'text-secondary',
                },
              ].map(({ icon: Icon, title, sub, color, iconColor }) => (
                <div
                  key={title}
                  className={`rounded-2xl border border-border bg-gradient-to-br ${color} p-6 text-center`}
                >
                  <div
                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/50 ${iconColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className={`text-2xl font-extrabold ${iconColor}`}>{title}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-y border-border bg-muted/30">
        <div className="mx-auto w-full max-w-4xl px-4 py-20 md:px-6">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything you need to know before getting started.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            {[
              {
                q: 'Is HealthOS suitable for all chronic conditions?',
                a: 'Yes. HealthOS supports a wide range of chronic conditions including Type 1 & 2 Diabetes, Hypertension, Heart Disease, COPD, Asthma, Rheumatoid Arthritis, and many more. The platform adapts to your specific condition.',
              },
              {
                q: 'How does the AI health coach work?',
                a: 'The AI coach analyses your vitals, medication logs, food diary, exercise data, and lab results to generate personalised daily guidance. It learns your patterns over time and adapts recommendations accordingly.',
              },
              {
                q: 'Can my doctor see my health data?',
                a: 'Only if you choose to share it. You have full control over what your care team can access. Providers can only view data for patients who have explicitly connected with them.',
              },
              {
                q: 'Is there a free plan?',
                a: 'Yes! Patients can sign up and start tracking their health for free. Advanced AI features, telehealth visits, and unlimited caregiver connections are available in premium plans.',
              },
              {
                q: 'How is my data kept secure?',
                a: 'All data is encrypted at rest and in transit. We are fully HIPAA compliant, SOC 2 Type II certified, and conduct regular third-party security audits. We never sell your data.',
              },
              {
                q: 'Can I use HealthOS on mobile?',
                a: 'HealthOS is a fully responsive web application that works seamlessly on any device. Native iOS and Android apps are coming soon.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="font-semibold text-foreground">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-secondary p-12 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
            <div className="relative">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <HeartPulse className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold text-white">
                Take control of your health today
              </h2>
              <p className="mt-3 text-lg text-white/80">
                Join 50,000+ patients and 1,200+ providers managing chronic care smarter with
                HealthOS.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Start Free Today <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Provider Login
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/60">
                Free to start · No credit card required · HIPAA compliant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                  <HeartPulse className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">HealthOS</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                AI-powered chronic disease management for patients, providers, and caregivers.
                Improving health outcomes through smarter, connected care.
              </p>
              <div className="mt-4 flex gap-3">
                {['HIPAA', 'SOC 2', 'ADA'].map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">Product</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {['Features', 'How it works', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <button type="button" className="transition-colors hover:text-foreground">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* For users */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                For Users
              </p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {['Patients', 'Providers', 'Caregivers', 'Administrators', 'Integrations'].map(
                  (item) => (
                    <li key={item}>
                      <button type="button" className="transition-colors hover:text-foreground">
                        {item}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground">Company</p>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                {['About us', 'Blog', 'Careers', 'Press', 'Contact'].map((item) => (
                  <li key={item}>
                    <button type="button" className="transition-colors hover:text-foreground">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} HealthOS, Inc. All rights reserved.</p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className="transition-colors hover:text-foreground"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
