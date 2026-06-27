'use client';
import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function ResumeUpload({ profile, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!/\.(pdf|doc|docx)$/i.test(selected.name)) {
        alert('Only PDF, DOC, DOCX files are allowed');
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpload(res.data.data);
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get('/students/resume/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = profile?.resumeOriginalName || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Resume */}
      {profile?.resumeUrl && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="font-medium text-blue-800">{profile.resumeOriginalName || 'Resume'}</p>
                <p className="text-sm text-blue-600">Uploaded</p>
              </div>
            </div>
            <Button onClick={handleDownload} variant="outline">Download</Button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
        <div className="text-4xl mb-3">📤</div>
        <p className="text-gray-600 font-medium">
          {file ? file.name : 'Click to select resume'}
        </p>
        <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
      </div>

      {file && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-700">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          <div className="flex gap-2">
            <Button onClick={() => { setFile(null); fileInputRef.current.value = ''; }} variant="secondary">Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      )}

      {!profile?.resumeUrl && !file && (
        <p className="text-sm text-gray-400 text-center">No resume uploaded yet</p>
      )}
    </div>
  );
}
