'use client';

import { useMemo } from 'react';
import { parseAsString, useQueryState } from 'nuqs';

export type DateRangeOption = '7d' | '30d' | '90d' | 'custom';

export interface DateRangeState {
  range: DateRangeOption;
  from: string | undefined;
  to: string | undefined;
  days: number;
  setRange: (value: DateRangeOption) => void;
  setFrom: (value: string | null) => void;
  setTo: (value: string | null) => void;
}

function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function useDateRange(): DateRangeState {
  const [range, setRange] = useQueryState('range', parseAsString.withDefault('30d'));
  const [from, setFrom] = useQueryState('from', parseAsString);
  const [to, setTo] = useQueryState('to', parseAsString);

  const resolvedRange = (['7d', '30d', '90d', 'custom'] as const).includes(range as DateRangeOption)
    ? (range as DateRangeOption)
    : '30d';

  const days = useMemo(() => {
    if (resolvedRange === 'custom' && from && to) {
      return daysBetween(new Date(from), new Date(to));
    }

    if (resolvedRange === '7d') return 7;
    if (resolvedRange === '90d') return 90;
    return 30;
  }, [from, resolvedRange, to]);

  return {
    range: resolvedRange,
    from: from ?? undefined,
    to: to ?? undefined,
    days,
    setRange: (value) => setRange(value),
    setFrom,
    setTo,
  };
}
