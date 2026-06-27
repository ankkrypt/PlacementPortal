'use client';
const variants = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  applied: { bg: 'bg-blue-100', text: 'text-blue-800' },
  shortlisted: { bg: 'bg-purple-100', text: 'text-purple-800' },
  interview_scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  selected: { bg: 'bg-green-100', text: 'text-green-800' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  closed: { bg: 'bg-red-100', text: 'text-red-800' },
  upcoming: { bg: 'bg-blue-100', text: 'text-blue-800' },
  ongoing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  placed: { bg: 'bg-green-100', text: 'text-green-800' },
  unplaced: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function Badge({ status, children }) {
  const variant = variants[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  const label = children || status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
      {label}
    </span>
  );
}
