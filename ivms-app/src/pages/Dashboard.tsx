import { useMemo } from 'react';
import {
  Car,
  Wrench,
  Fuel,
  Activity,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  StatCard,
  GlassCard,
  IconButton,
  HealthIndicator,
  MetricCard,
} from '../components/ui';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { fuelData } from '../data';

export function Dashboard() {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const { vehicles, maintenance, showToast } = useApp();
  const isRTL = direction === 'rtl';

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;
    const totalMaintenance = maintenance.length;
    const criticalMaintenance = maintenance.filter(m => m.priority === 'high' && m.status !== 'completed').length;
    const readinessRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    const totalFuel = vehicles.reduce((acc, v) => acc + v.fuel, 0);
    const avgFuel = totalVehicles > 0 ? Math.round(totalFuel / totalVehicles) : 0;

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      inactiveVehicles,
      totalMaintenance,
      criticalMaintenance,
      readinessRate,
      avgFuel,
    };
  }, [vehicles, maintenance]);

  // Top 3 vehicles for fleet analysis
  const topVehicles = useMemo(() => {
    return vehicles.slice(0, 3).map(v => ({
      id: v.id,
      plate: v.plate,
      brand: `${v.brand} ${v.model}`,
      health: Math.max(0, 100 - Math.floor(v.mileage / 1000)), // Simple health calculation
      trips: Math.floor(v.mileage / 100),
      fuel: v.fuel,
    }));
  }, [vehicles]);

  // Recent maintenance requests
  const recentMaintenance = useMemo(() => {
    return maintenance.slice(0, 3);
  }, [maintenance]);

  const handleDownloadPDF = () => {
    // Create a simple text report
    const report = `
${t('pages.dashboard.totalVehicles')}: ${stats.totalVehicles}
${t('pages.dashboard.active')}: ${stats.activeVehicles}
${t('pages.dashboard.maintenance')}: ${stats.maintenanceVehicles}
${t('pages.dashboard.stopped')}: ${stats.inactiveVehicles}
${t('pages.dashboard.readinessRate')}: ${stats.readinessRate}%

${t('pages.dashboard.maintenanceRequests')}: ${stats.totalMaintenance}
${t('pages.dashboard.critical')}: ${stats.criticalMaintenance}

${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
    `.trim();

    const blob = new Blob(['\ufeff' + report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fleet-report.txt';
    link.click();
    showToast(t('pages.dashboard.reportDownloaded'), 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('pages.dashboard.totalVehicles')}
          value={stats.totalVehicles.toString()}
          icon={Car}
          trend={`${stats.activeVehicles} ${t('pages.dashboard.active')}`}
          trendType="success"
        />
        <StatCard
          title={t('pages.dashboard.maintenanceRequests')}
          value={stats.totalMaintenance.toString()}
          icon={Wrench}
          trend={stats.criticalMaintenance > 0 ? `${stats.criticalMaintenance} ${t('pages.dashboard.critical')}` : t('pages.dashboard.noCritical')}
          trendType={stats.criticalMaintenance > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title={t('pages.dashboard.readinessRate')}
          value={`${stats.readinessRate}%`}
          icon={Activity}
          trend={stats.readinessRate >= 80 ? t('pages.dashboard.excellent') : stats.readinessRate >= 60 ? t('pages.dashboard.good') : t('pages.dashboard.needsImprovement')}
          trendType={stats.readinessRate >= 80 ? 'success' : stats.readinessRate >= 60 ? 'warning' : 'danger'}
        />
        <StatCard
          title={t('pages.dashboard.avgFuel')}
          value={`${stats.avgFuel}%`}
          icon={Fuel}
          trend={stats.avgFuel >= 50 ? t('pages.dashboard.good') : t('pages.dashboard.low')}
          trendType={stats.avgFuel >= 50 ? 'success' : 'warning'}
        />
      </div>

      {/* Fleet Analysis Section */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{t('pages.dashboard.fleetEfficiencyAnalysis')}</h2>
          <IconButton icon={Download} label={t('pages.dashboard.pdfReport')} onClick={handleDownloadPDF} />
        </div>

        {topVehicles.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Car size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">{t('pages.dashboard.noVehiclesToShow')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topVehicles.map((v, i) => (
              <GlassCard
                key={i}
                className="group hover:border-emerald-200 transition-all cursor-pointer"
                onClick={() => showToast(`${t('pages.dashboard.viewVehicleDetails')} ${v.plate}`, 'info')}
              >
                <div className="p-5 space-y-4">
                  {/* Vehicle Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Car size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{v.plate}</h4>
                        <p className="text-xs text-slate-500">{v.brand}</p>
                      </div>
                    </div>
                  </div>

                  {/* Health Indicator */}
                  <HealthIndicator value={v.health} />

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <MetricCard label={t('pages.dashboard.trips')} value={v.trips} />
                    <MetricCard
                      label={t('pages.dashboard.fuel')}
                      value={`${v.fuel}%`}
                      icon={Fuel}
                      iconColor={v.fuel < 20 ? 'text-rose-500' : 'text-emerald-500'}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400">{t('pages.dashboard.lastInspection')}</span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {t('pages.dashboard.details')} {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuel Consumption Chart */}
        <GlassCard className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">{t('pages.dashboard.monthlyFuelConsumption')}</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-3 h-3 bg-cyan-500 rounded-full"></span> {t('pages.dashboard.actualConsumption')}
              </span>
            </div>
          </div>
          <div className="h-48 w-full flex items-end justify-between gap-3">
            {fuelData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer h-full">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-cyan-100 rounded-t-lg group-hover:bg-cyan-500 transition-all duration-300 relative"
                    style={{ height: `${item.value}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.value * 100} {t('pages.dashboard.liters')}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Fleet Status Donut Chart */}
        <GlassCard className="p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('pages.dashboard.fleetStatusDistribution')}</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 mb-6">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="3"></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${stats.totalVehicles > 0 ? (stats.activeVehicles / stats.totalVehicles * 100) : 0} 100`}
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray={`${stats.totalVehicles > 0 ? (stats.maintenanceVehicles / stats.totalVehicles * 100) : 0} 100`}
                  strokeDashoffset={`-${stats.totalVehicles > 0 ? (stats.activeVehicles / stats.totalVehicles * 100) : 0}`}
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="transparent"
                  stroke="#e879f9"
                  strokeWidth="3"
                  strokeDasharray={`${stats.totalVehicles > 0 ? (stats.inactiveVehicles / stats.totalVehicles * 100) : 0} 100`}
                  strokeDashoffset={`-${stats.totalVehicles > 0 ? ((stats.activeVehicles + stats.maintenanceVehicles) / stats.totalVehicles * 100) : 0}`}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">{stats.readinessRate}%</span>
                <span className="text-[10px] text-slate-400">{t('pages.dashboard.readiness')}</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> {t('pages.dashboard.active')}
                </span>
                <span className="text-xs font-bold text-slate-800">{stats.activeVehicles} {t('pages.dashboard.vehicle')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span> {t('pages.dashboard.maintenance')}
                </span>
                <span className="text-xs font-bold text-slate-800">{stats.maintenanceVehicles} {t('pages.dashboard.vehicle')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2 h-2 bg-fuchsia-400 rounded-full"></span> {t('pages.dashboard.stopped')}
                </span>
                <span className="text-xs font-bold text-slate-800">{stats.inactiveVehicles} {t('pages.dashboard.vehicle')}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Maintenance Requests */}
      <GlassCard className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">{t('pages.dashboard.recentMaintenanceRequests')}</h3>
          <button className="text-emerald-600 text-xs font-bold hover:underline">{t('pages.dashboard.viewAll')}</button>
        </div>

        {recentMaintenance.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Wrench size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm">{t('pages.dashboard.noMaintenanceRequests')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMaintenance.map((req) => (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-emerald-50/50 transition-colors border border-transparent hover:border-emerald-100 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      req.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    <Wrench size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{req.description}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      {req.vehicle} • {t(`maintenanceTypes.${req.type}`)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${
                  req.status === 'completed' ? 'text-emerald-600' : req.status === 'in_progress' ? 'text-slate-600' : 'text-amber-600'
                }`}>
                  {t(`statuses.${req.status === 'in_progress' ? 'inProgress' : req.status === 'pending_approval' ? 'pendingApproval' : req.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
