'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

export interface SparklinePoint {
  date: string;
  value: number;
}

export interface SparklineChartProps {
  data: SparklinePoint[];
  color: string;
  ariaLabel: string;
  unit?: string | undefined;
}

export function SparklineChart({ data, color, ariaLabel, unit }: SparklineChartProps) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ left: 4, right: 4, top: 10, bottom: 10 }}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date}>
              <td>{row.date}</td>
              <td>
                {row.value} {unit ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
