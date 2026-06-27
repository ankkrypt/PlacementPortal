'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import ResumeUpload from '@/components/student/ResumeUpload';
import api from '@/lib/api';

export default function ResumePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setProfile(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (data) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  return (
    <RoleLayout allowedRoles={['student']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Resume</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
          ) : (
            <ResumeUpload profile={profile} onUpload={handleUpload} />
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
