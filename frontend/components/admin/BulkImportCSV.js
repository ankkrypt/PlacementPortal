'use client';
import { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const sampleCSV = 'name,email,rollNumber,branch,cgpa,passingYear,semester\n' +
  'Ravi Kumar,ravi.kumar@college.edu,CS001,CS,8.5,2026,6\n' +
  'Priya Sharma,priya.sharma@college.edu,CS002,CS,9.2,2026,6\n' +
  'Amit Patel,amit.patel@college.edu,IT001,IT,7.8,2026,6\n' +
  'Neha Singh,neha.singh@college.edu,IT002,IT,8.9,2026,6\n' +
  'Rahul Verma,rahul.verma@college.edu,EC001,EC,8.1,2026,6\n' +
  'Sneha Reddy,sneha.reddy@college.edu,EC002,EC,9.0,2026,6\n' +
  'Arjun Nair,arjun.nair@college.edu,ME001,ME,7.5,2026,6\n' +
  'Ananya Gupta,ananya.gupta@college.edu,ME002,ME,8.3,2026,6\n' +
  'Vikram Singh,vikram.singh@college.edu,CS003,CS,7.2,2027,4\n' +
  'Isha Mehta,isha.mehta@college.edu,IT003,IT,9.1,2027,4';


export default function BulkImportForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const fileInputRef = useRef(null);
  const ROWS_PER_PAGE = 10;

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        toast.error('Only CSV files are allowed');
        return;
      }
      setFile(selected);
      setPage(0);
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
        <Button onClick={downloadSample} variant="outline">Download Sample CSV</Button>
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
        <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        <p className="text-gray-600 font-medium">
          {file ? file.name : 'Click to select CSV file'}
        </p>
        <p className="text-sm text-gray-400 mt-1">Expected columns: name, email, rollNumber, branch, cgpa, passingYear, semester</p>
      </div>

      {/* Import Button — always accessible */}
      {file && (
        <div className="flex justify-center">
          <Button onClick={handleUpload} disabled={uploading} size="lg">
            {uploading ? 'Importing...' : `Import ${preview?.rows.length || 0} Students`}
          </Button>
        </div>
      )}

      {/* Preview with Pagination */}
      {preview && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Preview ({preview.rows.length} rows)</h3>
            {preview.rows.length > ROWS_PER_PAGE && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="min-w-[80px] text-center">
                  Page {page + 1} of {Math.ceil(preview.rows.length / ROWS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * ROWS_PER_PAGE >= preview.rows.length}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-medium text-gray-400 w-10">#</th>
                  {preview.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows
                  .slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)
                  .map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-400 text-xs">{page * ROWS_PER_PAGE + i + 1}</td>
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

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-xl border ${
          result.failed?.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
        }`}>
          <h3 className="font-semibold text-gray-800 mb-2">Import Results</h3>
          <p className="text-green-700">Success: {result.imported} students imported successfully</p>
          {result.failed?.length > 0 && (
            <div className="mt-2">
              <p className="text-red-600">Failed: {result.failed.length} entries:</p>
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
