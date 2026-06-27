'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RoleLayout from '@/components/layout/RoleLayout';
import ApplicantTable from '@/components/company/ApplicantTable';
import InterviewScheduler from '@/components/company/InterviewScheduler';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ApplicantsPage() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleStudent, setScheduleStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [appRes, jobRes] = await Promise.all([
        api.get(`/jobs/${id}/applicants`),
        api.get(`/jobs/${id}`),
      ]);
      setApplications(appRes.data.data);
      setJob(jobRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Application ${status}!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleBulkShortlist = async () => {
    if (selected.length === 0) return;
    try {
      await api.put('/applications/bulk/status', {
        applicationIds: selected,
        status: 'shortlisted',
        note: 'Bulk shortlisted',
      });
      toast.success(`${selected.length} applicants shortlisted!`);
      setSelected([]);
      fetchData();
    } catch (error) {
      toast.error('Failed to bulk shortlist');
    }
  };

  const handleScheduleInterview = async (data) => {
    try {
      await api.post('/interviews', {
        jobId: id,
        studentId: scheduleStudent,
        ...data,
      });
      toast.success('Interview scheduled!');
      setScheduleModal(false);
      setScheduleStudent(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to schedule interview');
    }
  };

  const handleDownloadResume = async (appId) => {
    try {
      const res = await api.get(`/applications/${appId}/resume`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const toggleSelect = (appId) => {
    setSelected((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  if (loading) {
    return (
      <RoleLayout allowedRoles={['company']}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout allowedRoles={['company']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Applicants</h1>
            <p className="text-gray-500">{job?.title || 'Job'} • {applications.length} applicants</p>
          </div>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button onClick={handleBulkShortlist} variant="success">
                Shortlist Selected ({selected.length})
              </Button>
            )}
          </div>
        </div>

        <ApplicantTable
          applications={applications}
          selected={selected}
          onToggleSelect={toggleSelect}
          onStatusUpdate={handleStatusUpdate}
          onDownloadResume={handleDownloadResume}
          onScheduleInterview={(studentId) => {
            setScheduleStudent(studentId);
            setScheduleModal(true);
          }}
        />

        <Modal isOpen={scheduleModal} onClose={() => setScheduleModal(false)} title="Schedule Interview">
          <InterviewScheduler
            onSubmit={handleScheduleInterview}
            onCancel={() => setScheduleModal(false)}
          />
        </Modal>
      </div>
    </RoleLayout>
  );
}
