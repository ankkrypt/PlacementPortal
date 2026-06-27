'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function JobForm({ onSubmit, aiLoading, onAiGenerate }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: 'job',
    description: '',
    requirements: '',
    location: '',
    package: '',
    stipend: '',
    eligibleBranches: [],
    minCgpa: 0,
    requiredSkills: [],
    rounds: [{ roundNumber: 1, name: '', description: '' }],
    applicationDeadline: '',
    driveDate: '',
    vacancies: '',
    status: 'draft',
  });
  const [skillInput, setSkillInput] = useState('');

  const branches = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'];

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleBranch = (branch) => {
    const updated = formData.eligibleBranches.includes(branch)
      ? formData.eligibleBranches.filter((b) => b !== branch)
      : [...formData.eligibleBranches, branch];
    updateField('eligibleBranches', updated);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      updateField('requiredSkills', [...formData.requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    updateField('requiredSkills', formData.requiredSkills.filter((s) => s !== skill));
  };

  const addRound = () => {
    const newRound = { roundNumber: formData.rounds.length + 1, name: '', description: '' };
    updateField('rounds', [...formData.rounds, newRound]);
  };

  const updateRound = (index, field, value) => {
    const updated = formData.rounds.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    );
    updateField('rounds', updated);
  };

  const removeRound = (index) => {
    const updated = formData.rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, roundNumber: i + 1 }));
    updateField('rounds', updated);
  };

  const handlePublish = () => {
    onSubmit({ ...formData, status: 'active' });
  };

  const handleSaveDraft = () => {
    onSubmit({ ...formData, status: 'draft' });
  };

  const handleAiGenerate = () => {
    onAiGenerate({
      role: formData.title,
      type: formData.type,
      skills: formData.requiredSkills.join(', '),
      package: formData.package,
      location: formData.location,
      companyDesc: '',
    });
  };

  return (
    <div>
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['Basic Info', 'Eligibility', 'Rounds', 'Dates'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i + 1}
            </button>
            <span className={`text-sm ${step === i + 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{label}</span>
            {i < 3 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateField('type', 'job')}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
                  formData.type === 'job' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                Full-time Job
              </button>
              <button
                type="button"
                onClick={() => updateField('type', 'internship')}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
                  formData.type === 'internship' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                Internship
              </button>
            </div>
            <Button onClick={handleAiGenerate} disabled={aiLoading} variant="outline" className="text-xs">
              {aiLoading ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Bangalore"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === 'job' ? 'Package (LPA)' : 'Monthly Stipend'}
              </label>
              <input
                type="number"
                value={formData.package}
                onChange={(e) => updateField('package', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={formData.type === 'job' ? 'e.g., 12' : 'e.g., 25000'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vacancies</label>
              <input
                type="number"
                value={formData.vacancies}
                onChange={(e) => updateField('vacancies', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Number of openings"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe the role..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => updateField('requirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Describe the requirements..."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Next: Eligibility →</Button>
          </div>
        </div>
      )}

      {/* Step 2: Eligibility */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Branches</label>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBranch(b)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    formData.eligibleBranches.includes(b)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum CGPA: {formData.minCgpa}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={formData.minCgpa}
              onChange={(e) => updateField('minCgpa', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.requiredSkills.map((s) => (
                <span key={s} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-blue-600 hover:text-red-600">&times;</button>
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
                placeholder="Type skill and press Enter"
              />
              <Button onClick={addSkill} variant="secondary">Add</Button>
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(1)} variant="secondary">← Previous</Button>
            <Button onClick={() => setStep(3)}>Next: Rounds →</Button>
          </div>
        </div>
      )}

      {/* Step 3: Rounds */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Selection Rounds</h3>
            <Button onClick={addRound} variant="secondary">+ Add Round</Button>
          </div>
          {formData.rounds.map((round, i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-600">Round {round.roundNumber}</span>
                {formData.rounds.length > 1 && (
                  <button onClick={() => removeRound(i)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={round.name}
                  onChange={(e) => updateRound(i, 'name', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Round name (e.g., Aptitude Test)"
                />
                <input
                  type="text"
                  value={round.description}
                  onChange={(e) => updateRound(i, 'description', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Brief description"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <Button onClick={() => setStep(2)} variant="secondary">← Previous</Button>
            <Button onClick={() => setStep(4)}>Next: Dates →</Button>
          </div>
        </div>
      )}

      {/* Step 4: Dates */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
              <input
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => updateField('applicationDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Drive Date</label>
              <input
                type="date"
                value={formData.driveDate}
                onChange={(e) => updateField('driveDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button onClick={() => setStep(3)} variant="secondary">← Previous</Button>
            <div className="flex gap-2">
              <Button onClick={handleSaveDraft} variant="outline">Save as Draft</Button>
              <Button onClick={handlePublish}>Publish Job</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
