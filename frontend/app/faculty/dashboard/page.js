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
              <StatCard label="Total Students" value={summary?.totalStudents || 0} color="blue" />
              <StatCard label="Placed" value={summary?.placed || 0} color="green" />
              <StatCard label="Placement %" value={summary?.placementPercentage ? `${summary.placementPercentage}%` : '0%'} color="purple" />
              <StatCard label="Avg Package" value={summary?.avgPackage ? `${summary.avgPackage} LPA` : '0 LPA'} color="yellow" />
            </div>

            {announcements.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Announcements</h2>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann._id} className={`p-4 rounded-lg border ${ann.isPinned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        {ann.isPinned && <svg className="w-4 h-4 text-yellow-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
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
            View Reports
          </a>
        </div>
      </div>
    </RoleLayout>
  );
}
