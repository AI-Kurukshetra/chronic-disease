'use client';

import { useEffect } from 'react';
import { useDateRange, type DateRangeOption } from '@/lib/hooks/useDateRange';

const RANGE_OPTIONS: Array<{ label: string; value: DateRangeOption }> = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: 'Custom', value: 'custom' },
];

export function DateRangeSelector() {
  const { range, from, to, setRange, setFrom, setTo } = useDateRange();

  useEffect(() => {
    if (range !== 'custom') {
      setFrom(null);
      setTo(null);
    }
  }, [range, setFrom, setTo]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              range === option.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {range === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label className="sr-only" htmlFor="range-from">
              Start date
            </label>
            <input
              id="range-from"
              type="date"
              value={from ?? ''}
              onChange={(event) => setFrom(event.target.value || null)}
              className="rounded-lg border border-input px-3 py-2 text-xs transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="range-to">
              End date
            </label>
            <input
              id="range-to"
              type="date"
              value={to ?? ''}
              onChange={(event) => setTo(event.target.value || null)}
              className="rounded-lg border border-input px-3 py-2 text-xs transition-all duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
