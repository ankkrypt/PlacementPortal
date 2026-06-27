'use client';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ApplicantTable({
  applications,
  selected,
  onToggleSelect,
  onStatusUpdate,
  onDownloadResume,
  onScheduleInterview,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      applications.forEach((a) => {
                        if (!selected.includes(a._id)) onToggleSelect(a._id);
                      });
                    } else {
                      selected.forEach((id) => onToggleSelect(id));
                    }
                  }}
                  checked={selected.length === applications.length && applications.length > 0}
                  className="rounded border-gray-300 text-blue-600"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Student</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Branch</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">CGPA</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Skills</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Applied On</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No applications yet</td>
              </tr>
            ) : (
              applications.map((app) => {
                const profile = app.studentProfile || {};
                return (
                  <tr key={app._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(app._id)}
                        onChange={() => onToggleSelect(app._id)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{app.student?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{app.student?.email}</p>
                    </td>
                    <td className="px-4 py-3">{profile.branch || '-'}</td>
                    <td className="px-4 py-3 font-medium">{profile.cgpa || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(profile.skills || []).slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                        ))}
                        {(profile.skills || []).length > 3 && <span className="text-xs text-gray-400">+{profile.skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge status={app.status}>{app.status?.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {app.status === 'applied' && (
                          <>
                            <Button onClick={() => onStatusUpdate(app._id, 'shortlisted')} variant="success" className="text-xs px-2 py-1">Shortlist</Button>
                            <Button onClick={() => onStatusUpdate(app._id, 'rejected')} variant="danger" className="text-xs px-2 py-1">Reject</Button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <Button onClick={() => onScheduleInterview(app.student?._id)} variant="primary" className="text-xs px-2 py-1">Schedule Interview</Button>
                        )}
                        <Button onClick={() => onDownloadResume(app._id)} variant="outline" className="text-xs px-2 py-1">Resume</Button>
                      </div>
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
