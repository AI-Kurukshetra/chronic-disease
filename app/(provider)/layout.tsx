import type { ReactNode } from 'react';
import { Suspense } from 'react';
import {
  Bell,
  CalendarDays,
  ClipboardList,
  MessageSquare,
  Settings,
  Users,
  ChartLine,
  LayoutDashboard,
} from 'lucide-react';
import { AuthedTopNav } from '@/components/shared/AuthedTopNav';
import { Sidebar } from '@/components/shared/Sidebar';
import { SidebarNav } from '@/components/shared/SidebarNav';
import { HealthLoader } from '@/components/shared/HealthLoader';

interface ProviderLayoutProps {
  children: ReactNode;
}

export const dynamic = 'force-dynamic';

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  return (
    <section className="min-h-screen text-foreground">
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarNav
            items={[
              {
                href: '/overview',
                label: 'Overview',
                icon: <LayoutDashboard className="h-4 w-4" />,
              },
              { href: '/patients', label: 'Patients', icon: <Users className="h-4 w-4" /> },
              { href: '/alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
              {
                href: '/care-plans',
                label: 'Care Plans',
                icon: <ClipboardList className="h-4 w-4" />,
              },
              { href: '/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
              { href: '/schedule', label: 'Schedule', icon: <CalendarDays className="h-4 w-4" /> },
              { href: '/reports', label: 'Reports', icon: <ChartLine className="h-4 w-4" /> },
              { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
            ]}
          />
        </Sidebar>
        <div className="flex min-h-screen flex-1 flex-col">
          <AuthedTopNav homeHref="/patients" homeLabel="Care Team Portal" roleLabel="Provider" />
          <Suspense
            fallback={
              <HealthLoader
                icon="🫀"
                message="Loading provider portal…"
                submessage="Syncing patient panel"
              />
            }
          >
            <div className="flex-1">{children}</div>
          </Suspense>
        </div>
      </div>
    </section>
  );
}
