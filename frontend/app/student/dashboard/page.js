'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/api';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ applications: 0, shortlisted: 0, jobs: 0 });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, jobsRes, profileRes] = await Promise.all([
        api.get('/students/applications'),
        api.get('/students/jobs'),
        api.get('/students/profile'),
      ]);

      const apps = appRes.data.data;
      setStats({
        applications: apps.length,
        shortlisted: apps.filter((a) => a.status === 'shortlisted' || a.status === 'interview_scheduled').length,
        jobs: jobsRes.data.data.filter((j) => j.isEligible).length,
      });
      setProfile(profileRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['student']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Dashboard</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard label="Total Applications" value={stats.applications} color="blue" />
              <StatCard label="Shortlisted" value={stats.shortlisted} color="green" />
              <StatCard label="Eligible Jobs" value={stats.jobs} color="purple" />
            </div>

            {profile && !profile.profileComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 text-yellow-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <div>
                    <p className="font-medium text-yellow-800">Profile Incomplete</p>
                    <p className="text-sm text-yellow-600">Complete your profile to start applying for jobs.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <a href="/student/profile" className="p-3 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors text-center">
                  Update Profile
                </a>
                <a href="/student/resume" className="p-3 bg-green-50 rounded-lg text-green-700 font-medium hover:bg-green-100 transition-colors text-center">
                  Upload Resume
                </a>
                <a href="/student/jobs" className="p-3 bg-purple-50 rounded-lg text-purple-700 font-medium hover:bg-purple-100 transition-colors text-center">
                  Browse Jobs
                </a>
                <a href="/student/applications" className="p-3 bg-orange-50 rounded-lg text-orange-700 font-medium hover:bg-orange-100 transition-colors text-center">
                  Track Applications
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </RoleLayout>
  );
}
