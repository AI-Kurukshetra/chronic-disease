'use client';

import { DateRangeSelector } from '@/components/shared/DateRangeSelector';
import { SparklineCard } from '@/components/charts/SparklineCard';
import { BloodPressureSparkline } from '@/components/charts/BloodPressureSparkline';
import { useDateRange } from '@/lib/hooks/useDateRange';
import { useVitalTrend } from '@/lib/hooks/useVitals';
import { useAdherenceTrend } from '@/lib/hooks/useAdherenceTrend';
import type { VitalRow } from '@/lib/hooks/useVitals';

function mapTrend(data: VitalRow[] | undefined): Array<{ date: string; value: number }> {
  if (!data) return [];
  return data.map((item) => ({
    date: item.recorded_at.slice(0, 10),
    value: Number(item.value),
  }));
}

function mergeBloodPressure(
  systolic: VitalRow[] | undefined,
  diastolic: VitalRow[] | undefined,
): Array<{ date: string; systolic?: number; diastolic?: number }> {
  const map = new Map<string, { systolic?: number; diastolic?: number }>();

  for (const item of systolic ?? []) {
    map.set(item.recorded_at.slice(0, 10), {
      ...map.get(item.recorded_at.slice(0, 10)),
      systolic: item.value,
    });
  }

  for (const item of diastolic ?? []) {
    map.set(item.recorded_at.slice(0, 10), {
      ...map.get(item.recorded_at.slice(0, 10)),
      diastolic: item.value,
    });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, values]) => ({ date, ...values }));
}

export interface ProgressTrendsProps {
  patientId: string;
}

export function ProgressTrends({ patientId }: ProgressTrendsProps) {
  const { days } = useDateRange();

  const glucoseTrend = useVitalTrend(patientId, 'blood_glucose', days);
  const systolicTrend = useVitalTrend(patientId, 'blood_pressure_systolic', days);
  const diastolicTrend = useVitalTrend(patientId, 'blood_pressure_diastolic', days);
  const weightTrend = useVitalTrend(patientId, 'weight', days);
  const activeMinutesTrend = useVitalTrend(patientId, 'active_minutes', days);
  const adherenceTrend = useAdherenceTrend(patientId, days);

  const bloodPressureData = mergeBloodPressure(systolicTrend.data, diastolicTrend.data);
  const glucoseValue = glucoseTrend.isLoading
    ? 'Loading...'
    : glucoseTrend.isError
      ? 'Unavailable'
      : glucoseTrend.data?.[0]
        ? `${glucoseTrend.data[0].value} mg/dL`
        : 'No data';

  const weightValue = weightTrend.isLoading
    ? 'Loading...'
    : weightTrend.isError
      ? 'Unavailable'
      : weightTrend.data?.[0]
        ? `${weightTrend.data[0].value} kg`
        : 'No data';

  const activeMinutesValue = activeMinutesTrend.isLoading
    ? 'Loading...'
    : activeMinutesTrend.isError
      ? 'Unavailable'
      : activeMinutesTrend.data?.[0]
        ? `${activeMinutesTrend.data[0].value} min`
        : 'No data';

  const adherenceValue = adherenceTrend.isLoading
    ? 'Loading...'
    : adherenceTrend.isError
      ? 'Unavailable'
      : adherenceTrend.data?.length
        ? `${adherenceTrend.data.at(-1)?.rate ?? 0}%`
        : 'No data';

  const bpValue =
    systolicTrend.isLoading || diastolicTrend.isLoading
      ? 'Loading...'
      : systolicTrend.isError || diastolicTrend.isError
        ? 'Unavailable'
        : systolicTrend.data?.[0] && diastolicTrend.data?.[0]
          ? `${systolicTrend.data[0].value}/${diastolicTrend.data[0].value} mmHg`
          : 'No data';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Trends</h2>
          <p className="text-sm text-muted-foreground">Sparkline snapshots by range</p>
        </div>
        <DateRangeSelector />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SparklineCard
          title="Blood glucose"
          value={glucoseValue}
          data={glucoseTrend.data ? mapTrend(glucoseTrend.data) : []}
          unit="mg/dL"
          color="#2563eb"
        />

        <div className="rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Blood pressure</p>
              <p className="text-xs text-muted-foreground">Systolic / Diastolic</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">{bpValue}</p>
          </div>
          <div className="mt-3">
            <BloodPressureSparkline data={bloodPressureData} />
          </div>
        </div>

        <SparklineCard
          title="Weight"
          value={weightValue}
          data={weightTrend.data ? mapTrend(weightTrend.data) : []}
          unit="kg"
          color="#0ea5e9"
        />

        <SparklineCard
          title="Medication adherence"
          value={adherenceValue}
          data={(adherenceTrend.data ?? []).map((item) => ({ date: item.date, value: item.rate }))}
          unit="%"
          color="#16a34a"
        />

        <SparklineCard
          title="Active minutes"
          value={activeMinutesValue}
          data={activeMinutesTrend.data ? mapTrend(activeMinutesTrend.data) : []}
          unit="min"
          color="#8b5cf6"
        />
      </div>
    </section>
  );
}
