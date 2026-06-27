'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import AnnouncementForm from '@/components/admin/AnnouncementForm';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    try {
      await api.post('/announcements', data);
      toast.success('Announcement posted!');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to post announcement');
    }
  };

  const handleTogglePin = async (id, isPinned) => {
    try {
      await api.put(`/announcements/${id}`, { isPinned: !isPinned });
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <RoleLayout allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Post Announcement</h2>
              <AnnouncementForm onSubmit={handleCreate} />
            </div>
          </div>

          {/* Announcements List */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-5xl mb-4">📢</div>
                <p className="text-gray-500 text-lg">No announcements yet</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann._id} className={`bg-white rounded-xl p-5 shadow-sm border ${
                  ann.isPinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {ann.isPinned && <span className="text-yellow-500">📌</span>}
                        <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                        <div className="flex gap-1">
                          {(ann.targetRoles || []).map((role) => (
                            <Badge key={role} status={role === 'all' ? 'active' : 'upcoming'}>{role}</Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{ann.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Posted by {ann.postedBy?.name || 'Admin'} on {new Date(ann.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleTogglePin(ann._id, ann.isPinned)}
                        variant={ann.isPinned ? 'primary' : 'outline'}
                        className="text-xs px-2 py-1"
                      >
                        {ann.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button onClick={() => handleDelete(ann._id)} variant="danger" className="text-xs px-2 py-1">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
