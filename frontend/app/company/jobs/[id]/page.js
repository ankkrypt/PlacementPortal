'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleLayout from '@/components/layout/RoleLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CompanyJobDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job closed');
      router.push('/company/jobs');
    } catch (error) {
      toast.error('Failed to close');
    }
  };

  if (loading) {
    return (
      <RoleLayout allowedRoles={['company']}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </RoleLayout>
    );
  }

  if (!job) {
    return (
      <RoleLayout allowedRoles={['company']}>
        <div className="text-center py-12">
          <p className="text-gray-500">Job not found</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout allowedRoles={['company']}>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-gray-500">{job.type} • Posted {new Date(job.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/company/jobs/${id}/applicants`}>
              <Button variant="primary">View Applicants</Button>
            </Link>
            {job.status !== 'closed' && (
              <Button onClick={handleClose} variant="danger">Close Job</Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge status={job.status} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Package</p>
              <p className="font-semibold">{job.package ? `${job.package} LPA` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-semibold">{job.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vacancies</p>
              <p className="font-semibold">{job.vacancies || 'N/A'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.description || 'No description'}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Requirements</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{job.requirements || 'No requirements specified'}</p>
          </div>

          {job.eligibleBranches?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Eligible Branches</h3>
              <div className="flex flex-wrap gap-2">
                {job.eligibleBranches.map((b) => (
                  <span key={b} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{b}</span>
                ))}
              </div>
            </div>
          )}

          {job.requiredSkills?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {job.rounds?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Selection Rounds</h3>
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
        </div>
      </div>
    </RoleLayout>
  );
}
