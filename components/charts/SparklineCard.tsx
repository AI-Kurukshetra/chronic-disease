'use client';

import { SparklineChart, type SparklinePoint } from '@/components/charts/SparklineChart';

export interface SparklineCardProps {
  title: string;
  value: string;
  data: SparklinePoint[];
  unit?: string;
  color?: string;
  description?: string;
}

export function SparklineCard({
  title,
  value,
  data,
  unit,
  color = '#2563eb',
  description,
}: SparklineCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
      </div>
      <div className="mt-3">
        <SparklineChart
          data={data}
          color={color}
          unit={unit}
          ariaLabel={`${title} trend sparkline`}
        />
      </div>
    </div>
  );
}
