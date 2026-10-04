'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function ReportsChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <div className="h-64 w-full rounded-2xl border bg-card p-4">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={3} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
          <Tooltip />
          <Line type="monotone" dataKey="count" name="Жалобы" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
