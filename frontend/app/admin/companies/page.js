'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import ApprovalTable from '@/components/admin/ApprovalTable';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCompaniesPage() {
  const [tab, setTab] = useState('pending');
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const res = await api.get('/admin/pending-companies');
        setPendingCompanies(res.data.data);
      } else {
        const res = await api.get('/admin/companies');
        setApprovedCompanies(res.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/companies/${id}/approve`);
      toast.success('Company approved!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/companies/${id}/reject`);
      toast.success('Company rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  return (
    <RoleLayout allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Companies</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              tab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Pending Approval ({pendingCompanies.length})
          </button>
          <button
            onClick={() => setTab('approved')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              tab === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            All Companies
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse h-48 bg-gray-200 rounded-xl"></div>
        ) : tab === 'pending' ? (
          <ApprovalTable items={pendingCompanies} type="company" onApprove={handleApprove} onReject={handleReject} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Joined On</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No companies found</td>
                    </tr>
                  ) : (
                    approvedCompanies.map((c) => (
                      <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                        <td className="px-4 py-3 text-gray-600">{c.email}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}
