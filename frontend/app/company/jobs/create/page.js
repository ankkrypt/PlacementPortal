'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleLayout from '@/components/layout/RoleLayout';
import JobForm from '@/components/company/JobForm';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateJobPage() {
  const router = useRouter();
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      const res = await api.post('/jobs', formData);
      toast.success(formData.status === 'active' ? 'Job published!' : 'Draft saved!');
      router.push('/company/jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job');
    }
  };

  const handleAiGenerate = async (data) => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/generate-job-description', data);
      if (res.data.data) {
        // We'll just return the data - the JobForm can handle it
        toast.success('AI generated description!');
      }
    } catch (error) {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['company']}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Job</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <JobForm onSubmit={handleSubmit} aiLoading={aiLoading} onAiGenerate={handleAiGenerate} />
        </div>
      </div>
    </RoleLayout>
  );
}
