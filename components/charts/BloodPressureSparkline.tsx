'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';

export interface BloodPressurePoint {
  date: string;
  systolic?: number;
  diastolic?: number;
}

export interface BloodPressureSparklineProps {
  data: BloodPressurePoint[];
}

export function BloodPressureSparkline({ data }: BloodPressureSparklineProps) {
  return (
    <div role="img" aria-label="Blood pressure trend sparkline">
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ left: 4, right: 4, top: 10, bottom: 10 }}>
          <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <table className="sr-only">
        <caption>Blood pressure readings</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Systolic</th>
            <th>Diastolic</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.date}>
              <td>{row.date}</td>
              <td>{row.systolic ?? '-'}</td>
              <td>{row.diastolic ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
