'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CompanyInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews');
      setInterviews(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOutcome = async (id, outcome) => {
    try {
      await api.put(`/interviews/${id}/outcome`, { outcome });
      toast.success(`Marked as ${outcome}`);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <RoleLayout allowedRoles={['company']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Scheduled Interviews</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-500 text-lg">No interviews scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">
                        {interview.student?.name || 'Student'} - {interview.job?.title || 'Job'}
                      </h3>
                      <Badge status={interview.outcome === 'pending' ? 'upcoming' : interview.outcome === 'passed' ? 'completed' : 'closed'}>
                        {interview.outcome}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(interview.scheduledAt).toLocaleString()} • {interview.mode}
                      {interview.venue ? ` • ${interview.venue}` : ''}
                    </p>
                    {interview.meetLink && (
                      <a href={interview.meetLink} target="_blank" className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block">
                        🔗 Join Meeting
                      </a>
                    )}
                  </div>
                  {interview.outcome === 'pending' && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleOutcome(interview._id, 'passed')} variant="success" className="text-xs">Passed</Button>
                      <Button onClick={() => handleOutcome(interview._id, 'failed')} variant="danger" className="text-xs">Failed</Button>
                    </div>
                  )}
                </div>
                {interview.roundName && (
                  <p className="text-xs text-gray-400 mt-2">Round: {interview.roundName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
