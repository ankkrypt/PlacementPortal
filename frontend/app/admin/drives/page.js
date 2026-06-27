'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/drives');
      setDrives(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/drives/${id}`);
      toast.success('Drive deleted');
      fetchDrives();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const statusOrder = { upcoming: 0, ongoing: 1, completed: 2 };
  const sortedDrives = [...drives].sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));

  return (
    <RoleLayout allowedRoles={['admin']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Placement Drives</h1>
          <Link href="/admin/drives/create">
            <Button>+ Create Drive</Button>
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        ) : sortedDrives.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-gray-500 text-lg">No drives scheduled</p>
            <Link href="/admin/drives/create">
              <Button className="mt-4">Create First Drive</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedDrives.map((drive) => (
              <div key={drive._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{drive.title}</h3>
                      <Badge status={drive.status} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      🏢 {drive.company?.companyName || 'N/A'} • 💼 {drive.job?.title || 'N/A'}
                    </p>
                    {drive.date && (
                      <p className="text-sm text-gray-500">📅 {new Date(drive.date).toLocaleDateString()} • 📍 {drive.venue || 'N/A'}</p>
                    )}
                  </div>
                  <Button onClick={() => handleDelete(drive._id)} variant="danger" className="text-xs">Delete</Button>
                </div>
                {drive.rounds?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {drive.rounds.map((r) => (
                      <span key={r.roundNumber} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        Round {r.roundNumber}: {r.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
