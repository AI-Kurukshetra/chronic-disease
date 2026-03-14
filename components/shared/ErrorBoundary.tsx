'use client';

import type { ReactNode } from 'react';
import { Component } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
