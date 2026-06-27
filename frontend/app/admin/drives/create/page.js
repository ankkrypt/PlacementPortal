'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import DriveForm from '@/components/admin/DriveForm';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CreateDrivePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compRes, jobRes] = await Promise.all([
        api.get('/admin/companies'),
        api.get('/jobs'),
      ]);
      setCompanies(compRes.data.data);
      setJobs(jobRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.post('/drives', formData);
      toast.success('Drive created!');
      router.push('/admin/drives');
    } catch (error) {
      toast.error('Failed to create drive');
    }
  };

  return (
    <RoleLayout allowedRoles={['admin']}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Placement Drive</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <DriveForm companies={companies} jobs={jobs} onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
