'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompanyWiseChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="companyName" width={90} />
        <Tooltip />
        <Bar dataKey="studentsHired" fill="#3b82f6" name="Students Hired" />
      </BarChart>
    </ResponsiveContainer>
  );
}
