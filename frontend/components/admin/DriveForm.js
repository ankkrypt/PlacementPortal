'use client';
import { useState } from 'react';

export default function DriveForm({ companies, jobs, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    job: '',
    date: '',
    venue: '',
    eligibleBatches: [],
    notes: '',
    rounds: [{ roundNumber: 1, name: '', scheduledTime: '', venue: '' }],
  });

  const [batchInput, setBatchInput] = useState('');

  const addBatch = () => {
    if (batchInput.trim() && !formData.eligibleBatches.includes(batchInput.trim())) {
      setFormData({ ...formData, eligibleBatches: [...formData.eligibleBatches, batchInput.trim()] });
      setBatchInput('');
    }
  };

  const removeBatch = (batch) => {
    setFormData({ ...formData, eligibleBatches: formData.eligibleBatches.filter((b) => b !== batch) });
  };

  const addRound = () => {
    setFormData({
      ...formData,
      rounds: [...formData.rounds, { roundNumber: formData.rounds.length + 1, name: '', scheduledTime: '', venue: '' }],
    });
  };

  const updateRound = (index, field, value) => {
    const updated = formData.rounds.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    setFormData({ ...formData, rounds: updated });
  };

  const removeRound = (index) => {
    const updated = formData.rounds.filter((_, i) => i !== index).map((r, i) => ({ ...r, roundNumber: i + 1 }));
    setFormData({ ...formData, rounds: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedCompany = companies.find((c) => c._id === formData.company);
  const filteredJobs = selectedCompany
    ? jobs.filter((j) => j.companyProfile?._id === formData.company || j.company === formData.company)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Drive Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="e.g., Infosys Campus Drive 2024"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
          <select
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job *</label>
          <select
            value={formData.job}
            onChange={(e) => setFormData({ ...formData, job: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
            disabled={!formData.company}
          >
            <option value="">Select Job</option>
            {filteredJobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Main Auditorium"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Batches</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.eligibleBatches.map((b) => (
            <span key={b} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
              {b}
              <button type="button" onClick={() => removeBatch(b)} className="text-blue-600 hover:text-red-600">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBatch())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., 2024"
          />
          <button type="button" onClick={addBatch} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Add</button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Rounds</h3>
          <button type="button" onClick={addRound} className="text-sm text-blue-600 hover:text-blue-800">+ Add Round</button>
        </div>
        {formData.rounds.map((round, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={round.name}
              onChange={(e) => updateRound(i, 'name', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Round name"
            />
            <input
              type="time"
              value={round.scheduledTime}
              onChange={(e) => updateRound(i, 'scheduledTime', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={round.venue}
                onChange={(e) => updateRound(i, 'venue', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Venue"
              />
              {formData.rounds.length > 1 && (
                <button type="button" onClick={() => removeRound(i)} className="text-red-500 hover:text-red-700">✕</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Additional notes..."
        />
      </div>

      <button
        type="submit"
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Create Drive
      </button>
    </form>
  );
}
