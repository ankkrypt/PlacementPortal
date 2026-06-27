'use client';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';

export default function ApplicationRow({ application }) {
  const [expanded, setExpanded] = useState(false);
  const job = application.job || {};
  const companyName = job.companyProfile?.companyName || 'Company';
  const statusHistory = application.statusHistory || [];
  const statusOrder = ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];

  const getStatusIndex = (s) => statusOrder.indexOf(s);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium text-gray-800">{job.title || 'Job Title'}</p>
            <p className="text-sm text-gray-500">{companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={application.status}>{application.status?.replace(/_/g, ' ')}</Badge>
          <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && statusHistory.length > 0 && (
        <div className="px-4 pb-4 pt-0">
          <div className="relative ml-1">
            {statusHistory.map((entry, i) => {
              const stepIndex = getStatusIndex(entry.status);
              const isLast = i === statusHistory.length - 1;

              return (
                <div key={i} className="flex gap-3 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      stepIndex >= 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
                    }`}></div>
                    {!isLast && <div className="w-0.5 h-full bg-blue-200 absolute top-3"></div>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 capitalize">{entry.status?.replace(/_/g, ' ')}</p>
                    {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                    <p className="text-xs text-gray-400">{entry.changedAt ? new Date(entry.changedAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
