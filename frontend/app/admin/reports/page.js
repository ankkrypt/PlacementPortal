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
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const reportEl = reportRef.current;
      if (!reportEl) return;

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;

      // ── Brand colors (matching website) ──────────────────────
      const navy = [30, 58, 95];        // #1e3a5f
      const accent = [58, 95, 138];     // #3a5f8a
      const lightBlue = [239, 244, 250]; // #eff4fa

      let pageNum = 0;

      // ── Helper: draw branded header on current page ───────────
      const addHeader = () => {
        pageNum++;
        // Main header bar
        pdf.setFillColor(...navy);
        pdf.rect(0, 0, pageWidth, 14, 'F');
        // Accent subtitle bar
        pdf.setFillColor(...accent);
        pdf.rect(0, 14, pageWidth, 5, 'F');
        // College name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text('TIMSCDR', margin, 9);
        pdf.setFontSize(6);
        pdf.text('Placement Portal', margin, 13);
        // Title and date on subtitle bar
        pdf.setFontSize(7);
        pdf.text('Placement Report', margin, 17.5);
        const dateStr = new Date().toLocaleDateString('en-IN', {
          year: 'numeric', month: 'short', day: 'numeric',
        });
        pdf.text(`Generated: ${dateStr}`, pageWidth - margin, 17.5, { align: 'right' });
        // Thin separator below header
        pdf.setDrawColor(...accent);
        pdf.setLineWidth(0.3);
        pdf.line(margin, 20, pageWidth - margin, 20);
      };

      // ── Helper: draw branded footer on current page ───────────
      const addFooter = () => {
        pdf.setFillColor(...navy);
        pdf.rect(0, pageHeight - 8, pageWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.text('TIMSCDR Placement Portal', margin, pageHeight - 2.5);
        pdf.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 2.5, { align: 'right' });
      };

      // ── Helper: draw a section title bar ─────────────────────
      const addSectionTitle = (y, title) => {
        pdf.setFillColor(...lightBlue);
        pdf.rect(margin, y - 4, pageWidth - 2 * margin, 7, 'F');
        pdf.setTextColor(...navy);
        pdf.setFontSize(10);
        pdf.text(title, margin + 2, y + 0.5);
        return y + 7;
      };

      // ──────────────────────────────────────────────────────────
      // TRY: Visual capture via html2canvas
      // ──────────────────────────────────────────────────────────
      try {
        const canvas = await html2canvas(reportEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Render image across pages with header/footer overlays
        const headerHeight = 20; // space for header + separator
        const footerHeight = 8;
        const usableHeight = pageHeight - headerHeight - footerHeight - 4;

        let yOffset = 0;
        while (yOffset < imgHeight) {
          if (pageNum > 0) pdf.addPage();
          addHeader();
          // Use negative y-offset to slice the tall image across pages
          pdf.addImage(
            imgData, 'PNG',
            margin, headerHeight + 2 - yOffset,
            imgWidth, imgHeight
          );
          addFooter();
          yOffset += usableHeight;
        }
      } catch (htmlError) {
        // ────────────────────────────────────────────────────────
        // FALLBACK: text-based PDF with full branding
        // ────────────────────────────────────────────────────────
        console.warn('html2canvas failed, using text fallback:', htmlError);
        let y = 0;

        const newPage = () => {
          if (y > 0) pdf.addPage();
          addHeader();
          y = 26;
          addFooter();
        };

        const checkPage = (needed = 10) => {
          if (y + needed > pageHeight - 12) {
            newPage();
          }
        };

        const addLabelValue = (label, value) => {
          checkPage(6);
          pdf.setTextColor(60, 60, 60);
          pdf.setFontSize(9);
          pdf.text(label, margin + 4, y);
          const valX = margin + 45;
          pdf.setTextColor(...navy);
          pdf.setFontSize(9);
          pdf.text(String(value), valX, y);
          y += 5.5;
        };

        newPage();

        // ── Summary Section ─────────────────────────────────
        if (summary) {
          y = addSectionTitle(y, 'Summary');
          addLabelValue('Total Students', summary.totalStudents || 0);
          addLabelValue('Placed', summary.placed || 0);
          addLabelValue('Unplaced', summary.unplaced || 0);
          addLabelValue('Placement %', `${summary.placementPercentage ?? 0}%`);
          addLabelValue('Average Package', `${summary.avgPackage ?? 0} LPA`);
          addLabelValue('Highest Package', `${summary.highestPackage ?? 0} LPA`);
          addLabelValue('Companies', summary.totalCompanies || 0);
          addLabelValue('Total Drives', summary.totalDrives || 0);
          y += 3;
        }

        // ── Branch-wise Section ─────────────────────────────
        if (branchData.length > 0) {
          checkPage(12);
          y = addSectionTitle(y, 'Branch-wise Placement');
          // Table header
          checkPage(8);
          pdf.setFillColor(...lightBlue);
          pdf.rect(margin + 2, y - 4, pageWidth - 2 * margin - 4, 6, 'F');
          pdf.setTextColor(...navy);
          pdf.setFontSize(8);
          const colX = [margin + 6, margin + 45, margin + 75, margin + 105];
          pdf.text('Branch', colX[0], y + 0.5);
          pdf.text('Total', colX[1], y + 0.5);
          pdf.text('Placed', colX[2], y + 0.5);
          pdf.text('Percentage', colX[3], y + 0.5);
          y += 8;

          branchData.forEach((b, i) => {
            checkPage(6);
            if (i % 2 === 1) {
              pdf.setFillColor(245, 247, 250);
              pdf.rect(margin + 2, y - 4, pageWidth - 2 * margin - 4, 5.5, 'F');
            }
            pdf.setTextColor(60, 60, 60);
            pdf.setFontSize(9);
            pdf.text(b.branch || 'N/A', colX[0], y);
            pdf.text(String(b.total || 0), colX[1], y);
            pdf.text(String(b.placed || 0), colX[2], y);
            pdf.text(`${b.percentage || 0}%`, colX[3], y);
            y += 6;
          });
          y += 4;
        }

        // ── Company-wise Section ────────────────────────────
        if (companyWise.length > 0) {
          checkPage(12);
          y = addSectionTitle(y, 'Company-wise Hires');
          checkPage(8);
          pdf.setFillColor(...lightBlue);
          pdf.rect(margin + 2, y - 4, pageWidth - 2 * margin - 4, 6, 'F');
          pdf.setTextColor(...navy);
          pdf.setFontSize(8);
          const cColX = [margin + 6, margin + 70, margin + 120];
          pdf.text('Company', cColX[0], y + 0.5);
          pdf.text('Students Hired', cColX[1], y + 0.5);
          pdf.text('Avg Package', cColX[2], y + 0.5);
          y += 8;

          companyWise.forEach((c, i) => {
            checkPage(6);
            if (i % 2 === 1) {
              pdf.setFillColor(245, 247, 250);
              pdf.rect(margin + 2, y - 4, pageWidth - 2 * margin - 4, 5.5, 'F');
            }
            pdf.setTextColor(60, 60, 60);
            pdf.setFontSize(9);
            pdf.text(c.companyName || 'N/A', cColX[0], y);
            pdf.text(String(c.studentsHired || 0), cColX[1], y);
            pdf.text(`${c.avgPackage || 0} LPA`, cColX[2], y);
            y += 6;
          });
          y += 4;
        }

        // ── Year-wise Section ───────────────────────────────
        if (yearWise.length > 0) {
          checkPage(12);
          y = addSectionTitle(y, 'Year-wise Statistics');
          checkPage(8);
          pdf.setFillColor(...lightBlue);
          pdf.rect(margin + 2, y - 4, pageWidth - 2 * margin - 4, 6, 'F');
          pdf.setTextColor(...navy);
          pdf.setFontSize(8);
          const yColX = [margin + 6, margin + 70, margin + 120];
          pdf.text('Year', yColX[0], y + 0.5);
          pdf.text('Placed', yColX[1], y + 0.5);
          pdf.text('Unplaced', yColX[2], y + 0.5);
          y += 8;

          yearWise.forEach((yr, i) => {
            checkPage(6);
            if (i % 2 === 1) {
              pdf.setFillColor(245, 247, 250);
              pdf.rect(margin + 2, y - 4, pageWidth - 2 * margin - 4, 5.5, 'F');
            }
            pdf.setTextColor(60, 60, 60);
            pdf.setFontSize(9);
            pdf.text(String(yr.year || 'N/A'), yColX[0], y);
            pdf.text(String(yr.placed || 0), yColX[1], y);
            pdf.text(String(yr.unplaced || 0), yColX[2], y);
            y += 6;
          });
        }
      }

      const year = new Date().getFullYear();
      pdf.save(`TIMSCDR-Placement-Report-${year}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
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
