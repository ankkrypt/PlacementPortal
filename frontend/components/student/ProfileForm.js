'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function ProfileForm({ profile, onSave }) {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    rollNumber: profile?.rollNumber || '',
    branch: profile?.branch || '',
    cgpa: profile?.cgpa || '',
    semester: profile?.semester || '',
    passingYear: profile?.passingYear || '',
    skills: profile?.skills || [],
    certifications: profile?.certifications || [],
    achievements: profile?.achievements || [],
    linkedIn: profile?.linkedIn || '',
    github: profile?.github || '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '' });
  const [saving, setSaving] = useState(false);

  const tabs = [
    { label: 'Personal & Academic' },
    { label: 'Skills & Certifications' },
    { label: 'Achievements & Links' },
  ];

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const addCertification = () => {
    if (newCert.name && newCert.issuer) {
      setFormData({ ...formData, certifications: [...formData.certifications, { ...newCert, year: parseInt(newCert.year) || new Date().getFullYear() }] });
      setNewCert({ name: '', issuer: '', year: '' });
    }
  };

  const removeCertification = (index) => {
    setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== index) });
  };

  const addAchievement = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ''] });
  };

  const updateAchievement = (index, value) => {
    const updated = [...formData.achievements];
    updated[index] = value;
    setFormData({ ...formData, achievements: updated });
  };

  const removeAchievement = (index) => {
    setFormData({ ...formData, achievements: formData.achievements.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      toast.success('Profile saved!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Calculate completeness
  const requiredFields = ['rollNumber', 'branch', 'cgpa', 'semester', 'passingYear'];
  const filled = requiredFields.filter((f) => formData[f] != null && formData[f] !== '').length;
  const completeness = Math.round((filled / requiredFields.length) * 100);

  const branches = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'];

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-700">Profile Completeness</span>
          <span className={completeness === 100 ? 'text-green-600 font-medium' : 'text-blue-600'}>{completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              completeness === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${completeness}%` }}
          ></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
              activeTab === i
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Personal & Academic */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number *</label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter roll number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGPA *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Current semester"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Year *</label>
              <input
                type="number"
                value={formData.passingYear}
                onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., 2026"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills & Certifications */}
      {activeTab === 1 && (
        <div className="space-y-6">
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (press Enter to add)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-blue-600 hover:text-red-600">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Type a skill and press Enter"
              />
              <Button onClick={addSkill} variant="secondary">Add</Button>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
            {formData.certifications.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm">{cert.name} - {cert.issuer} ({cert.year})</span>
                    <button onClick={() => removeCertification(i)} className="text-red-500 hover:text-red-700">&times;</button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={newCert.name}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cert name"
              />
              <input
                type="text"
                value={newCert.issuer}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Issuer"
              />
              <input
                type="number"
                value={newCert.year}
                onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Year"
              />
              <Button onClick={addCertification} variant="secondary">Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Achievements & Links */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
            {formData.achievements.map((ach, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ach}
                  onChange={(e) => updateAchievement(i, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe an achievement"
                />
                <button onClick={() => removeAchievement(i)} className="text-red-500 hover:text-red-700 px-2">✕</button>
              </div>
            ))}
            <Button onClick={addAchievement} variant="secondary">+ Add Achievement</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
