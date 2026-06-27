'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    description: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/companies/profile');
      const p = res.data.data;
      setProfile(p);
      setFormData({
        companyName: p.companyName || '',
        industry: p.industry || '',
        website: p.website || '',
        description: p.description || '',
        hrName: p.hrName || '',
        hrEmail: p.hrEmail || '',
        hrPhone: p.hrPhone || '',
        location: p.location || '',
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/companies/profile', formData);
      setProfile(res.data.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleLayout allowedRoles={['company']}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Company Profile</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-700 mb-3">HR Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HR Name</label>
                    <input
                      type="text"
                      value={formData.hrName}
                      onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HR Email</label>
                    <input
                      type="email"
                      value={formData.hrEmail}
                      onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HR Phone</label>
                    <input
                      type="tel"
                      value={formData.hrPhone}
                      onChange={(e) => setFormData({ ...formData, hrPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  );
}
