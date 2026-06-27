'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import ApprovalTable from '@/components/admin/ApprovalTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
  const [tab, setTab] = useState('pending');
  const [pendingStudents, setPendingStudents] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [filters, setFilters] = useState({ branch: '', placed: '' });
  const [loading, setLoading] = useState(true);
  const [facultyModal, setFacultyModal] = useState(false);
  const [facultyForm, setFacultyForm] = useState({ name: '', email: '', password: '' });

  const branches = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'];

  useEffect(() => {
    fetchData();
  }, [tab, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const res = await api.get('/admin/pending-students');
        setPendingStudents(res.data.data);
      } else {
        const params = new URLSearchParams();
        if (filters.branch) params.append('branch', filters.branch);
        if (filters.placed) params.append('placed', filters.placed);
        const res = await api.get(`/admin/students?${params}`);
        setApprovedStudents(res.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/students/${id}/approve`);
      toast.success('Student approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/students/${id}/reject`);
      toast.success('Student rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/faculty', facultyForm);
      toast.success('Faculty account created!');
      setFacultyModal(false);
      setFacultyForm({ name: '', email: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create faculty');
    }
  };

  return (
    <RoleLayout allowedRoles={['admin']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <Button onClick={() => setFacultyModal(true)} variant="outline">+ Create Faculty</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pending Approval ({pendingStudents.length})
          </button>
          <button
            onClick={() => setTab('approved')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              tab === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All Students
          </button>
        </div>

        {/* Filters for approved tab */}
        {tab === 'approved' && (
          <div className="flex gap-3 mb-4">
            <select
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              value={filters.placed}
              onChange={(e) => setFilters({ ...filters, placed: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="true">Placed</option>
              <option value="false">Unplaced</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse h-48 bg-gray-200 rounded-xl"></div>
        ) : tab === 'pending' ? (
          <ApprovalTable items={pendingStudents} type="student" onApprove={handleApprove} onReject={handleReject} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Roll No</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Branch</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">CGPA</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No students found</td>
                    </tr>
                  ) : (
                    approvedStudents.map((s) => (
                      <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{s.user?.name || 'N/A'}</td>
                        <td className="px-4 py-3">{s.rollNumber || '-'}</td>
                        <td className="px-4 py-3">{s.branch || '-'}</td>
                        <td className="px-4 py-3">{s.cgpa || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            s.isPlaced ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {s.isPlaced ? 'Placed' : 'Unplaced'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Faculty Modal */}
        <Modal isOpen={facultyModal} onClose={() => setFacultyModal(false)} title="Create Faculty Account">
          <form onSubmit={handleCreateFaculty} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={facultyForm.password}
                onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                minLength={6}
                required
              />
            </div>
            <Button type="submit">Create Faculty</Button>
          </form>
        </Modal>
      </div>
    </RoleLayout>
  );
}
