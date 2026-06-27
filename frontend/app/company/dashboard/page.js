'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/api';

export default function CompanyDashboard() {
  const [stats, setStats] = useState({ jobs: 0, applicants: 0, shortlisted: 0, selected: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const jobRes = await api.get('/jobs/mine');
      const jobs = jobRes.data.data;

      let totalApplicants = 0;
      let totalShortlisted = 0;
      let totalSelected = 0;

      // Fetch applicants for each job
      for (const job of jobs) {
        try {
          const appRes = await api.get(`/jobs/${job._id}/applicants`);
          const apps = appRes.data.data;
          totalApplicants += apps.length;
          totalShortlisted += apps.filter((a) => ['shortlisted', 'interview_scheduled', 'selected'].includes(a.status)).length;
          totalSelected += apps.filter((a) => a.status === 'selected').length;
        } catch (e) { /* skip */ }
      }

      setStats({
        jobs: jobs.length,
        applicants: totalApplicants,
        shortlisted: totalShortlisted,
        selected: totalSelected,
      });
      setRecentJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['company']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Dashboard</h1>

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
              <StatCard label="Posted Jobs" value={stats.jobs} color="blue" />
              <StatCard label="Total Applicants" value={stats.applicants} color="purple" />
              <StatCard label="Shortlisted" value={stats.shortlisted} color="green" />
              <StatCard label="Selected" value={stats.selected} color="indigo" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Jobs</h2>
                <a href="/company/jobs" className="text-sm text-blue-600 hover:text-blue-800">View all →</a>
              </div>
              {recentJobs.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No jobs posted yet</p>
              ) : (
                <div className="space-y-2">
                  {recentJobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.type} • {job.location || 'N/A'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === 'active' ? 'bg-green-100 text-green-700' :
                        job.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-700'
                      }`}>{job.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </RoleLayout>
  );
}
