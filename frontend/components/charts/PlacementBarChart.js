'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PlacementBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="branch" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="placed" fill="#22c55e" name="Placed" />
        <Bar dataKey="unplaced" fill="#94a3b8" name="Unplaced" />
      </BarChart>
    </ResponsiveContainer>
  );
}


