'use client';
import { useState, useEffect } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [pending, setPending] = useState({ students: 0, companies: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, penStudentRes, penCompanyRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/admin/pending-students'),
        api.get('/admin/pending-companies'),
      ]);
      setSummary(sumRes.data.data);
      setPending({
        students: penStudentRes.data.data.length,
        companies: penCompanyRes.data.data.length,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RoleLayout allowedRoles={['admin']}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        {/* Pending Approvals Alert */}
        {(pending.students > 0 || pending.companies > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Pending Approvals</p>
                <p className="text-sm text-yellow-600">
                  {pending.students > 0 && `${pending.students} student(s) `}
                  {pending.companies > 0 && `${pending.companies} company/companies`}
                  {' '}awaiting approval
                </p>
              </div>
              <Link href="/admin/students" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Review →
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Students" value={summary?.totalStudents || 0} icon="🎓" color="blue" />
          <StatCard label="Placed" value={summary?.placed || 0} icon="✅" color="green" />
          <StatCard label="Placement %" value={summary?.placementPercentage ? `${summary.placementPercentage}%` : '0%'} icon="📊" color="purple" />
          <StatCard label="Avg Package" value={summary?.avgPackage ? `${summary.avgPackage} LPA` : '0 LPA'} icon="💰" color="yellow" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Companies" value={summary?.totalCompanies || 0} icon="🏢" color="indigo" />
          <StatCard label="Active Drives" value={summary?.totalDrives || 0} icon="🚗" color="red" />
          <StatCard label="Highest Package" value={summary?.highestPackage ? `${summary.highestPackage} LPA` : '0 LPA'} icon="🏆" color="green" />
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/admin/students" className="p-3 bg-blue-50 rounded-lg text-blue-700 font-medium hover:bg-blue-100 transition-colors">
              👨‍🎓 Manage Students
            </Link>
            <Link href="/admin/companies" className="p-3 bg-purple-50 rounded-lg text-purple-700 font-medium hover:bg-purple-100 transition-colors">
              🏢 Manage Companies
            </Link>
            <Link href="/admin/drives" className="p-3 bg-green-50 rounded-lg text-green-700 font-medium hover:bg-green-100 transition-colors">
              🚗 Manage Drives
            </Link>
            <Link href="/admin/announcements" className="p-3 bg-yellow-50 rounded-lg text-yellow-700 font-medium hover:bg-yellow-100 transition-colors">
              📢 Post Announcement
            </Link>
            <Link href="/admin/bulk-import" className="p-3 bg-indigo-50 rounded-lg text-indigo-700 font-medium hover:bg-indigo-100 transition-colors">
              📥 Bulk Import
            </Link>
            <Link href="/admin/reports" className="p-3 bg-red-50 rounded-lg text-red-700 font-medium hover:bg-red-100 transition-colors">
              📈 View Reports
            </Link>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
