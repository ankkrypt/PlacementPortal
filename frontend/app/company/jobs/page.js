'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import Link from 'next/link';

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/mine');
      setJobs(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job closed');
      fetchJobs();
    } catch (error) {
      toast.error('Failed to close job');
    }
  };

  return (
    <RoleLayout allowedRoles={['company']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Jobs</h1>
          <Link href="/company/jobs/create">
            <Button>+ Post New Job</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <p className="text-gray-500 text-lg">No jobs posted yet</p>
            <Link href="/company/jobs/create">
              <Button className="mt-4">Post Your First Job</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <Badge status={job.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{job.type === 'job' ? 'Full-time' : 'Internship'} • {job.location || 'N/A'} • {job.package ? `${job.package} LPA` : 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/company/jobs/${job._id}/applicants`}>
                      <Button variant="outline" className="text-xs">View Applicants</Button>
                    </Link>
                    {job.status !== 'closed' && (
                      <Button onClick={() => handleClose(job._id)} variant="danger" className="text-xs">Close</Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                  <span>Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}</span>
                  <span>Vacancies: {job.vacancies || 'N/A'}</span>
                  <span>Min CGPA: {job.minCgpa || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
