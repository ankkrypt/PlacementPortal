'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import ApplicationRow from '@/components/student/ApplicationRow';
import api from '@/lib/api';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/students/applications');
      setApplications(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['student']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h1>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg">No applications yet</p>
            <p className="text-gray-400 text-sm mt-1">Browse jobs and apply to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationRow key={app._id} application={app} />
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
