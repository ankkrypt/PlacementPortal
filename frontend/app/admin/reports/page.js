'use client';
import { useState, useEffect, useRef } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import StatCard from '@/components/ui/StatCard';
import PlacementBarChart from '@/components/charts/PlacementBarChart';
import BranchPieChart from '@/components/charts/BranchPieChart';
import CompanyWiseChart from '@/components/charts/CompanyWiseChart';
import MonthlyDrivesChart from '@/components/charts/MonthlyDrivesChart';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import api from '@/lib/api';

export default function AdminReportsPage() {
  const [summary, setSummary] = useState(null);
  const [branchData, setBranchData] = useState([]);
  const [companyWise, setCompanyWise] = useState([]);
  const [yearWise, setYearWise] = useState([]);
  const [monthlyDrives, setMonthlyDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiModal, setAiModal] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, branchRes, coRes, yearRes, monthlyRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/branch-wise'),
        api.get('/reports/company-wise'),
        api.get('/reports/year-wise'),
        api.get('/reports/monthly-drives'),
      ]);
      setSummary(sumRes.data.data);
      setBranchData(branchRes.data.data);
      setCompanyWise(coRes.data.data);
      setYearWise(yearRes.data.data);
      setMonthlyDrives(monthlyRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAiInsights = async () => {
    setAiLoading(true);
    setAiModal(true);
    try {
      const res = await api.post('/ai/placement-insights', {
        reportData: { summary, branchWise: branchData, companyWise },
      });
      setAiInsights(res.data.data);
    } catch (error) {
      console.error('AI insights error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const reportEl = reportRef.current;

      if (!reportEl) return;

      const canvas = await html2canvas(reportEl, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.height - 20;
      }

      const year = new Date().getFullYear();
      pdf.save(`placement-report-${year}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  if (loading) {
    return (
      <RoleLayout allowedRoles={['admin', 'faculty']}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </RoleLayout>
    );
  }

  const branchChartData = branchData.map((d) => ({
    branch: d.branch,
    placed: d.placed,
    unplaced: d.total - d.placed,
  }));

  return (
    <RoleLayout allowedRoles={['admin', 'faculty']}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Placement Reports</h1>
          <div className="flex gap-2">
            <Button onClick={handleAiInsights} variant="outline">
              {aiLoading ? 'Loading...' : 'AI Insights'}
            </Button>
            <Button onClick={handleExportPDF} variant="secondary">Export PDF</Button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard label="Total Students" value={summary?.totalStudents || 0} color="blue" />
            <StatCard label="Placed" value={summary?.placed || 0} color="green" />
            <StatCard label="Unplaced" value={summary?.unplaced || 0} color="red" />
            <StatCard label="Placement %" value={summary?.placementPercentage ? `${summary.placementPercentage}%` : '0%'} color="purple" />
            <StatCard label="Avg Package" value={summary?.avgPackage ? `${summary.avgPackage} LPA` : '0 LPA'} color="yellow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Highest Package" value={summary?.highestPackage ? `${summary.highestPackage} LPA` : '0 LPA'} color="green" />
            <StatCard label="Companies" value={summary?.totalCompanies || 0} color="indigo" />
            <StatCard label="Total Drives" value={summary?.totalDrives || 0} color="red" />
          </div>

          {/* Branch Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Placed vs Unplaced by Branch</h2>
            <PlacementBarChart data={branchChartData} />
          </div>

          {/* Pie & Company Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Placed Students by Branch</h2>
              <BranchPieChart data={branchData} />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Students Hired by Company</h2>
              <CompanyWiseChart data={companyWise} />
            </div>
          </div>

          {/* Monthly Drives */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Drives ({new Date().getFullYear()})</h2>
            <MonthlyDrivesChart data={monthlyDrives} />
          </div>

          {/* Branch-wise Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Branch-wise Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Branch</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Placed</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {branchData.map((d) => (
                    <tr key={d.branch} className="border-b border-gray-100">
                      <td className="px-4 py-3 font-medium">{d.branch}</td>
                      <td className="px-4 py-3">{d.total}</td>
                      <td className="px-4 py-3">{d.placed}</td>
                      <td className="px-4 py-3">{d.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Insights Modal */}
        <Modal isOpen={aiModal} onClose={() => setAiModal(false)} title="AI Placement Insights">
          {aiLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Analyzing placement data...</p>
            </div>
          ) : aiInsights ? (
            <div className="space-y-4">
              {aiInsights.summary && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{aiInsights.summary}</p>
                </div>
              )}
              {aiInsights.insights?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Insights</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiInsights.insights.map((i, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{i}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.trends?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Trends</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiInsights.trends.map((t, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiInsights.recommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {aiInsights.recommendations.map((r, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Failed to load insights</p>
          )}
        </Modal>
      </div>
    </RoleLayout>
  );
}
