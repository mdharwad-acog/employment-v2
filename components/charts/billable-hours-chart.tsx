"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BillableHoursChartProps {
  data: {
    month: string;
    billable: number;
    internal: number;
  }[];
}

export function BillableHoursChart({ data }: BillableHoursChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="billable"
          stroke="#10b981"
          strokeWidth={2}
          name="Billable Hours"
        />
        <Line
          type="monotone"
          dataKey="internal"
          stroke="#6366f1"
          strokeWidth={2}
          name="Internal Hours"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
