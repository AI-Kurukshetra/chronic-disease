'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

export interface VitalTrendPoint {
  recorded_at: string;
  value: number;
  alert_triggered: boolean;
}

export interface VitalTrendChartProps {
  data: VitalTrendPoint[];
  alertThreshold?: { low?: number; high?: number } | undefined;
  unit: string;
  label: string;
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function VitalTrendChart({ data, alertThreshold, unit, label }: VitalTrendChartProps) {
  const chartData = data.map((item) => ({
    date: formatShortDate(item.recorded_at),
    value: item.value,
    alert: item.alert_triggered,
  }));

  return (
    <div role="img" aria-label={`${label} trend chart showing ${data.length} readings`}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <YAxis unit={` ${unit}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [`${value} ${unit}`, label]}
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
              color: 'hsl(var(--foreground))',
              fontSize: 12,
            }}
          />
          {alertThreshold?.high !== undefined && (
            <ReferenceLine
              y={alertThreshold.high}
              stroke="hsl(var(--destructive))"
              strokeDasharray="4 4"
              label={{ value: 'High threshold', fill: 'hsl(var(--destructive))', fontSize: 12 }}
            />
          )}
          {alertThreshold?.low !== undefined && (
            <ReferenceLine
              y={alertThreshold.low}
              stroke="hsl(var(--warning))"
              strokeDasharray="4 4"
              label={{ value: 'Low threshold', fill: 'hsl(var(--warning))', fontSize: 12 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3, stroke: 'hsl(var(--primary))', fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>{label} readings</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Value</th>
            <th>Alert</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((row, index) => (
            <tr key={`${row.date}-${index}`}>
              <td>{row.date}</td>
              <td>
                {row.value} {unit}
              </td>
              <td>{row.alert ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
