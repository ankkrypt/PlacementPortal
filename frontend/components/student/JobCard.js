'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export default function JobCard({ job }) {
  const deadline = job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'No deadline';
  const isExpired = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);

  return (
    <Link href={`/student/jobs/${job._id}`}>
      <div
        className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${
          !job.isEligible ? 'opacity-60 border-gray-200' : 'border-gray-100 hover:border-blue-200'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.companyProfile?.companyName || job.company?.name || 'Company'}</p>
          </div>
          <Badge status={job.type === 'job' ? 'active' : 'upcoming'}>
            {job.type === 'job' ? 'Job' : 'Internship'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {job.eligibleBranches?.slice(0, 3).map((b) => (
            <span key={b} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{b}</span>
          ))}
          {job.eligibleBranches?.length > 3 && (
            <span className="text-xs text-gray-400">+{job.eligibleBranches.length - 3} more</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
          <div>Package: <strong>{job.package ? `${job.package} LPA` : 'N/A'}</strong></div>
          <div>Location: {job.location || 'N/A'}</div>
          {job.minCgpa > 0 && <div>Min CGPA: <strong>{job.minCgpa}</strong></div>}
          <div>Deadline: {deadline}</div>
        </div>

        {!job.isEligible && job.ineligibilityReasons?.length > 0 && (
          <div className="p-2 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-700 font-medium">Not eligible:</p>
            {job.ineligibilityReasons.map((r, i) => (
              <p key={i} className="text-xs text-yellow-600">• {r}</p>
            ))}
          </div>
        )}

        {isExpired && (
          <p className="text-xs text-red-500 font-medium mt-2">Application deadline passed</p>
        )}

        {job.requiredSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.requiredSkills.slice(0, 4).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
