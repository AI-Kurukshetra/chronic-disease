export interface MedicationLogEntry {
  status: 'taken' | 'missed' | 'skipped' | 'pending';
  scheduled_at: string;
}

export interface AdherencePoint {
  date: string;
  rate: number;
}

export function buildAdherenceTrend(logs: MedicationLogEntry[]): AdherencePoint[] {
  const bucket = new Map<string, { taken: number; total: number }>();

  for (const log of logs) {
    if (log.status === 'pending') {
      continue;
    }

    const dateKey = log.scheduled_at.slice(0, 10);
    const existing = bucket.get(dateKey) ?? { taken: 0, total: 0 };
    existing.total += 1;
    if (log.status === 'taken') {
      existing.taken += 1;
    }
    bucket.set(dateKey, existing);
  }

  return Array.from(bucket.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, counts]) => ({
      date,
      rate: counts.total === 0 ? 0 : Math.round((counts.taken / counts.total) * 100),
    }));
}
