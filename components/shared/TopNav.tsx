import type { ReactNode } from 'react';

export interface TopNavProps {
  children?: ReactNode;
}

export function TopNav({ children }: TopNavProps) {
  return (
    <header className="flex w-full items-center justify-between border-b border-border bg-card px-6 py-4">
      {children}
    </header>
  );
}
