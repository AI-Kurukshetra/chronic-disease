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

interface AdminTrendPoint {
  label: string;
  activePatients: number;
  engagement: number;
}

const ADMIN_TREND_DATA: AdminTrendPoint[] = [
  { label: 'Mon', activePatients: 118, engagement: 72 },
  { label: 'Tue', activePatients: 124, engagement: 74 },
  { label: 'Wed', activePatients: 132, engagement: 78 },
  { label: 'Thu', activePatients: 129, engagement: 80 },
  { label: 'Fri', activePatients: 140, engagement: 82 },
  { label: 'Sat', activePatients: 136, engagement: 79 },
  { label: 'Sun', activePatients: 144, engagement: 84 },
];

export function AdminOverviewChart() {
  return (
    <div className="h-56 w-full" aria-label="Admin engagement overview chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ADMIN_TREND_DATA} margin={{ left: -8, right: 12, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="adminPatients" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="adminEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
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
              boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="activePatients"
            name="Active patients"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#adminPatients)"
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="engagement"
            name="Engagement %"
            stroke="hsl(var(--secondary))"
            strokeWidth={2.5}
            fill="url(#adminEngagement)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
