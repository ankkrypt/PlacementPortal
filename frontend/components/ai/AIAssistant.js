'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export function JobMatcher({ onMatch, matches, loading }) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-gray-600 mb-4">AI will analyze your profile and match you with the most suitable jobs.</p>
        <Button onClick={onMatch} disabled={loading}>
          {loading ? 'Analyzing...' : 'Find Matching Jobs'}
        </Button>
      </div>
      {matches && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Top Matches</h3>
          {matches.matches?.map((match, i) => (
            <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-800">{match.jobTitle}</h4>
                <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">{match.fitScore}%</span>
              </div>
              <p className="text-sm text-gray-500">{match.company}</p>
              <p className="text-sm text-gray-600 mt-1">{match.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileReviewer({ onReview, review, loading }) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-gray-600 mb-4">Get AI-powered feedback on your profile to improve your chances.</p>
        <Button onClick={onReview} disabled={loading}>
          {loading ? 'Reviewing...' : 'Review My Profile'}
        </Button>
      </div>
      {review && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{review.overallScore}</div>
            <p className="text-gray-500 text-sm">Overall Score</p>
          </div>
          {review.strengths?.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 mb-1">Strengths</h3>
              <ul className="list-disc pl-5">
                {review.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600">{s}</li>
                ))}
              </ul>
            </div>
          )}
          {review.suggestions?.length > 0 && (
            <div>
              <h3 className="font-semibold text-blue-700 mb-1">Suggestions</h3>
              {review.suggestions.map((s, i) => (
                <div key={i} className="p-2 bg-blue-50 rounded mb-1">
                  <p className="text-sm font-medium text-blue-800">{s.area}</p>
                  <p className="text-sm text-blue-600">{s.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function JDGenerator({ onGenerate, jdData, loading }) {
  const [formData, setFormData] = useState({
    role: '',
    type: 'job',
    skills: '',
    package: '',
    location: '',
    companyDesc: '',
  });

  const handleGenerate = () => {
    onGenerate(formData);
  };

  return (
    <div className="p-6">
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="job">Full-time Job</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="e.g., React, Node.js, MongoDB"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Package (LPA)</label>
            <input
              type="text"
              value={formData.package}
              onChange={(e) => setFormData({ ...formData, package: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g., 12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g., Bangalore"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
          <textarea
            value={formData.companyDesc}
            onChange={(e) => setFormData({ ...formData, companyDesc: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Brief company description..."
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate JD'}
        </Button>
      </div>
      {jdData && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700">Generated Job Description</h3>
          {jdData.description && (
            <div>
              <p className="text-sm font-medium text-gray-600">Description:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{jdData.description}</p>
            </div>
          )}
          {jdData.requirements && (
            <div>
              <p className="text-sm font-medium text-gray-600">Requirements:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{jdData.requirements}</p>
            </div>
          )}
          {jdData.rounds?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600">Rounds:</p>
              {jdData.rounds.map((r, i) => (
                <p key={i} className="text-sm text-gray-700">Round {r.roundNumber}: {r.name} - {r.description}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PlacementInsights({ onInsights, insights, loading }) {
  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-gray-600 mb-4">Get AI-generated insights, trends, and recommendations from placement data.</p>
        <Button onClick={onInsights} disabled={loading}>
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </Button>
      </div>
      {insights && (
        <div className="space-y-4">
          {insights.summary && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{insights.summary}</p>
            </div>
          )}
          {insights.insights?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Insights</h3>
              <ul className="list-disc pl-5">
                {insights.insights.map((i, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{i}</li>
                ))}
              </ul>
            </div>
          )}
          {insights.recommendations?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Recommendations</h3>
              <ul className="list-disc pl-5">
                {insights.recommendations.map((r, idx) => (
                  <li key={idx} className="text-sm text-gray-600">{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
