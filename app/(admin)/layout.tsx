import type { ReactNode } from 'react';
import { Suspense } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardCheck,
  Cog,
  CreditCard,
  FileText,
  LifeBuoy,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AuthedTopNav } from '@/components/shared/AuthedTopNav';
import { Sidebar } from '@/components/shared/Sidebar';
import { SidebarNav } from '@/components/shared/SidebarNav';
import { HealthLoader } from '@/components/shared/HealthLoader';

interface AdminLayoutProps {
  children: ReactNode;
}

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <section className="min-h-screen text-foreground">
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarNav
            items={[
              { href: '/admin', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { href: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
              { href: '/admin/alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
              {
                href: '/admin/compliance',
                label: 'Compliance',
                icon: <ShieldCheck className="h-4 w-4" />,
              },
              { href: '/admin/audit', label: 'Audit Logs', icon: <FileText className="h-4 w-4" /> },
              {
                href: '/admin/billing',
                label: 'Billing',
                icon: <CreditCard className="h-4 w-4" />,
              },
              { href: '/admin/quality', label: 'Quality', icon: <Activity className="h-4 w-4" /> },
              {
                href: '/admin/policies',
                label: 'Policies',
                icon: <ClipboardCheck className="h-4 w-4" />,
              },
              { href: '/admin/support', label: 'Support', icon: <LifeBuoy className="h-4 w-4" /> },
              { href: '/admin/settings', label: 'Settings', icon: <Cog className="h-4 w-4" /> },
            ]}
          />
        </Sidebar>
        <div className="flex min-h-screen flex-1 flex-col">
          <AuthedTopNav homeHref="/admin" homeLabel="Admin Portal" roleLabel="Admin" />
          <Suspense
            fallback={
              <HealthLoader
                icon="🫀"
                message="Loading admin portal…"
                submessage="Preparing system insights"
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
