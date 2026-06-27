'use client';
import { useState, useEffect, useRef } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import StatCard from '@/components/ui/StatCard';
import PlacementBarChart from '@/components/charts/PlacementBarChart';
import BranchPieChart from '@/components/charts/BranchPieChart';
import CompanyWiseChart from '@/components/charts/CompanyWiseChart';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

export default function FacultyReportsPage() {
  const [summary, setSummary] = useState(null);
  const [branchData, setBranchData] = useState([]);
  const [companyWise, setCompanyWise] = useState([]);
  const [filterBranch, setFilterBranch] = useState('');
  const [loading, setLoading] = useState(true);

  const branches = ['CS', 'IT', 'EC', 'ME', 'CE', 'EE', 'MCA', 'MBA', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, branchRes, coRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/branch-wise'),
        api.get('/reports/company-wise'),
      ]);
      setSummary(sumRes.data.data);
      setBranchData(branchRes.data.data);
      setCompanyWise(coRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranchData = filterBranch
    ? branchData.filter((d) => d.branch === filterBranch)
    : branchData;

  const branchChartData = filteredBranchData.map((d) => ({
    branch: d.branch,
    placed: d.placed,
    unplaced: d.total - d.placed,
  }));

  return (
    <RoleLayout allowedRoles={['faculty']}>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Placement Reports</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard label="Total Students" value={summary?.totalStudents || 0} color="blue" />
              <StatCard label="Placed" value={summary?.placed || 0} color="green" />
              <StatCard label="Placement %" value={summary?.placementPercentage ? `${summary.placementPercentage}%` : '0%'} color="purple" />
            </div>

            {/* Branch Filter */}
            <div className="mb-4">
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Placed vs Unplaced by Branch</h2>
                <PlacementBarChart data={branchChartData} />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Placed Students by Branch</h2>
                <BranchPieChart data={filteredBranchData} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Students Hired by Company</h2>
              <CompanyWiseChart data={companyWise} />
            </div>
          </>
        )}
      </div>
    </RoleLayout>
  );
}
