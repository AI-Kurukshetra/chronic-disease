import type { ReactNode } from 'react';

export interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-[260px] border-r border-border bg-sidebar-bg text-sidebar-text">
      <div className="border-b border-border px-6 py-5 text-lg font-semibold tracking-tight">
        HealthOS
      </div>
      <div className="px-4 py-6">{children}</div>
    </aside>
  );
}
