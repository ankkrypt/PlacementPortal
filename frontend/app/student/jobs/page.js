'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import JobCard from '@/components/student/JobCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showEligible, setShowEligible] = useState(false);
  const [aiModal, setAiModal] = useState(false);
  const [aiMatches, setAiMatches] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const branches = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/students/jobs');
      setJobs(res.data.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiMatch = async () => {
    setAiLoading(true);
    setAiModal(true);
    try {
      const res = await api.post('/ai/match-jobs');
      setAiMatches(res.data.data);
    } catch (error) {
      console.error('AI match error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  let filteredJobs = jobs;
  if (filterBranch) filteredJobs = filteredJobs.filter((j) => j.eligibleBranches?.includes(filterBranch));
  if (filterType) filteredJobs = filteredJobs.filter((j) => j.type === filterType);
  if (showEligible) filteredJobs = filteredJobs.filter((j) => j.isEligible);

  return (
    <RoleLayout allowedRoles={['student']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Browse Jobs</h1>
          <Button onClick={handleAiMatch} variant="outline">
            {aiLoading ? 'Loading...' : 'AI Job Matches'}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-center">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="job">Job</option>
            <option value="internship">Internship</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showEligible}
              onChange={(e) => setShowEligible(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Eligible only
          </label>
          <span className="text-sm text-gray-400 ml-auto">{filteredJobs.length} jobs found</span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-gray-500 text-lg">No jobs found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {/* AI Match Modal */}
        <Modal isOpen={aiModal} onClose={() => setAiModal(false)} title="AI Job Matches">
          {aiLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Analyzing your profile...</p>
            </div>
          ) : aiMatches ? (
            <div className="space-y-4">
              {aiMatches.matches?.map((match, i) => (
                <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{match.jobTitle}</h3>
                    <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                      {match.fitScore}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{match.company}</p>
                  <p className="text-sm text-gray-500">{match.reason}</p>
                </div>
              ))}
              {(!aiMatches.matches || aiMatches.matches.length === 0) && (
                <p className="text-gray-500 text-center">No matches found</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Failed to load AI matches</p>
          )}
        </Modal>
      </div>
    </RoleLayout>
  );
}
