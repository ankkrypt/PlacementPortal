'use client';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function ApprovalTable({ items, type, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              {type === 'student' && <th className="px-4 py-3 text-left font-medium text-gray-600">Roll No</th>}
              {type === 'company' && <th className="px-4 py-3 text-left font-medium text-gray-600">Industry</th>}
              <th className="px-4 py-3 text-left font-medium text-gray-600">Registered On</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No {type}s found</td>
              </tr>
            ) : (
              items.map((item) => {
                const profile = item.studentProfile || item.companyProfile || {};
                return (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name || item.user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.email || item.user?.email || 'N/A'}</td>
                    {type === 'student' && <td className="px-4 py-3">{profile.rollNumber || '-'}</td>}
                    {type === 'company' && <td className="px-4 py-3">{profile.industry || '-'}</td>}
                    <td className="px-4 py-3 text-gray-600">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={item.status || 'pending'} />
                    </td>
                    <td className="px-4 py-3">
                      {item.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button onClick={() => onApprove(item._id)} variant="success" className="text-xs px-2 py-1">
                            Approve
                          </Button>
                          <Button onClick={() => onReject(item._id)} variant="danger" className="text-xs px-2 py-1">
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
