'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { logoutUser } from '@/lib/actions/auth.actions';

export interface AuthedTopNavProps {
  homeHref: string;
  homeLabel: string;
  links?: Array<{ href: string; label: string }>;
  roleLabel?: string;
}

export function AuthedTopNav({ homeHref, homeLabel, links = [], roleLabel }: AuthedTopNavProps) {
  const pathname = usePathname();
  const showBack = pathname !== homeHref;

  return (
    <header className="flex h-16 w-full items-center justify-between gap-6 border-b border-border bg-card px-6">
      <div className="flex items-center gap-4">
        {showBack && (
          <Link
            href={homeHref}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Back
          </Link>
        )}
        <Link href={homeHref} className="text-base font-semibold text-foreground">
          {homeLabel}
        </Link>
      </div>

      {links.length > 0 && (
        <nav className="hidden items-center gap-2 text-sm lg:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="flex items-center gap-3">
        {roleLabel && (
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Role: {roleLabel}
          </span>
        )}
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-card md:flex">
          <Search className="h-4 w-4" />
          <input
            type="search"
            placeholder="Search"
            className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Search"
          />
        </div>
        <button
          type="button"
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
          JD
        </div>
        <form action={logoutUser}>
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
