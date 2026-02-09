import { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Car,
  Wrench,
  Package,
  TrendingUp,
  History,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { GlassCard } from '../components/ui';
import { useApp } from '../contexts/AppContext';

// Mock report history data
interface ReportHistoryItem {
  id: string;
  type: ReportType;
  dateRange: { start: string; end: string };
  generatedAt: string;
  generatedBy: string;
}

type ReportType = 'fleet' | 'carRequests' | 'maintenance' | 'inventory';

interface ReportStats {
  fleet: {
    totalVehicles: number;
    available: number;
    assigned: number;
    inTransit: number;
    underMaintenance: number;
    utilizationRate: number;
  };
  carRequests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
    avgProcessingDays: number;
  };
  maintenance: {
    total: number;
    preventive: number;
    corrective: number;
    completed: number;
    inProgress: number;
    avgCompletionDays: number;
  };
  inventory: {
    totalParts: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    categories: number;
  };
}

export function Reports() {
  const { t } = useTranslation();
  const { vehicles, maintenance, inventory, showToast } = useApp();

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedReport, setSelectedReport] = useState<ReportType>('fleet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHistoryReports, setSelectedHistoryReports] = useState<string[]>([]);

  // Mock report history - will be replaced with actual data later
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([
    { id: 'RPT-001', type: 'fleet', dateRange: { start: '2024-01-01', end: '2024-01-31' }, generatedAt: '2024-01-31 14:30', generatedBy: 'Admin' },
    { id: 'RPT-002', type: 'maintenance', dateRange: { start: '2024-01-01', end: '2024-01-31' }, generatedAt: '2024-01-30 10:15', generatedBy: 'Admin' },
    { id: 'RPT-003', type: 'carRequests', dateRange: { start: '2024-01-15', end: '2024-01-31' }, generatedAt: '2024-01-28 16:45', generatedBy: 'Operations' },
    { id: 'RPT-004', type: 'inventory', dateRange: { start: '2024-01-01', end: '2024-01-31' }, generatedAt: '2024-01-25 09:00', generatedBy: 'Garage' },
    { id: 'RPT-005', type: 'fleet', dateRange: { start: '2023-12-01', end: '2023-12-31' }, generatedAt: '2024-01-02 11:30', generatedBy: 'Admin' },
  ]);

  // Calculate statistics from actual data
  const stats: ReportStats = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;

    const completedMaintenance = maintenance.filter((m) => m.status === 'completed').length;
    const inProgressMaintenance = maintenance.filter((m) => m.status === 'in_progress').length;
    const preventiveMaintenance = maintenance.filter((m) => m.type === 'preventive').length;
    const correctiveMaintenance = maintenance.filter((m) => m.type === 'corrective').length;

    const lowStockItems = inventory.filter(i => i.quantity <= i.minStock && i.quantity > 0).length;
    const outOfStockItems = inventory.filter(i => i.quantity === 0).length;
    const categories = new Set(inventory.map(i => i.category)).size;

    return {
      fleet: {
        totalVehicles: vehicles.length,
        available: activeVehicles,
        assigned: 0,
        inTransit: 0,
        underMaintenance: maintenanceVehicles,
        utilizationRate: vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0,
      },
      carRequests: {
        total: 24,
        pending: 3,
        approved: 18,
        rejected: 2,
        completed: 15,
        avgProcessingDays: 1.5,
      },
      maintenance: {
        total: maintenance.length,
        preventive: preventiveMaintenance,
        corrective: correctiveMaintenance,
        completed: completedMaintenance,
        inProgress: inProgressMaintenance,
        avgCompletionDays: 2.3,
      },
      inventory: {
        totalParts: inventory.reduce((sum, i) => sum + i.quantity, 0),
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        totalValue: 45000,
        categories: categories,
      },
    };
  }, [vehicles, maintenance, inventory]);

  const reportTypes = [
    {
      id: 'fleet' as ReportType,
      icon: Car,
      labelKey: 'pages.reports.fleetOverview',
      color: 'emerald'
    },
    {
      id: 'carRequests' as ReportType,
      icon: TrendingUp,
      labelKey: 'pages.reports.carRequestsSummary',
      color: 'blue'
    },
    {
      id: 'maintenance' as ReportType,
      icon: Wrench,
      labelKey: 'pages.reports.maintenanceSummary',
      color: 'amber'
    },
    {
      id: 'inventory' as ReportType,
      icon: Package,
      labelKey: 'pages.reports.partsInventory',
      color: 'purple'
    },
  ];

  // Reusable function to generate PDF for a specific report type and date range
  const generateReportPDF = async (
    reportType: ReportType,
    reportDateRange: { start: string; end: string },
    fileName: string
  ) => {
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { height } = page.getSize();

    let yPosition = height - 50;
    const leftMargin = 50;

    // Title
    const reportTitles: Record<ReportType, string> = {
      fleet: 'Fleet Overview Report',
      carRequests: 'Car Requests Summary Report',
      maintenance: 'Maintenance Summary Report',
      inventory: 'Parts Inventory Report',
    };

    page.drawText(reportTitles[reportType], {
      x: leftMargin,
      y: yPosition,
      size: 24,
      font: timesRomanBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPosition -= 30;

    // Date range
    page.drawText(`Report Period: ${reportDateRange.start} to ${reportDateRange.end}`, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: timesRoman,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 15;
    page.drawText(`Generated: ${new Date().toISOString().split('T')[0]}`, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: timesRoman,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 40;

    // Divider line
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: 545, y: yPosition },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yPosition -= 30;

    // Report content based on type
    const drawStat = (label: string, value: string | number, indent = 0) => {
      page.drawText(`${label}:`, {
        x: leftMargin + indent,
        y: yPosition,
        size: 12,
        font: timesRomanBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(String(value), {
        x: leftMargin + 200 + indent,
        y: yPosition,
        size: 12,
        font: timesRoman,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 25;
    };

    switch (reportType) {
      case 'fleet':
        page.drawText('Fleet Statistics', {
          x: leftMargin,
          y: yPosition,
          size: 16,
          font: timesRomanBold,
          color: rgb(0.1, 0.4, 0.3),
        });
        yPosition -= 30;
        drawStat('Total Vehicles', stats.fleet.totalVehicles);
        drawStat('Available', stats.fleet.available);
        drawStat('Assigned', stats.fleet.assigned);
        drawStat('In Transit', stats.fleet.inTransit);
        drawStat('Under Maintenance', stats.fleet.underMaintenance);
        drawStat('Utilization Rate', `${stats.fleet.utilizationRate}%`);
        break;

      case 'carRequests':
        page.drawText('Car Request Statistics', {
          x: leftMargin,
          y: yPosition,
          size: 16,
          font: timesRomanBold,
          color: rgb(0.1, 0.3, 0.5),
        });
        yPosition -= 30;
        drawStat('Total Requests', stats.carRequests.total);
        drawStat('Pending', stats.carRequests.pending);
        drawStat('Approved', stats.carRequests.approved);
        drawStat('Rejected', stats.carRequests.rejected);
        drawStat('Completed', stats.carRequests.completed);
        drawStat('Avg. Processing Time', `${stats.carRequests.avgProcessingDays} days`);
        break;

      case 'maintenance':
        page.drawText('Maintenance Statistics', {
          x: leftMargin,
          y: yPosition,
          size: 16,
          font: timesRomanBold,
          color: rgb(0.6, 0.4, 0.1),
        });
        yPosition -= 30;
        drawStat('Total Requests', stats.maintenance.total);
        drawStat('Preventive', stats.maintenance.preventive);
        drawStat('Corrective', stats.maintenance.corrective);
        drawStat('Completed', stats.maintenance.completed);
        drawStat('In Progress', stats.maintenance.inProgress);
        drawStat('Avg. Completion Time', `${stats.maintenance.avgCompletionDays} days`);
        break;

      case 'inventory':
        page.drawText('Parts Inventory Statistics', {
          x: leftMargin,
          y: yPosition,
          size: 16,
          font: timesRomanBold,
          color: rgb(0.4, 0.2, 0.5),
        });
        yPosition -= 30;
        drawStat('Total Parts Count', stats.inventory.totalParts);
        drawStat('Categories', stats.inventory.categories);
        drawStat('Low Stock Items', stats.inventory.lowStock);
        drawStat('Out of Stock Items', stats.inventory.outOfStock);
        drawStat('Estimated Value', `SAR ${stats.inventory.totalValue.toLocaleString()}`);
        break;
    }

    // Footer
    page.drawText('Fleet Management System - Confidential', {
      x: leftMargin,
      y: 30,
      size: 10,
      font: timesRoman,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  // Download selected historical reports
  const downloadSelectedReports = async () => {
    setIsGenerating(true);
    try {
      for (const id of selectedHistoryReports) {
        const report = reportHistory.find(r => r.id === id);
        if (report) {
          const fileName = `${report.id}-${report.type}-report-${report.dateRange.start}-to-${report.dateRange.end}.pdf`;
          await generateReportPDF(report.type, report.dateRange, fileName);
        }
      }
      showToast(t('pages.reports.reportsDownloaded', { count: selectedHistoryReports.length }), 'success');
      setSelectedHistoryReports([]);
    } catch (error) {
      console.error('Error downloading reports:', error);
      showToast(t('pages.reports.reportError'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const fileName = `${selectedReport}-report-${dateRange.start}-to-${dateRange.end}.pdf`;
      await generateReportPDF(selectedReport, dateRange, fileName);

      // Add to report history
      const newReport: ReportHistoryItem = {
        id: `RPT-${String(reportHistory.length + 1).padStart(3, '0')}`,
        type: selectedReport,
        dateRange: { start: dateRange.start, end: dateRange.end },
        generatedAt: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        generatedBy: 'Admin',
      };
      setReportHistory([newReport, ...reportHistory]);

      showToast(t('pages.reports.reportGenerated'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(t('pages.reports.reportError'), 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeLabel = (type: ReportType) => {
    const labels: Record<ReportType, string> = {
      fleet: t('pages.reports.fleetOverview'),
      carRequests: t('pages.reports.carRequestsSummary'),
      maintenance: t('pages.reports.maintenanceSummary'),
      inventory: t('pages.reports.partsInventory'),
    };
    return labels[type];
  };

  const getReportTypeIcon = (type: ReportType) => {
    const icons: Record<ReportType, typeof Car> = {
      fleet: Car,
      carRequests: TrendingUp,
      maintenance: Wrench,
      inventory: Package,
    };
    return icons[type];
  };

  const getReportTypeColor = (type: ReportType) => {
    const colors: Record<ReportType, string> = {
      fleet: 'emerald',
      carRequests: 'blue',
      maintenance: 'amber',
      inventory: 'purple',
    };
    return colors[type];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.reports.title')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">{t('pages.reports.description')}</p>
        </div>
      </header>

      {/* Date Range Selection */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-700">{t('pages.reports.dateRange')}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">{t('pages.reports.from')}</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">{t('pages.reports.to')}</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full sm:w-auto"
            >
              {reportTypes.map((report) => (
                <option key={report.id} value={report.id}>
                  {t(report.labelKey)}
                </option>
              ))}
            </select>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Download size={18} />
              {isGenerating ? t('pages.reports.generating') : t('pages.reports.generatePdfReport')}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Report History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            <h3 className="font-bold text-slate-800">{t('pages.reports.reportHistory')}</h3>
          </div>
          {selectedHistoryReports.length > 0 && (
            <button
              onClick={downloadSelectedReports}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              {isGenerating
                ? t('pages.reports.generating')
                : t('pages.reports.downloadSelected', { count: selectedHistoryReports.length })}
            </button>
          )}
        </div>

        <GlassCard className="p-4 sm:p-6">
          {reportHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 text-center font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedHistoryReports.length === reportHistory.length && reportHistory.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHistoryReports(reportHistory.map(r => r.id));
                        } else {
                          setSelectedHistoryReports([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3 px-4 text-start font-semibold">{t('pages.reports.reportId')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('pages.reports.reportType')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('pages.reports.dateRange')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('pages.reports.generatedAt')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {reportHistory.map((report) => {
                  const Icon = getReportTypeIcon(report.type);
                  const color = getReportTypeColor(report.type);
                  const colorClasses: Record<string, string> = {
                    emerald: 'bg-emerald-100 text-emerald-700',
                    blue: 'bg-blue-100 text-blue-700',
                    amber: 'bg-amber-100 text-amber-700',
                    purple: 'bg-purple-100 text-purple-700',
                  };

                  return (
                    <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedHistoryReports.includes(report.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedHistoryReports([...selectedHistoryReports, report.id]);
                            } else {
                              setSelectedHistoryReports(selectedHistoryReports.filter(id => id !== report.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{report.id}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
                          <Icon size={14} />
                          {getReportTypeLabel(report.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{report.dateRange.start} - {report.dateRange.end}</td>
                      <td className="py-3 px-4 text-slate-600">{report.generatedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            {t('pages.reports.noReportHistory')}
          </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
