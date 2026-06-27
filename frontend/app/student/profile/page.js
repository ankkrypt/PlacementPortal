'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import ProfileForm from '@/components/student/ProfileForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiModal, setAiModal] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setProfile(res.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    const res = await api.put('/students/profile', formData);
    setProfile(res.data.data);
  };

  const handleAiReview = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/review-resume');
      setAiReview(res.data.data);
      setAiModal(true);
    } catch (error) {
      console.error('AI review error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout allowedRoles={['student']}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout allowedRoles={['student']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <Button onClick={handleAiReview} disabled={aiLoading} variant="outline">
            {aiLoading ? 'Analyzing...' : 'AI Profile Review'}
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {profile ? (
            <ProfileForm profile={profile} onSave={handleSave} />
          ) : (
            <p className="text-gray-500">Loading profile...</p>
          )}
        </div>

        {/* AI Review Modal */}
        <Modal isOpen={aiModal} onClose={() => setAiModal(false)} title="AI Profile Review">
          {aiReview && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">{aiReview.overallScore}</div>
                <p className="text-gray-500 text-sm">Overall Score</p>
              </div>

              {aiReview.strengths?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-700 mb-2">Strengths</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiReview.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiReview.weaknesses?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-2">Areas to Improve</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiReview.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-gray-700">{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiReview.suggestions?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-700 mb-2">Suggestions</h3>
                  {aiReview.suggestions.map((s, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded-lg mb-2">
                      <p className="font-medium text-sm text-blue-800">{s.area}</p>
                      <p className="text-sm text-blue-600">{s.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}

              {aiReview.missingFields?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-700 mb-2">Missing Fields</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiReview.missingFields.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </RoleLayout>
  );
}
