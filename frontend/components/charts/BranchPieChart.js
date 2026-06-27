'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#1e3a5f', '#2d6a4f', '#9a7d2a', '#8b2d2d', '#5b3c7a', '#433e8a', '#a65d2e', '#2d6a4f', '#162d4a'];

export default function BranchPieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>;
  }

  const pieData = data.filter((d) => d.placed > 0).map((d) => ({
    name: d.branch,
    value: d.placed,
  }));

  if (pieData.length === 0) {
    return <div className="text-gray-400 text-center py-8">No placed students yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
