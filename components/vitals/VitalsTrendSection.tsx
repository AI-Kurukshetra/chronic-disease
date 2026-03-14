'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VITAL_TYPES, VITAL_UNITS, type VitalType } from '@/lib/validations/vitals.schema';
import { useVitalTrend } from '@/lib/hooks/useVitals';
import { VitalTrendChart } from '@/components/charts/VitalTrendChart';
import { SkeletonChart } from '@/components/shared/Skeletons';

export interface VitalsTrendSectionProps {
  patientId: string;
  alertThresholds?: Record<string, { low?: number; high?: number }> | null | undefined;
}

export function VitalsTrendSection({ patientId, alertThresholds }: VitalsTrendSectionProps) {
  const [selectedType, setSelectedType] = useState<VitalType>('blood_glucose');
  const { data, isLoading, isError } = useVitalTrend(patientId, selectedType, 30);
  const router = useRouter();

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Vital trends</h2>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </div>
        <select
          className="rounded-lg border border-input px-3 py-2.5 text-base transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value as VitalType)}
          aria-label="Select vital type"
        >
          {VITAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading && <SkeletonChart />}

        {isError && (
          <div className="rounded-lg border border-border bg-muted/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">Something went wrong loading this data.</p>
            <button
              type="button"
              onClick={() => router.refresh()}
              className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <div className="rounded-lg border border-border bg-muted/40 p-8 text-center">
            <svg
              className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 12h6l2-4 2 8 2-4h4" />
              <rect x="3" y="4" width="18" height="16" rx="2" />
            </svg>
            <p className="text-sm text-muted-foreground">No vitals logged yet.</p>
            <Link
              href="/vitals"
              className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Log your first vital
            </Link>
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <VitalTrendChart
            data={data.map((item) => ({
              recorded_at: item.recorded_at,
              value: item.value,
              alert_triggered: item.alert_triggered,
            }))}
            unit={VITAL_UNITS[selectedType]}
            label={selectedType.replaceAll('_', ' ')}
            alertThreshold={alertThresholds?.[selectedType]}
          />
        )}
      </div>
    </section>
  );
}
