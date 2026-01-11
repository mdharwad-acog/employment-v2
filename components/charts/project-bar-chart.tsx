"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProjectBarChartProps {
  data: {
    name: string;
    active: number;
    completed: number;
  }[];
}

export function ProjectBarChart({ data }: ProjectBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="active" fill="#3b82f6" name="Active" />
        <Bar dataKey="completed" fill="#10b981" name="Completed" />
      </BarChart>
    </ResponsiveContainer>
  );
}
