'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrendPoint {
  week: string;
  adherence: number;
  vitalsInRange: number;
}

const TREND_DATA: TrendPoint[] = [
  { week: 'Wk 1', adherence: 78, vitalsInRange: 64 },
  { week: 'Wk 2', adherence: 81, vitalsInRange: 66 },
  { week: 'Wk 3', adherence: 79, vitalsInRange: 68 },
  { week: 'Wk 4', adherence: 84, vitalsInRange: 70 },
  { week: 'Wk 5', adherence: 86, vitalsInRange: 72 },
  { week: 'Wk 6', adherence: 88, vitalsInRange: 74 },
];

export function ProviderTrendChart() {
  return (
    <div className="h-52 w-full" aria-label="Provider trend summary chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={TREND_DATA} margin={{ left: -10, right: 12, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="adherenceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="vitalsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, opacity: 0.2 }}
            contentStyle={{
              borderRadius: 12,
              borderColor: 'hsl(var(--border))',
              boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="adherence"
            name="Adherence %"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#adherenceFill)"
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="vitalsInRange"
            name="Vitals in range %"
            stroke="hsl(var(--secondary))"
            strokeWidth={2.5}
            fill="url(#vitalsFill)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
