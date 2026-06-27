'use client';
import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const sampleCSV = 'name,email,rollNumber,branch,cgpa,passingYear,semester\nJohn Doe,john@college.edu,CS001,CS,8.5,2026,6\nJane Smith,jane@college.edu,IT001,IT,9.0,2026,6';

export default function BulkImportForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        toast.error('Only CSV files are allowed');
        return;
      }
      setFile(selected);
      // Parse for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = Papa.parse(event.target.result, {
            header: true,
            skipEmptyLines: true,
            trimHeaders: true,
          });
          if (parsed.data.length > 0) {
            setPreview({ headers: Object.keys(parsed.data[0]), rows: parsed.data });
          }
        } catch (error) {
          toast.error('Failed to parse CSV preview');
        }
      };
      reader.readAsText(selected);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);
      const res = await api.post('/admin/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      if (res.data.imported > 0) toast.success(`${res.data.imported} students imported!`);
      if (res.data.failed?.length > 0) toast.error(`${res.data.failed.length} failed`);
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-students.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Download Sample */}
      <div className="flex justify-end">
        <Button onClick={downloadSample} variant="outline">📥 Download Sample CSV</Button>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv"
          className="hidden"
        />
        <div className="text-4xl mb-3">📤</div>
        <p className="text-gray-600 font-medium">
          {file ? file.name : 'Click to select CSV file'}
        </p>
        <p className="text-sm text-gray-400 mt-1">Expected columns: name, email, rollNumber, branch, cgpa, passingYear, semester</p>
      </div>

      {/* Preview */}
      {preview && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Preview ({preview.rows.length} rows)</h3>
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {preview.headers.map((h, j) => (
                      <td key={j} className={`px-3 py-2 ${!row[h] ? 'text-red-500' : 'text-gray-700'}`}>
                        {row[h] || <span className="italic text-red-400">missing</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {file && (
        <div className="flex justify-center">
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Importing...' : `Import ${preview?.rows.length || 0} Students`}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-xl border ${
          result.failed?.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
        }`}>
          <h3 className="font-semibold text-gray-800 mb-2">Import Results</h3>
          <p className="text-green-700">✅ {result.imported} students imported successfully</p>
          {result.failed?.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600">❌ {result.failed.length} failed:</p>
              {result.failed.map((f, i) => (
                <p key={i} className="text-sm text-red-500 ml-4">{f.row?.email || 'Unknown'}: {f.reason}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
