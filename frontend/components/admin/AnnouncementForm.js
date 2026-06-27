'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function AnnouncementForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRoles: ['all'],
    isPinned: false,
  });

  const roles = ['all', 'student', 'company', 'faculty'];

  const toggleRole = (role) => {
    let updated;
    if (role === 'all') {
      updated = ['all'];
    } else {
      updated = formData.targetRoles.filter((r) => r !== 'all');
      if (updated.includes(role)) {
        updated = updated.filter((r) => r !== role);
      } else {
        updated.push(role);
      }
      if (updated.length === 0) updated = ['all'];
    }
    setFormData({ ...formData, targetRoles: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    onSubmit(formData);
    setFormData({ title: '', content: '', targetRoles: ['all'], isPinned: false });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Announcement title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Write announcement content..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => toggleRole(role)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                formData.targetRoles.includes(role)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={formData.isPinned}
          onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
          className="rounded border-gray-300 text-blue-600"
        />
        Pin this announcement
      </label>
      <Button type="submit">Post Announcement</Button>
    </form>
  );
}
