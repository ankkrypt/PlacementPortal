'use client';
import { useState } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import {
  JobMatcher,
  ProfileReviewer,
  JDGenerator,
  PlacementInsights,
} from '@/components/ai/AIAssistant';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AIPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(0);
  const [matchLoading, setMatchLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [review, setReview] = useState(null);
  const [jdData, setJdData] = useState(null);
  const [insights, setInsights] = useState(null);

  const role = user?.role;

  const tabs = [
    { label: 'Job Matcher', roles: ['student'] },
    { label: 'Profile Reviewer', roles: ['student'] },
    { label: 'JD Generator', roles: ['company'] },
    { label: 'Placement Insights', roles: ['admin', 'faculty'] },
  ];

  const visibleTabs = tabs.filter((t) => t.roles.includes(role));

  const handleJobMatch = async () => {
    setMatchLoading(true);
    try {
      const res = await api.post('/ai/match-jobs');
      setMatches(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleProfileReview = async () => {
    setReviewLoading(true);
    try {
      const res = await api.post('/ai/review-resume');
      setReview(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleJDGenerate = async (formData) => {
    setJdLoading(true);
    try {
      const res = await api.post('/ai/generate-job-description', formData);
      setJdData(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setJdLoading(false);
    }
  };

  const handleInsights = async () => {
    setInsightsLoading(true);
    try {
      const sumRes = await api.get('/reports/summary');
      const branchRes = await api.get('/reports/branch-wise');
      const coRes = await api.get('/reports/company-wise');
      const res = await api.post('/ai/placement-insights', {
        reportData: {
          summary: sumRes.data.data,
          branchWise: branchRes.data.data,
          companyWise: coRes.data.data,
        },
      });
      setInsights(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['student', 'company', 'admin', 'faculty']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Tools</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {visibleTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === i
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {visibleTabs[activeTab]?.label === 'Job Matcher' && (
            <JobMatcher onMatch={handleJobMatch} matches={matches} loading={matchLoading} />
          )}
          {visibleTabs[activeTab]?.label === 'Profile Reviewer' && (
            <ProfileReviewer onReview={handleProfileReview} review={review} loading={reviewLoading} />
          )}
          {visibleTabs[activeTab]?.label === 'JD Generator' && (
            <JDGenerator onGenerate={handleJDGenerate} jdData={jdData} loading={jdLoading} />
          )}
          {visibleTabs[activeTab]?.label === 'Placement Insights' && (
            <PlacementInsights onInsights={handleInsights} insights={insights} loading={insightsLoading} />
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
