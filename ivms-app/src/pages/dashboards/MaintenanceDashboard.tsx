import { useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, GlassCard } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';

// Mock pending triage data
const mockPendingTriage = [
  { id: 'MR-001', vehicle: 'ABC 1234', brand: 'Toyota Camry', description: 'صوت غريب من المحرك', reportedBy: 'الكراج', date: '2024-01-15' },
  { id: 'MR-002', vehicle: 'XYZ 5678', brand: 'Honda Accord', description: 'تسريب زيت', reportedBy: 'الكراج', date: '2024-01-14' },
];

// Mock in-progress maintenance
const mockInProgress = [
  { id: 'MR-010', vehicle: 'DEF 9012', task: 'تغيير فرامل', progress: 70, assignee: 'محمد أحمد', startDate: '2024-01-14' },
  { id: 'MR-011', vehicle: 'GHI 3456', task: 'فحص شامل', progress: 30, assignee: 'علي خالد', startDate: '2024-01-15' },
];

// Mock scheduled maintenance
const mockScheduled = [
  { id: 'MR-020', vehicle: 'JKL 7890', task: '50,000 km service', scheduledDate: '2024-01-20', type: 'preventive' },
  { id: 'MR-021', vehicle: 'MNO 1234', task: 'Oil change', scheduledDate: '2024-01-22', type: 'preventive' },
  { id: 'MR-022', vehicle: 'PQR 5678', task: 'Tire inspection', scheduledDate: '2024-01-25', type: 'preventive' },
];

export function MaintenanceDashboard() {
  const { t } = useTranslation();
  const { maintenance, inventory } = useApp();

  const [activeTab, setActiveTab] = useState<'triage' | 'inprogress' | 'scheduled' | 'parts'>('triage');

  const stats = useMemo(() => {
    const pendingTriage = mockPendingTriage.length;
    const inProgress = mockInProgress.length;
    const scheduled = mockScheduled.length;
    const completedThisMonth = maintenance.filter(m => m.status === 'completed').length;
    return { pendingTriage, inProgress, scheduled, completedThisMonth };
  }, [maintenance]);

  const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.maintenance.title')}</h1>
        <p className="text-slate-500 text-sm">{t('dashboards.maintenance.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t('dashboards.maintenance.pendingTriage')}
          value={stats.pendingTriage.toString()}
          icon={Clock}
          trend={t('dashboards.maintenance.needsReview')}
          trendType={stats.pendingTriage > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title={t('dashboards.maintenance.inProgress')}
          value={stats.inProgress.toString()}
          icon={Wrench}
          trend={t('dashboards.maintenance.workInProgress')}
          trendType="info"
        />
        <StatCard
          title={t('dashboards.maintenance.scheduled')}
          value={stats.scheduled.toString()}
          icon={Calendar}
          trend={t('dashboards.maintenance.nextWeek')}
          trendType="info"
        />
        <StatCard
          title={t('dashboards.maintenance.completed')}
          value={stats.completedThisMonth.toString()}
          icon={CheckCircle2}
          trend={t('dashboards.maintenance.thisMonth')}
          trendType="success"
        />
      </div>

      {/* Main Card with Tabs */}
      <GlassCard>
        {/* Tab Navigation */}
        <div className="border-b border-slate-100">
          <div className="flex">
            {[
              { id: 'triage', label: t('dashboards.maintenance.triage'), count: stats.pendingTriage },
              { id: 'inprogress', label: t('dashboards.maintenance.inProgressTab'), count: stats.inProgress },
              { id: 'scheduled', label: t('dashboards.maintenance.scheduledTab'), count: stats.scheduled },
              { id: 'parts', label: t('dashboards.maintenance.partsRequest'), count: lowStockCount > 0 ? lowStockCount : undefined },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Triage Tab Content */}
        {activeTab === 'triage' && (
          <>
            {mockPendingTriage.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.noPendingTriageRequests')}</h3>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full rtl:text-right ltr:text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                        <th className="px-6 py-4">{t('dashboards.maintenance.requestId')}</th>
                        <th className="px-6 py-4">{t('dashboards.garage.theVehicle')}</th>
                        <th className="px-6 py-4">{t('common.description')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.reportedBy')}</th>
                        <th className="px-6 py-4">{t('common.date')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mockPendingTriage.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{req.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">{req.vehicle}</p>
                            <p className="text-xs text-slate-500">{req.brand}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">{req.description}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{req.reportedBy}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{req.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {mockPendingTriage.map((req) => (
                    <div key={req.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-emerald-600 font-bold text-sm">{req.id}</span>
                          <p className="text-sm font-bold text-slate-800 mt-1">{req.vehicle} - {req.brand}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{req.description}</p>
                      <p className="text-xs text-slate-400">{req.reportedBy} • {req.date}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* In Progress Tab Content */}
        {activeTab === 'inprogress' && (
          <>
            {mockInProgress.length === 0 ? (
              <div className="text-center py-12">
                <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.noWorkInProgress')}</h3>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full rtl:text-right ltr:text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                        <th className="px-6 py-4">{t('dashboards.maintenance.requestId')}</th>
                        <th className="px-6 py-4">{t('dashboards.garage.theVehicle')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.task')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.assignee')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.progress')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mockInProgress.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{task.id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{task.vehicle}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{task.task}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{task.assignee}</p>
                            <p className="text-xs text-slate-400">{task.startDate}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{task.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {mockInProgress.map((task) => (
                    <div key={task.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-emerald-600 font-bold text-sm">{task.id}</span>
                          <p className="text-sm font-bold text-slate-800 mt-1">{task.vehicle}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{task.progress}%</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{task.task}</p>
                      <p className="text-xs text-slate-400 mb-2">{task.assignee} • {task.startDate}</p>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Scheduled Tab Content */}
        {activeTab === 'scheduled' && (
          <>
            {mockScheduled.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.noScheduledMaintenance')}</h3>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full rtl:text-right ltr:text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                        <th className="px-6 py-4">{t('dashboards.garage.theVehicle')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.task')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.type')}</th>
                        <th className="px-6 py-4">{t('dashboards.maintenance.scheduledDate')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mockScheduled.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{task.vehicle}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{task.task}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{task.type}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{task.scheduledDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {mockScheduled.map((task) => (
                    <div key={task.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{task.vehicle}</p>
                          <p className="text-xs text-slate-500">{task.task}</p>
                        </div>
                        <span className="text-xs text-slate-500">{task.type}</span>
                      </div>
                      <p className="text-xs text-slate-400">{task.scheduledDate}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Parts Tab Content */}
        {activeTab === 'parts' && (
          <>
            {lowStockCount > 0 && (
              <div className="p-4 mx-6 mt-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t('dashboards.maintenance.lowStockParts')}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('dashboards.maintenance.partsNeedReorder', { count: lowStockCount })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.availableParts')}</h3>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full rtl:text-right ltr:text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                        <th className="px-6 py-4">{t('pages.inventory.item')}</th>
                        <th className="px-6 py-4">{t('pages.inventory.category')}</th>
                        <th className="px-6 py-4">{t('pages.inventory.available')}</th>
                        <th className="px-6 py-4">{t('pages.inventory.minStock')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {inventory.slice(0, 10).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold ${item.quantity <= item.minStock ? 'text-rose-600' : 'text-slate-700'}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{item.minStock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {inventory.slice(0, 10).map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.category}</p>
                        </div>
                        <span className={`text-sm font-bold ${item.quantity <= item.minStock ? 'text-rose-600' : 'text-slate-700'}`}>
                          {item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{t('pages.inventory.minStock')}: {item.minStock}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}
