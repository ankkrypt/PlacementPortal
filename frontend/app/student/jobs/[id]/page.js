'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RoleLayout from '@/components/layout/RoleLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function StudentJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [jobRes, profileRes, appRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get('/students/profile'),
        api.get('/students/applications'),
      ]);
      setJob(jobRes.data.data);
      setProfile(profileRes.data.data);
      const apps = appRes.data.data;
      setHasApplied(apps.some((a) => a.job?._id === id || a.job === id));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`);
      toast.success('Application submitted!');
      setHasApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout allowedRoles={['student']}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-6"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
      </RoleLayout>
    );
  }

  if (!job) {
    return (
      <RoleLayout allowedRoles={['student']}>
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found</p>
        </div>
      </RoleLayout>
    );
  }

  const canApply = profile?.profileComplete && !hasApplied;
  const isExpired = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);

  return (
    <RoleLayout allowedRoles={['student']}>
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
              <p className="text-gray-500">{job.companyProfile?.companyName || job.company?.name}</p>
            </div>
            <Badge status={job.type === 'job' ? 'active' : 'upcoming'}>
              {job.type === 'job' ? 'Full-time' : 'Internship'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Package</p>
              <p className="font-semibold">{job.package ? `${job.package} LPA` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-semibold">{job.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Min CGPA</p>
              <p className="font-semibold">{job.minCgpa || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Deadline</p>
              <p className="font-semibold">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          {job.eligibleBranches?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Eligible Branches</h3>
              <div className="flex flex-wrap gap-2">
                {job.eligibleBranches.map((b) => (
                  <span key={b} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{b}</span>
                ))}
              </div>
            </div>
          )}

          {job.requiredSkills?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {job.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {job.requirements && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {job.rounds?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selection Rounds</h3>
              <div className="space-y-2">
                {job.rounds.map((round) => (
                  <div key={round.roundNumber} className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium text-sm">Round {round.roundNumber}: {round.name}</p>
                    {round.description && <p className="text-sm text-gray-500 mt-1">{round.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            {!profile?.profileComplete ? (
              <div className="p-3 bg-yellow-50 rounded-lg mb-3">
                <p className="text-sm text-yellow-700">⚠️ Complete your profile before applying</p>
              </div>
            ) : hasApplied ? (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">✅ You have already applied for this job</p>
              </div>
            ) : isExpired ? (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">⏰ Application deadline has passed</p>
              </div>
            ) : null}
            <Button
              onClick={handleApply}
              disabled={!canApply || applying || isExpired}
              className="w-full md:w-auto"
            >
              {applying ? 'Applying...' : hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
