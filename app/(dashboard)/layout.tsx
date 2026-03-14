import type { ReactNode } from 'react';
import { Suspense } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  MessageCircle,
  Pill,
  Salad,
  Stethoscope,
  ThermometerSun,
  Users,
} from 'lucide-react';
import { AuthedTopNav } from '@/components/shared/AuthedTopNav';
import { Sidebar } from '@/components/shared/Sidebar';
import { SidebarNav } from '@/components/shared/SidebarNav';
import { PageLoading } from '@/components/shared/PageLoading';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <section className="min-h-screen text-foreground">
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarNav
            items={[
              {
                href: '/dashboard',
                label: 'Dashboard',
                icon: <LayoutDashboard className="h-4 w-4" />,
              },
              { href: '/vitals', label: 'Vitals', icon: <HeartPulse className="h-4 w-4" /> },
              {
                href: '/symptoms',
                label: 'Symptoms',
                icon: <ThermometerSun className="h-4 w-4" />,
              },
              { href: '/medications', label: 'Medications', icon: <Pill className="h-4 w-4" /> },
              { href: '/nutrition', label: 'Nutrition', icon: <Salad className="h-4 w-4" /> },
              { href: '/exercise', label: 'Exercise', icon: <Activity className="h-4 w-4" /> },
              { href: '/progress', label: 'Progress', icon: <BarChart3 className="h-4 w-4" /> },
              {
                href: '/assessments',
                label: 'Assessments',
                icon: <ClipboardList className="h-4 w-4" />,
              },
              { href: '/coach', label: 'AI Coach', icon: <BrainCircuit className="h-4 w-4" /> },
              {
                href: '/telehealth',
                label: 'Telehealth',
                icon: <Stethoscope className="h-4 w-4" />,
              },
              {
                href: '/telehealth',
                label: 'Appointments',
                icon: <CalendarDays className="h-4 w-4" />,
              },
              { href: '/education', label: 'Education', icon: <BookOpen className="h-4 w-4" /> },
              {
                href: '/community',
                label: 'Community',
                icon: <MessageCircle className="h-4 w-4" />,
              },
              { href: '/caregivers', label: 'Caregivers', icon: <Users className="h-4 w-4" /> },
              {
                href: '/notifications',
                label: 'Notifications',
                icon: <Bell className="h-4 w-4" />,
              },
            ]}
          />
        </Sidebar>
        <div className="flex min-h-screen flex-1 flex-col">
          <AuthedTopNav homeHref="/dashboard" homeLabel="HealthOS" roleLabel="Patient" />
          <Suspense fallback={<PageLoading />}>
            <div className="flex-1">{children}</div>
          </Suspense>
        </div>
      </div>
    </section>
  );
}
