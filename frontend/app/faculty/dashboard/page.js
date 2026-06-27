'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/api';

export default function FacultyDashboard() {
  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, annRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/announcements'),
      ]);
      setSummary(sumRes.data.data);
      setAnnouncements(annRes.data.data.filter((a) => a.targetRoles?.includes('all') || a.targetRoles?.includes('faculty')));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['faculty']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Faculty Dashboard</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Students" value={summary?.totalStudents || 0} icon="🎓" color="blue" />
              <StatCard label="Placed" value={summary?.placed || 0} icon="✅" color="green" />
              <StatCard label="Placement %" value={summary?.placementPercentage ? `${summary.placementPercentage}%` : '0%'} icon="📊" color="purple" />
              <StatCard label="Avg Package" value={summary?.avgPackage ? `${summary.avgPackage} LPA` : '0 LPA'} icon="💰" color="yellow" />
            </div>

            {announcements.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">📢 Announcements</h2>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann._id} className={`p-4 rounded-lg border ${ann.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        {ann.isPinned && <span className="text-yellow-500">📌</span>}
                        <h3 className="font-medium text-gray-800">{ann.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(ann.createdAt).toLocaleDateString()} • by {ann.postedBy?.name || 'Admin'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <a href="/faculty/reports" className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            View Reports 📈
          </a>
        </div>
      </div>
    </RoleLayout>
  );
}
