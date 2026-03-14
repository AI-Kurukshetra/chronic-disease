import type { ReactNode } from 'react';

export type VitalStatus = 'success' | 'warning' | 'destructive' | 'neutral';
export type VitalTone = 'primary' | 'secondary' | 'warning' | 'success';

export interface VitalSignCardProps {
  title: string;
  value: number | string | null | undefined;
  unit?: string;
  status: VitalStatus;
  icon: ReactNode;
  tone: VitalTone;
  helper?: string;
}

const toneStyles: Record<VitalTone, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
};

const toneBorder: Record<VitalTone, string> = {
  primary: 'border-primary/30',
  secondary: 'border-secondary/30',
  warning: 'border-warning/30',
  success: 'border-success/30',
};

const statusText: Record<VitalStatus, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  neutral: 'text-foreground',
};

export function VitalSignCard({
  title,
  value,
  unit,
  status,
  icon,
  tone,
  helper,
}: VitalSignCardProps) {
  return (
    <div
      className={`rounded-lg border bg-card p-6 shadow-card transition-all duration-200 hover:shadow-md ${toneBorder[tone]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ring-border ${toneStyles[tone]}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className={`text-3xl font-bold tabular-nums leading-tight ${statusText[status]}`}>
            {value !== null && value !== undefined && value !== '' ? value : '--'}
          </p>
          {unit && <p className="mt-1 text-sm text-muted-foreground">{unit}</p>}
        </div>
        {status === 'destructive' ? (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
          </span>
        ) : status === 'warning' ? (
          <span className="inline-flex h-3 w-3 rounded-full bg-warning" />
        ) : status === 'success' ? (
          <span className="inline-flex h-3 w-3 rounded-full bg-success" />
        ) : null}
      </div>
    </div>
  );
}
