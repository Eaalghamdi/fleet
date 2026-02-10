import { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  Car,
  Wrench,
  Package,
  TrendingUp,
  History,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { GlassCard } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { carRequests as carRequestsData } from '../data';

// Report history item
interface ReportHistoryItem {
  id: string;
  type: ReportType;
  dateRange: { start: string; end: string };
  generatedAt: string;
  generatedBy: string;
}

type ReportType = 'fleet' | 'carRequests' | 'maintenance' | 'inventory' | 'drivers';

export function Reports() {
  const { t } = useTranslation();
  const { vehicles, maintenance, inventory, drivers, showToast } = useApp();

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedReport, setSelectedReport] = useState<ReportType>('fleet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedHistoryReports, setSelectedHistoryReports] = useState<string[]>([]);

  const carRequests = carRequestsData;

  // Mock report history
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([
    { id: 'RPT-001', type: 'fleet', dateRange: { start: '2024-01-01', end: '2024-01-31' }, generatedAt: '2024-01-31 14:30', generatedBy: 'Admin' },
    { id: 'RPT-002', type: 'maintenance', dateRange: { start: '2024-01-01', end: '2024-01-31' }, generatedAt: '2024-01-30 10:15', generatedBy: 'Admin' },
    { id: 'RPT-003', type: 'carRequests', dateRange: { start: '2024-01-15', end: '2024-01-31' }, generatedAt: '2024-01-28 16:45', generatedBy: 'Operations' },
    { id: 'RPT-004', type: 'inventory', dateRange: { start: '2024-01-01', end: '2024-01-31' }, generatedAt: '2024-01-25 09:00', generatedBy: 'Garage' },
    { id: 'RPT-005', type: 'fleet', dateRange: { start: '2023-12-01', end: '2023-12-31' }, generatedAt: '2024-01-02 11:30', generatedBy: 'Admin' },
  ]);

  // ─── Computed Statistics (for PDF content) ────────────────────────────

  const stats = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;
    const assignedVehicles = vehicles.filter(v => v.driver && v.driver.trim() !== '' && v.driver !== 'Unassigned').length;
    const totalMileage = vehicles.reduce((acc, v) => acc + v.mileage, 0);
    const avgMileage = vehicles.length > 0 ? Math.round(totalMileage / vehicles.length) : 0;
    const avgFuel = vehicles.length > 0 ? Math.round(vehicles.reduce((a, v) => a + v.fuel, 0) / vehicles.length) : 0;
    const lowFuelCount = vehicles.filter(v => v.fuel < 20 && v.fuel > 0).length;

    const completedMaintenance = maintenance.filter(m => m.status === 'completed').length;
    const inProgressMaintenance = maintenance.filter(m => m.status === 'in_progress').length;
    const pendingApproval = maintenance.filter(m => m.status === 'pending_approval').length;
    const scheduledMaintenance = maintenance.filter(m => m.status === 'scheduled').length;
    const preventiveMaintenance = maintenance.filter(m => m.type === 'preventive').length;
    const correctiveMaintenance = maintenance.filter(m => m.type === 'corrective').length;
    const highPriority = maintenance.filter(m => m.priority === 'high').length;

    const lowStockItems = inventory.filter(i => i.quantity <= i.minStock && i.quantity > 0).length;
    const outOfStockItems = inventory.filter(i => i.quantity === 0).length;
    const totalParts = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const categories = new Set(inventory.map(i => i.category)).size;
    const criticalItems = inventory.filter(i => i.quantity < i.minStock).length;

    const pendingRequests = carRequests.filter(r => r.status === 'pending').length;
    const completedRequests = carRequests.filter(r => r.status === 'returned').length;
    const rentalRequests = carRequests.filter(r => r.isRental).length;

    const activeDrivers = drivers.filter(d => d.status === 'active').length;
    const assignedDrivers = drivers.filter(d => d.assignedCarId !== null).length;
    const expiredPermits = drivers.reduce((acc, d) => acc + d.permits.filter(p => p.status === 'expired').length, 0);

    return {
      fleet: {
        totalVehicles: vehicles.length,
        active: activeVehicles,
        maintenance: maintenanceVehicles,
        inactive: inactiveVehicles,
        assigned: assignedVehicles,
        unassigned: vehicles.length - assignedVehicles,
        utilizationRate: vehicles.length > 0 ? Math.round((assignedVehicles / vehicles.length) * 100) : 0,
        readinessRate: vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0,
        totalMileage,
        avgMileage,
        avgFuel,
        lowFuelCount,
      },
      maintenance: {
        total: maintenance.length,
        completed: completedMaintenance,
        inProgress: inProgressMaintenance,
        pendingApproval,
        scheduled: scheduledMaintenance,
        preventive: preventiveMaintenance,
        corrective: correctiveMaintenance,
        highPriority,
        completionRate: maintenance.length > 0 ? Math.round((completedMaintenance / maintenance.length) * 100) : 0,
      },
      inventory: {
        totalParts,
        totalItems: inventory.length,
        lowStock: lowStockItems,
        outOfStock: outOfStockItems,
        critical: criticalItems,
        categories,
        healthyItems: inventory.length - criticalItems,
      },
      requests: {
        total: carRequests.length,
        pending: pendingRequests,
        completed: completedRequests,
        rental: rentalRequests,
        fleet: carRequests.length - rentalRequests,
      },
      drivers: {
        total: drivers.length,
        active: activeDrivers,
        inactive: drivers.length - activeDrivers,
        assigned: assignedDrivers,
        unassigned: drivers.length - assignedDrivers,
        expiredPermits,
      },
    };
  }, [vehicles, maintenance, inventory, carRequests, drivers]);

  // ─── Report type config ───────────────────────────────────────────────

  const reportTypes = [
    { id: 'fleet' as ReportType, icon: Car, labelKey: 'pages.reports.fleetOverview', color: 'emerald' },
    { id: 'carRequests' as ReportType, icon: TrendingUp, labelKey: 'pages.reports.carRequestsSummary', color: 'blue' },
    { id: 'maintenance' as ReportType, icon: Wrench, labelKey: 'pages.reports.maintenanceSummary', color: 'amber' },
    { id: 'inventory' as ReportType, icon: Package, labelKey: 'pages.reports.partsInventory', color: 'purple' },
    { id: 'drivers' as ReportType, icon: Users, labelKey: 'pages.reports.tabs.drivers', color: 'indigo' },
  ];

  // ─── PDF Generation ────────────────────────────────────────────────────

  const generateReportPDF = async (
    reportType: ReportType,
    reportDateRange: { start: string; end: string },
    fileName: string
  ) => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const M_LEFT = 45;
    const M_RIGHT = 45;
    const M_TOP = 55;
    const M_BOTTOM = 55;
    const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;

    const reportTitles: Record<ReportType, string> = {
      fleet: 'Fleet Overview Report',
      carRequests: 'Car Requests Summary Report',
      maintenance: 'Maintenance Summary Report',
      inventory: 'Parts Inventory Report',
      drivers: 'Driver Management Report',
    };

    const reportSubtitles: Record<ReportType, string> = {
      fleet: 'Complete fleet status, utilization, and vehicle details',
      carRequests: 'Request tracking, status analysis, and trip details',
      maintenance: 'Work orders, priority analysis, and completion metrics',
      inventory: 'Stock levels, category breakdown, and reorder alerts',
      drivers: 'Driver profiles, license tracking, and permit status',
    };

    // Colors
    const C_PRIMARY = rgb(0.06, 0.09, 0.16);
    const C_SECONDARY = rgb(0.4, 0.45, 0.53);
    const C_MUTED = rgb(0.58, 0.63, 0.7);
    const C_ACCENT = rgb(0.08, 0.52, 0.36);
    const C_WHITE = rgb(1, 1, 1);
    const C_HEADER_BG = rgb(0.06, 0.09, 0.16);
    const C_ROW_ALT = rgb(0.97, 0.98, 0.99);
    const C_BORDER = rgb(0.88, 0.9, 0.92);
    const C_GREEN = rgb(0.13, 0.77, 0.37);
    const C_AMBER = rgb(0.96, 0.62, 0.04);
    const C_RED = rgb(0.94, 0.27, 0.27);
    const C_BLUE = rgb(0.23, 0.51, 0.96);
    const C_PURPLE = rgb(0.54, 0.36, 0.96);

    let pageCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentPage: any = null;
    let y = 0;

    const addPage = () => {
      currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
      pageCount++;
      y = PAGE_H - M_TOP;
      currentPage.drawLine({
        start: { x: M_LEFT, y: PAGE_H - 38 },
        end: { x: PAGE_W - M_RIGHT, y: PAGE_H - 38 },
        thickness: 0.5,
        color: C_BORDER,
      });
      currentPage.drawText('IVMS Fleet Management', {
        x: M_LEFT, y: PAGE_H - 32, size: 7, font, color: C_MUTED,
      });
      currentPage.drawText(reportTitles[reportType], {
        x: PAGE_W - M_RIGHT - fontBold.widthOfTextAtSize(reportTitles[reportType], 7),
        y: PAGE_H - 32, size: 7, font: fontBold, color: C_MUTED,
      });
    };

    const drawFooters = () => {
      const pages = pdfDoc.getPages();
      pages.forEach((pg, i) => {
        pg.drawLine({
          start: { x: M_LEFT, y: M_BOTTOM - 5 },
          end: { x: PAGE_W - M_RIGHT, y: M_BOTTOM - 5 },
          thickness: 0.5,
          color: C_BORDER,
        });
        const footerLeft = 'Fleet Management System — Confidential';
        pg.drawText(footerLeft, { x: M_LEFT, y: M_BOTTOM - 20, size: 7, font, color: C_MUTED });
        const footerRight = `Page ${i + 1} of ${pages.length}`;
        pg.drawText(footerRight, {
          x: PAGE_W - M_RIGHT - font.widthOfTextAtSize(footerRight, 7),
          y: M_BOTTOM - 20, size: 7, font, color: C_MUTED,
        });
      });
    };

    const ensureSpace = (needed: number) => {
      if (y - needed < M_BOTTOM) {
        addPage();
      }
    };

    const truncate = (text: string, maxWidth: number, sz: number, f = font) => {
      if (f.widthOfTextAtSize(text, sz) <= maxWidth) return text;
      while (text.length > 0 && f.widthOfTextAtSize(text + '...', sz) > maxWidth) {
        text = text.slice(0, -1);
      }
      return text + '...';
    };

    // ── Cover Page ────────────────────────────────────────────────────
    const drawCoverPage = () => {
      currentPage = pdfDoc.addPage([PAGE_W, PAGE_H]);
      pageCount++;

      currentPage.drawRectangle({
        x: 0, y: PAGE_H - 220, width: PAGE_W, height: 220,
        color: C_HEADER_BG,
      });

      currentPage.drawText(reportTitles[reportType].toUpperCase(), {
        x: M_LEFT + 10, y: PAGE_H - 100, size: 26, font: fontBold, color: C_WHITE,
      });

      currentPage.drawText(reportSubtitles[reportType], {
        x: M_LEFT + 10, y: PAGE_H - 130, size: 11, font, color: rgb(0.7, 0.73, 0.78),
      });

      currentPage.drawRectangle({
        x: M_LEFT + 10, y: PAGE_H - 150, width: 60, height: 3,
        color: C_GREEN,
      });

      const metaY = PAGE_H - 180;
      currentPage.drawText('Report Period:', { x: M_LEFT + 10, y: metaY, size: 9, font: fontBold, color: rgb(0.7, 0.73, 0.78) });
      currentPage.drawText(`${reportDateRange.start}  to  ${reportDateRange.end}`, { x: M_LEFT + 100, y: metaY, size: 9, font, color: C_WHITE });
      currentPage.drawText('Generated:', { x: M_LEFT + 310, y: metaY, size: 9, font: fontBold, color: rgb(0.7, 0.73, 0.78) });
      currentPage.drawText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), {
        x: M_LEFT + 385, y: metaY, size: 9, font, color: C_WHITE,
      });

      const prepY = PAGE_H - 200;
      currentPage.drawText('Prepared by:', { x: M_LEFT + 10, y: prepY, size: 9, font: fontBold, color: rgb(0.7, 0.73, 0.78) });
      currentPage.drawText('IVMS Fleet Management System', { x: M_LEFT + 100, y: prepY, size: 9, font, color: C_WHITE });

      let tocY = PAGE_H - 290;
      currentPage.drawText('TABLE OF CONTENTS', { x: M_LEFT, y: tocY, size: 12, font: fontBold, color: C_PRIMARY });
      tocY -= 8;
      currentPage.drawRectangle({ x: M_LEFT, y: tocY, width: 40, height: 2, color: C_ACCENT });
      tocY -= 25;

      const tocItems = getTocItems(reportType);
      tocItems.forEach((item, i) => {
        currentPage.drawText(`${i + 1}.`, { x: M_LEFT + 5, y: tocY, size: 10, font: fontBold, color: C_ACCENT });
        currentPage.drawText(item, { x: M_LEFT + 25, y: tocY, size: 10, font, color: C_PRIMARY });
        tocY -= 22;
      });

      currentPage.drawLine({
        start: { x: M_LEFT, y: 60 },
        end: { x: PAGE_W - M_RIGHT, y: 60 },
        thickness: 0.5,
        color: C_BORDER,
      });
      currentPage.drawText('This report contains confidential fleet management data. Distribution is restricted to authorized personnel only.', {
        x: M_LEFT, y: 42, size: 7, font, color: C_MUTED,
      });
    };

    const getTocItems = (type: ReportType): string[] => {
      switch (type) {
        case 'fleet': return ['Executive Summary', 'Fleet Status Breakdown', 'Fleet by Brand', 'Mileage & Fuel Analysis', 'Vehicle Details'];
        case 'maintenance': return ['Executive Summary', 'Status & Priority Breakdown', 'Type Analysis', 'Maintenance Log'];
        case 'inventory': return ['Executive Summary', 'Stock Level Analysis', 'Category Breakdown', 'Inventory Details'];
        case 'carRequests': return ['Executive Summary', 'Status Breakdown', 'Vehicle Type Analysis', 'Request Log'];
        case 'drivers': return ['Executive Summary', 'License & Permit Analysis', 'Driver Details'];
      }
    };

    // ── Section heading ───────────────────────────────────────────────
    const drawSection = (title: string, sectionNum: number) => {
      ensureSpace(50);
      y -= 15;
      currentPage.drawRectangle({ x: M_LEFT, y: y - 2, width: 4, height: 18, color: C_ACCENT });
      currentPage.drawText(`${sectionNum}. ${title}`, {
        x: M_LEFT + 12, y, size: 14, font: fontBold, color: C_PRIMARY,
      });
      y -= 8;
      currentPage.drawLine({ start: { x: M_LEFT, y }, end: { x: PAGE_W - M_RIGHT, y }, thickness: 0.5, color: C_BORDER });
      y -= 20;
    };

    const drawSubSection = (title: string) => {
      ensureSpace(35);
      y -= 8;
      currentPage.drawText(title, { x: M_LEFT, y, size: 11, font: fontBold, color: C_SECONDARY });
      y -= 5;
      currentPage.drawLine({ start: { x: M_LEFT, y }, end: { x: M_LEFT + 200, y }, thickness: 0.5, color: C_BORDER });
      y -= 15;
    };

    // ── KPI boxes ─────────────────────────────────────────────────────
    const drawKpiRow = (kpis: { label: string; value: string; color?: typeof C_GREEN }[]) => {
      ensureSpace(55);
      const boxW = (CONTENT_W - 18) / kpis.length;
      kpis.forEach((kpi, i) => {
        const bx = M_LEFT + i * (boxW + 6);
        currentPage.drawRectangle({ x: bx, y: y - 38, width: boxW, height: 42, color: rgb(0.96, 0.97, 0.99), borderColor: C_BORDER, borderWidth: 0.5 });
        currentPage.drawRectangle({ x: bx, y: y + 3, width: boxW, height: 3, color: kpi.color || C_ACCENT });
        currentPage.drawText(kpi.value, { x: bx + 10, y: y - 16, size: 16, font: fontBold, color: C_PRIMARY });
        currentPage.drawText(kpi.label.toUpperCase(), { x: bx + 10, y: y - 30, size: 6.5, font: fontBold, color: C_MUTED });
      });
      y -= 55;
    };

    const drawStat = (label: string, value: string | number, color?: typeof C_GREEN) => {
      ensureSpace(18);
      currentPage.drawText(label, { x: M_LEFT + 10, y, size: 9, font, color: C_SECONDARY });
      currentPage.drawText(String(value), {
        x: M_LEFT + 230, y, size: 9, font: fontBold, color: color || C_PRIMARY,
      });
      y -= 18;
    };

    const drawStatWithBar = (label: string, value: number, total: number, barColor: typeof C_GREEN) => {
      ensureSpace(20);
      const pct = total > 0 ? (value / total) * 100 : 0;
      currentPage.drawText(label, { x: M_LEFT + 10, y, size: 9, font, color: C_SECONDARY });
      currentPage.drawText(`${value} (${pct.toFixed(0)}%)`, { x: M_LEFT + 180, y, size: 9, font: fontBold, color: C_PRIMARY });
      const barX = M_LEFT + 270;
      const barW = 180;
      currentPage.drawRectangle({ x: barX, y: y - 2, width: barW, height: 8, color: rgb(0.93, 0.94, 0.96) });
      if (pct > 0) {
        currentPage.drawRectangle({ x: barX, y: y - 2, width: Math.max(2, barW * (pct / 100)), height: 8, color: barColor });
      }
      y -= 20;
    };

    // ── Data table ────────────────────────────────────────────────────
    const drawTable = (
      headers: string[],
      rows: (string | { text: string; color?: typeof C_GREEN })[][],
      colWidths: number[]
    ) => {
      const ROW_H = 18;
      const HEADER_H = 22;

      ensureSpace(HEADER_H + ROW_H);
      let hx = M_LEFT;
      currentPage.drawRectangle({ x: M_LEFT, y: y - HEADER_H + 5, width: CONTENT_W, height: HEADER_H, color: C_HEADER_BG });
      headers.forEach((h, i) => {
        const txt = truncate(h.toUpperCase(), colWidths[i] - 8, 6.5, fontBold);
        currentPage.drawText(txt, { x: hx + 6, y: y - HEADER_H + 12, size: 6.5, font: fontBold, color: C_WHITE });
        hx += colWidths[i];
      });
      y -= HEADER_H;

      rows.forEach((row, rowIdx) => {
        ensureSpace(ROW_H + 5);
        if (y > PAGE_H - M_TOP - 10) {
          let rhx = M_LEFT;
          currentPage.drawRectangle({ x: M_LEFT, y: y - HEADER_H + 5, width: CONTENT_W, height: HEADER_H, color: C_HEADER_BG });
          headers.forEach((h, i) => {
            const txt = truncate(h.toUpperCase(), colWidths[i] - 8, 6.5, fontBold);
            currentPage.drawText(txt, { x: rhx + 6, y: y - HEADER_H + 12, size: 6.5, font: fontBold, color: C_WHITE });
            rhx += colWidths[i];
          });
          y -= HEADER_H;
        }

        if (rowIdx % 2 === 0) {
          currentPage.drawRectangle({ x: M_LEFT, y: y - ROW_H + 5, width: CONTENT_W, height: ROW_H, color: C_ROW_ALT });
        }
        currentPage.drawLine({
          start: { x: M_LEFT, y: y - ROW_H + 5 },
          end: { x: PAGE_W - M_RIGHT, y: y - ROW_H + 5 },
          thickness: 0.3, color: C_BORDER,
        });

        let rx = M_LEFT;
        row.forEach((cell, colIdx) => {
          const cellObj = typeof cell === 'string' ? { text: cell } : cell;
          const txt = truncate(cellObj.text, colWidths[colIdx] - 10, 8, font);
          currentPage.drawText(txt, {
            x: rx + 6, y: y - ROW_H + 11, size: 8, font, color: cellObj.color || C_PRIMARY,
          });
          rx += colWidths[colIdx];
        });
        y -= ROW_H;
      });
      y -= 10;
    };

    const statusColor = (status: string) => {
      const s = status.toLowerCase();
      if (['active', 'completed', 'returned', 'in_stock', 'approved'].includes(s)) return C_GREEN;
      if (['maintenance', 'in_progress', 'in_transit', 'assigned', 'low_stock', 'scheduled'].includes(s)) return C_AMBER;
      if (['inactive', 'pending', 'pending_approval', 'out_of_stock', 'high'].includes(s)) return C_RED;
      if (['rejected', 'cancelled', 'expired'].includes(s)) return C_RED;
      return C_SECONDARY;
    };

    const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // ═══════════════════════════════════════════════════════════════════
    // Generate report content
    // ═══════════════════════════════════════════════════════════════════

    drawCoverPage();

    switch (reportType) {
      case 'fleet': {
        addPage();
        drawSection('Executive Summary', 1);

        drawKpiRow([
          { label: 'Total Vehicles', value: String(stats.fleet.totalVehicles) },
          { label: 'Active', value: String(stats.fleet.active), color: C_GREEN },
          { label: 'In Maintenance', value: String(stats.fleet.maintenance), color: C_AMBER },
          { label: 'Inactive', value: String(stats.fleet.inactive), color: C_RED },
        ]);

        drawKpiRow([
          { label: 'Utilization Rate', value: `${stats.fleet.utilizationRate}%`, color: C_BLUE },
          { label: 'Readiness Rate', value: `${stats.fleet.readinessRate}%`, color: C_GREEN },
          { label: 'Average Fuel', value: `${stats.fleet.avgFuel}%`, color: stats.fleet.avgFuel >= 50 ? C_GREEN : C_AMBER },
          { label: 'Low Fuel Alert', value: String(stats.fleet.lowFuelCount), color: stats.fleet.lowFuelCount > 0 ? C_RED : C_GREEN },
        ]);

        drawStat('Total Fleet Mileage', `${stats.fleet.totalMileage.toLocaleString()} km`);
        drawStat('Average Mileage per Vehicle', `${stats.fleet.avgMileage.toLocaleString()} km`);
        drawStat('Assigned Vehicles', `${stats.fleet.assigned} of ${stats.fleet.totalVehicles}`);
        drawStat('Unassigned Vehicles', stats.fleet.unassigned);

        drawSection('Fleet Status Breakdown', 2);
        drawStatWithBar('Active', stats.fleet.active, stats.fleet.totalVehicles, C_GREEN);
        drawStatWithBar('In Maintenance', stats.fleet.maintenance, stats.fleet.totalVehicles, C_AMBER);
        drawStatWithBar('Inactive', stats.fleet.inactive, stats.fleet.totalVehicles, C_RED);
        drawStatWithBar('Assigned', stats.fleet.assigned, stats.fleet.totalVehicles, C_BLUE);
        drawStatWithBar('Unassigned', stats.fleet.unassigned, stats.fleet.totalVehicles, C_MUTED);

        drawSection('Fleet by Brand', 3);
        const brands: Record<string, number> = {};
        vehicles.forEach(v => { brands[v.brand] = (brands[v.brand] || 0) + 1; });
        Object.entries(brands).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
          drawStatWithBar(brand, count, vehicles.length, C_ACCENT);
        });

        drawSection('Mileage & Fuel Analysis', 4);
        drawSubSection('Mileage Distribution');
        const mileageRanges = [
          { label: '0 - 20,000 km', count: vehicles.filter(v => v.mileage < 20000).length },
          { label: '20,000 - 50,000 km', count: vehicles.filter(v => v.mileage >= 20000 && v.mileage < 50000).length },
          { label: '50,000 - 100,000 km', count: vehicles.filter(v => v.mileage >= 50000 && v.mileage < 100000).length },
          { label: '100,000+ km', count: vehicles.filter(v => v.mileage >= 100000).length },
        ];
        mileageRanges.forEach(r => drawStatWithBar(r.label, r.count, vehicles.length, C_PURPLE));

        drawSubSection('Fuel Level Distribution');
        const fuelRanges = [
          { label: 'Critical (0%)', count: vehicles.filter(v => v.fuel === 0).length, color: C_RED },
          { label: 'Low (1-20%)', count: vehicles.filter(v => v.fuel > 0 && v.fuel <= 20).length, color: C_RED },
          { label: 'Medium (21-50%)', count: vehicles.filter(v => v.fuel > 20 && v.fuel <= 50).length, color: C_AMBER },
          { label: 'Good (51-80%)', count: vehicles.filter(v => v.fuel > 50 && v.fuel <= 80).length, color: C_GREEN },
          { label: 'Full (81-100%)', count: vehicles.filter(v => v.fuel > 80).length, color: C_GREEN },
        ];
        fuelRanges.forEach(r => drawStatWithBar(r.label, r.count, vehicles.length, r.color));

        drawSubSection('Top 5 Highest Mileage Vehicles');
        const topMileage = [...vehicles].sort((a, b) => b.mileage - a.mileage).slice(0, 5);
        topMileage.forEach((v, i) => {
          drawStat(`${i + 1}. ${v.brand} ${v.model} (${v.plate})`, `${v.mileage.toLocaleString()} km`);
        });

        drawSection('Vehicle Details', 5);
        const fleetHeaders = ['Vehicle', 'Plate', 'Year', 'Driver', 'Mileage', 'Fuel', 'Status', 'Location'];
        const fleetColW = [90, 60, 35, 80, 60, 40, 55, CONTENT_W - 420];
        const fleetRows = vehicles.map(v => [
          `${v.brand} ${v.model}`,
          v.plate,
          String(v.year),
          v.driver === 'Unassigned' ? { text: 'Unassigned', color: C_MUTED } : v.driver,
          `${v.mileage.toLocaleString()} km`,
          `${v.fuel}%`,
          { text: formatStatus(v.status), color: statusColor(v.status) },
          v.location,
        ]);
        drawTable(fleetHeaders, fleetRows, fleetColW);

        drawSubSection('Insurance & Registration Dates');
        const dateHeaders = ['Vehicle', 'Plate', 'Insurance Expiry', 'Warranty Expiry', 'Registration Expiry', 'Next Maintenance'];
        const dateColW = [100, 65, 85, 85, 85, CONTENT_W - 420];
        const dateRows = vehicles.map(v => [
          `${v.brand} ${v.model}`,
          v.plate,
          v.insuranceExpiryDate,
          v.warrantyExpiryDate,
          v.registrationExpiryDate || '-',
          v.nextMaintenanceDate || '-',
        ]);
        drawTable(dateHeaders, dateRows, dateColW);
        break;
      }

      case 'maintenance': {
        addPage();
        drawSection('Executive Summary', 1);

        drawKpiRow([
          { label: 'Total Requests', value: String(stats.maintenance.total) },
          { label: 'Completion Rate', value: `${stats.maintenance.completionRate}%`, color: C_GREEN },
          { label: 'High Priority', value: String(stats.maintenance.highPriority), color: C_RED },
          { label: 'In Progress', value: String(stats.maintenance.inProgress), color: C_BLUE },
        ]);

        drawStat('Completed', stats.maintenance.completed, C_GREEN);
        drawStat('In Progress', stats.maintenance.inProgress, C_BLUE);
        drawStat('Pending Approval', stats.maintenance.pendingApproval, C_AMBER);
        drawStat('Scheduled', stats.maintenance.scheduled, C_PURPLE);
        drawStat('Preventive Maintenance', stats.maintenance.preventive);
        drawStat('Corrective Maintenance', stats.maintenance.corrective);

        drawSection('Status & Priority Breakdown', 2);
        drawSubSection('By Status');
        drawStatWithBar('Completed', stats.maintenance.completed, stats.maintenance.total, C_GREEN);
        drawStatWithBar('In Progress', stats.maintenance.inProgress, stats.maintenance.total, C_BLUE);
        drawStatWithBar('Pending Approval', stats.maintenance.pendingApproval, stats.maintenance.total, C_AMBER);
        drawStatWithBar('Scheduled', stats.maintenance.scheduled, stats.maintenance.total, C_PURPLE);

        drawSubSection('By Priority');
        const highP = maintenance.filter(m => m.priority === 'high').length;
        const medP = maintenance.filter(m => m.priority === 'medium').length;
        const lowP = maintenance.filter(m => m.priority === 'low').length;
        drawStatWithBar('High Priority', highP, maintenance.length, C_RED);
        drawStatWithBar('Medium Priority', medP, maintenance.length, C_AMBER);
        drawStatWithBar('Low Priority', lowP, maintenance.length, C_GREEN);

        drawSection('Type Analysis', 3);
        drawStatWithBar('Corrective', stats.maintenance.corrective, stats.maintenance.total, rgb(0.98, 0.45, 0.09));
        drawStatWithBar('Preventive', stats.maintenance.preventive, stats.maintenance.total, rgb(0.02, 0.71, 0.83));

        drawSubSection('Priority by Type');
        const crossHeaders = ['Priority', 'Corrective', 'Preventive', 'Total'];
        const crossColW = [120, 120, 120, 120];
        const priorities = ['high', 'medium', 'low'] as const;
        const crossRows = priorities.map(p => {
          const corr = maintenance.filter(m => m.priority === p && m.type === 'corrective').length;
          const prev = maintenance.filter(m => m.priority === p && m.type === 'preventive').length;
          return [
            { text: formatStatus(p), color: statusColor(p) },
            String(corr),
            String(prev),
            { text: String(corr + prev), color: C_PRIMARY },
          ];
        });
        drawTable(crossHeaders, crossRows, crossColW);

        drawSection('Maintenance Log', 4);
        const maintHeaders = ['ID', 'Vehicle', 'Description', 'Type', 'Priority', 'Status', 'Date'];
        const maintColW = [50, 50, 140, 65, 55, 75, CONTENT_W - 435];
        const maintRows = maintenance.map(m => [
          m.id,
          m.vehicle,
          m.description,
          { text: formatStatus(m.type), color: m.type === 'corrective' ? rgb(0.98, 0.45, 0.09) : rgb(0.02, 0.71, 0.83) },
          { text: formatStatus(m.priority), color: statusColor(m.priority) },
          { text: formatStatus(m.status), color: statusColor(m.status) },
          m.createdAt,
        ]);
        drawTable(maintHeaders, maintRows, maintColW);
        break;
      }

      case 'inventory': {
        addPage();
        drawSection('Executive Summary', 1);

        drawKpiRow([
          { label: 'Total Items', value: String(stats.inventory.totalItems) },
          { label: 'Total Units', value: String(stats.inventory.totalParts), color: C_BLUE },
          { label: 'Low Stock', value: String(stats.inventory.lowStock), color: C_AMBER },
          { label: 'Out of Stock', value: String(stats.inventory.outOfStock), color: C_RED },
        ]);

        drawStat('Categories', stats.inventory.categories);
        drawStat('Critical Items (below min)', stats.inventory.critical, stats.inventory.critical > 0 ? C_RED : C_GREEN);
        drawStat('Healthy Items', stats.inventory.healthyItems, C_GREEN);

        drawSection('Stock Level Analysis', 2);
        const inStock = inventory.filter(i => i.quantity > i.minStock).length;
        const lowStk = inventory.filter(i => i.quantity <= i.minStock && i.quantity > 0).length;
        const outStk = inventory.filter(i => i.quantity === 0).length;
        drawStatWithBar('In Stock', inStock, inventory.length, C_GREEN);
        drawStatWithBar('Low Stock', lowStk, inventory.length, C_AMBER);
        drawStatWithBar('Out of Stock', outStk, inventory.length, C_RED);

        const criticalItems = inventory.filter(i => i.quantity < i.minStock);
        if (criticalItems.length > 0) {
          drawSubSection('Critical Items — Reorder Required');
          criticalItems.forEach(item => {
            drawStat(`${item.name}`, `${item.quantity} / ${item.minStock} min`, C_RED);
          });
        }

        drawSection('Category Breakdown', 3);
        const cats: Record<string, { count: number; qty: number }> = {};
        inventory.forEach(i => {
          if (!cats[i.category]) cats[i.category] = { count: 0, qty: 0 };
          cats[i.category].count++;
          cats[i.category].qty += i.quantity;
        });
        const catHeaders = ['Category', 'Items', 'Total Units', '% of Stock'];
        const catColW = [150, 80, 100, 150];
        const catRows = Object.entries(cats)
          .sort((a, b) => b[1].qty - a[1].qty)
          .map(([cat, data]) => [
            cat,
            String(data.count),
            String(data.qty),
            `${(data.qty / stats.inventory.totalParts * 100).toFixed(1)}%`,
          ]);
        drawTable(catHeaders, catRows, catColW);

        drawSection('Inventory Details', 4);
        const invHeaders = ['Item Name', 'Category', 'Quantity', 'Min Stock', 'Status', 'Deficit'];
        const invColW = [130, 80, 60, 60, 80, CONTENT_W - 410];
        const invRows = [...inventory]
          .sort((a, b) => (a.quantity - a.minStock) - (b.quantity - b.minStock))
          .map(item => {
            const isOut = item.quantity === 0;
            const isLow = item.quantity <= item.minStock && item.quantity > 0;
            const status = isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock';
            const deficit = item.quantity < item.minStock ? item.minStock - item.quantity : 0;
            return [
              item.name,
              item.category,
              String(item.quantity),
              String(item.minStock),
              { text: status, color: isOut ? C_RED : isLow ? C_AMBER : C_GREEN },
              deficit > 0 ? { text: `-${deficit}`, color: C_RED } : { text: '-', color: C_MUTED },
            ];
          });
        drawTable(invHeaders, invRows, invColW);
        break;
      }

      case 'carRequests': {
        addPage();
        drawSection('Executive Summary', 1);

        drawKpiRow([
          { label: 'Total Requests', value: String(stats.requests.total) },
          { label: 'Pending', value: String(stats.requests.pending), color: C_AMBER },
          { label: 'Completed', value: String(stats.requests.completed), color: C_GREEN },
          { label: 'Rental', value: String(stats.requests.rental), color: C_PURPLE },
        ]);

        drawStat('Fleet Vehicle Requests', stats.requests.fleet);
        drawStat('Rental Vehicle Requests', stats.requests.rental);

        drawSection('Status Breakdown', 2);
        const rStatuses: Record<string, number> = {};
        carRequests.forEach(r => { rStatuses[r.status] = (rStatuses[r.status] || 0) + 1; });
        Object.entries(rStatuses).sort((a, b) => b[1] - a[1]).forEach(([st, cnt]) => {
          drawStatWithBar(formatStatus(st), cnt, carRequests.length, statusColor(st));
        });

        drawSection('Vehicle Type Analysis', 3);
        const carTypes: Record<string, number> = {};
        carRequests.forEach(r => { carTypes[r.requestedCarType] = (carTypes[r.requestedCarType] || 0) + 1; });
        Object.entries(carTypes).sort((a, b) => b[1] - a[1]).forEach(([type, cnt]) => {
          drawStatWithBar(formatStatus(type), cnt, carRequests.length, C_BLUE);
        });

        drawSubSection('Rental vs Fleet');
        drawStatWithBar('Fleet', stats.requests.fleet, carRequests.length, C_BLUE);
        drawStatWithBar('Rental', stats.requests.rental, carRequests.length, C_PURPLE);

        drawSection('Request Log', 4);
        const reqHeaders = ['ID', 'Type', 'From', 'To', 'Departure', 'Return', 'Status', 'Rental'];
        const reqColW = [45, 40, 75, 75, 65, 65, 65, CONTENT_W - 430];
        const reqRows = carRequests.map(r => [
          r.id,
          formatStatus(r.requestedCarType),
          r.departureLocation,
          r.destination,
          r.departureDatetime.split('T')[0],
          r.returnDatetime.split('T')[0],
          { text: formatStatus(r.status), color: statusColor(r.status) },
          r.isRental ? { text: 'Yes', color: C_PURPLE } : { text: 'No', color: C_MUTED },
        ]);
        drawTable(reqHeaders, reqRows, reqColW);

        drawSubSection('Request Details');
        carRequests.forEach(r => {
          ensureSpace(80);
          currentPage.drawRectangle({ x: M_LEFT, y: y - 58, width: CONTENT_W, height: 62, color: rgb(0.97, 0.98, 0.99), borderColor: C_BORDER, borderWidth: 0.5 });
          currentPage.drawText(`${r.id} — ${formatStatus(r.requestedCarType)} ${r.isRental ? '(Rental)' : '(Fleet)'}`, {
            x: M_LEFT + 8, y: y - 2, size: 9, font: fontBold, color: C_PRIMARY,
          });
          currentPage.drawText(`From: ${r.departureLocation}  →  To: ${r.destination}`, {
            x: M_LEFT + 8, y: y - 16, size: 8, font, color: C_SECONDARY,
          });
          currentPage.drawText(`Departure: ${r.departureDatetime.replace('T', ' ')}  |  Return: ${r.returnDatetime.replace('T', ' ')}`, {
            x: M_LEFT + 8, y: y - 30, size: 8, font, color: C_SECONDARY,
          });
          const statusText = `Status: ${formatStatus(r.status)}`;
          currentPage.drawText(statusText, { x: M_LEFT + 8, y: y - 44, size: 8, font: fontBold, color: statusColor(r.status) });
          if (r.description) {
            currentPage.drawText(`Note: ${r.description}`, { x: M_LEFT + 180, y: y - 44, size: 8, font, color: C_MUTED });
          }
          currentPage.drawText(`Created by: ${r.createdBy}  |  ${r.createdAt.split('T')[0]}`, {
            x: M_LEFT + 8, y: y - 56, size: 7, font, color: C_MUTED,
          });
          y -= 72;
        });
        break;
      }

      case 'drivers': {
        addPage();
        drawSection('Executive Summary', 1);

        drawKpiRow([
          { label: 'Total Drivers', value: String(stats.drivers.total) },
          { label: 'Active', value: String(stats.drivers.active), color: C_GREEN },
          { label: 'Assigned', value: String(stats.drivers.assigned), color: C_BLUE },
          { label: 'Expired Permits', value: String(stats.drivers.expiredPermits), color: C_RED },
        ]);

        drawStat('Inactive Drivers', stats.drivers.inactive, stats.drivers.inactive > 0 ? C_RED : C_GREEN);
        drawStat('Unassigned Drivers', stats.drivers.unassigned);

        drawSection('License & Permit Analysis', 2);
        drawSubSection('License Types');
        const licTypes: Record<string, number> = {};
        drivers.forEach(d => { licTypes[d.license.type] = (licTypes[d.license.type] || 0) + 1; });
        Object.entries(licTypes).sort((a, b) => b[1] - a[1]).forEach(([type, cnt]) => {
          drawStatWithBar(formatStatus(type), cnt, drivers.length, C_BLUE);
        });

        drawSubSection('Permit Status');
        const totalPermits = drivers.reduce((a, d) => a + d.permits.length, 0);
        const activePermits = drivers.reduce((a, d) => a + d.permits.filter(p => p.status === 'active').length, 0);
        const expiredPermits = drivers.reduce((a, d) => a + d.permits.filter(p => p.status === 'expired').length, 0);
        const revokedPermits = drivers.reduce((a, d) => a + d.permits.filter(p => p.status === 'revoked').length, 0);
        drawStat('Total Permits Issued', totalPermits);
        drawStatWithBar('Active Permits', activePermits, totalPermits, C_GREEN);
        drawStatWithBar('Expired Permits', expiredPermits, totalPermits, C_RED);
        if (revokedPermits > 0) drawStatWithBar('Revoked Permits', revokedPermits, totalPermits, C_RED);

        drawSection('Driver Details', 3);
        const drvHeaders = ['Name', 'National ID', 'Nationality', 'License', 'Lic. Expiry', 'Vehicle', 'Status', 'Permits'];
        const drvColW = [80, 70, 60, 50, 60, 75, 50, CONTENT_W - 445];
        const drvRows = drivers.map(d => {
          const car = d.assignedCarId ? vehicles.find(v => v.id === d.assignedCarId) : null;
          const activePerm = d.permits.filter(p => p.status === 'active').length;
          const expPerm = d.permits.filter(p => p.status === 'expired').length;
          return [
            d.name,
            d.nationalId,
            formatStatus(d.nationality),
            formatStatus(d.license.type),
            d.license.expiryDate,
            car ? `${car.brand} ${car.model}` : { text: 'Unassigned', color: C_MUTED },
            { text: formatStatus(d.status), color: statusColor(d.status) },
            `${activePerm}A / ${expPerm}E`,
          ];
        });
        drawTable(drvHeaders, drvRows, drvColW);

        drawSubSection('Driver Profiles');
        drivers.forEach(d => {
          const car = d.assignedCarId ? vehicles.find(v => v.id === d.assignedCarId) : null;
          const blockH = 50 + d.permits.length * 14;
          ensureSpace(blockH + 10);

          currentPage.drawRectangle({
            x: M_LEFT, y: y - blockH + 5, width: CONTENT_W, height: blockH,
            color: rgb(0.97, 0.98, 0.99), borderColor: C_BORDER, borderWidth: 0.5,
          });

          currentPage.drawText(`${d.name}  (${d.id})`, { x: M_LEFT + 8, y: y - 2, size: 10, font: fontBold, color: C_PRIMARY });
          currentPage.drawText(`Nationality: ${formatStatus(d.nationality)}  |  Occupation: ${d.occupation}  |  Phone: ${d.phone}`, {
            x: M_LEFT + 8, y: y - 16, size: 8, font, color: C_SECONDARY,
          });
          currentPage.drawText(`License: ${formatStatus(d.license.type)} (${d.license.number})  |  Expires: ${d.license.expiryDate}`, {
            x: M_LEFT + 8, y: y - 30, size: 8, font, color: C_SECONDARY,
          });
          const vehicleText = car ? `Assigned: ${car.brand} ${car.model} (${car.plate})` : 'Assigned: None';
          currentPage.drawText(vehicleText, { x: M_LEFT + 8, y: y - 44, size: 8, font, color: car ? C_BLUE : C_MUTED });

          d.permits.forEach((p, pi) => {
            const py = y - 58 - pi * 14;
            currentPage.drawText(
              `  Permit: ${formatStatus(p.type)}  |  ${p.issueDate} — ${p.expiryDate}  |  Status: ${formatStatus(p.status)}${p.notes ? `  |  ${p.notes}` : ''}`,
              { x: M_LEFT + 8, y: py, size: 7, font, color: statusColor(p.status) }
            );
          });

          y -= blockH + 8;
        });
        break;
      }
    }

    drawFooters();

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  // ─── PDF Actions ──────────────────────────────────────────────────────

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

      const newReport: ReportHistoryItem = {
        id: `RPT-${String(reportHistory.length + 1).padStart(3, '0')}`,
        type: selectedReport,
        dateRange: { start: dateRange.start, end: dateRange.end },
        generatedAt: new Date().toLocaleString('en-US', {
          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
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
      drivers: t('pages.reports.tabs.drivers'),
    };
    return labels[type];
  };

  const getReportTypeIcon = (type: ReportType) => {
    const icons: Record<ReportType, typeof Car> = {
      fleet: Car, carRequests: TrendingUp, maintenance: Wrench, inventory: Package, drivers: Users,
    };
    return icons[type];
  };

  const getReportTypeColor = (type: ReportType) => {
    const colors: Record<ReportType, string> = {
      fleet: 'emerald', carRequests: 'blue', maintenance: 'amber', inventory: 'purple', drivers: 'indigo',
    };
    return colors[type];
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.reports.title')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">{t('pages.reports.description')}</p>
        </div>
      </header>

      {/* PDF Generation Section */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-700">{t('pages.reports.generatePdf')}</span>
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
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                      indigo: 'bg-indigo-100 text-indigo-700',
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {reportHistory.map((report) => {
                const Icon = getReportTypeIcon(report.type);
                const color = getReportTypeColor(report.type);
                const colorClasses: Record<string, string> = {
                  emerald: 'bg-emerald-100 text-emerald-700',
                  blue: 'bg-blue-100 text-blue-700',
                  amber: 'bg-amber-100 text-amber-700',
                  purple: 'bg-purple-100 text-purple-700',
                  indigo: 'bg-indigo-100 text-indigo-700',
                };

                return (
                  <div key={report.id} className="py-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
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
                        <div>
                          <p className="text-sm font-bold text-slate-800">{report.id}</p>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]} mt-1`}>
                            <Icon size={14} />
                            {getReportTypeLabel(report.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs ms-7">
                      <div><span className="text-slate-400">{t('pages.reports.dateRange')}:</span> <span className="text-slate-600">{report.dateRange.start} - {report.dateRange.end}</span></div>
                      <div><span className="text-slate-400">{t('pages.reports.generatedAt')}:</span> <span className="text-slate-600">{report.generatedAt}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
