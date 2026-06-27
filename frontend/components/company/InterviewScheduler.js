'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function InterviewScheduler({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    scheduledAt: '',
    venue: '',
    roundName: 'Technical',
    mode: 'offline',
    meetLink: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Round Name</label>
          <select
            value={formData.roundName}
            onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Aptitude">Aptitude Test</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Managerial">Managerial</option>
            <option value="Group Discussion">Group Discussion</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'offline' })}
              className={`flex-1 py-2 rounded-lg border-2 text-sm ${
                formData.mode === 'offline' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              Offline
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'online' })}
              className={`flex-1 py-2 rounded-lg border-2 text-sm ${
                formData.mode === 'online' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              Online
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Room / Hall name"
          />
        </div>
      </div>

      {formData.mode === 'online' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
          <input
            type="url"
            value={formData.meetLink}
            onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://meet.google.com/..."
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
        <Button type="submit">Schedule Interview</Button>
      </div>
    </form>
  );
}
