import { useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Calendar,
  Play,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard } from '../../components/ui';
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
  const { maintenance, inventory, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'triage' | 'inprogress' | 'scheduled' | 'parts'>('triage');

  const stats = useMemo(() => {
    const pendingTriage = mockPendingTriage.length;
    const inProgress = mockInProgress.length;
    const scheduled = mockScheduled.length;
    const completedThisMonth = maintenance.filter(m => m.status === 'completed').length;
    return { pendingTriage, inProgress, scheduled, completedThisMonth };
  }, [maintenance]);

  const handleTriageComplete = (id: string, type: 'internal' | 'external') => {
    showToast(t('dashboards.maintenance.triageCompleted', { id, type: t(`dashboards.maintenance.${type}`) }), 'success');
  };

  const handleStartWork = (id: string) => {
    showToast(t('dashboards.maintenance.workStarted', { id }), 'success');
  };

  const handleCompleteWork = (id: string) => {
    showToast(t('dashboards.maintenance.workCompleted', { id }), 'success');
  };

  const handleRequestParts = (id: string) => {
    showToast(t('dashboards.maintenance.partsRequested', { id }), 'info');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.maintenance.title')}</h1>
        <p className="text-slate-500 text-sm">{t('dashboards.maintenance.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              { id: 'parts', label: t('dashboards.maintenance.partsRequest') },
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
                  <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Triage Tab Content */}
        {activeTab === 'triage' && (
          <div className="p-6">
            {mockPendingTriage.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.noPendingTriageRequests')}</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {mockPendingTriage.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-600 font-bold">{req.id}</span>
                          <Badge type="warning">{t('dashboards.maintenance.awaitingTriage')}</Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{req.vehicle} - {req.brand}</p>
                        <p className="text-xs text-slate-500">{req.description}</p>
                        <p className="text-xs text-slate-400 mt-1">{req.reportedBy} • {req.date}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <p className="text-xs text-slate-500 mb-2">{t('dashboards.maintenance.classifyMaintenanceType')}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTriageComplete(req.id, 'internal')}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                        >
                          {t('dashboards.maintenance.internalMaintenance')}
                        </button>
                        <button
                          onClick={() => handleTriageComplete(req.id, 'external')}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                        >
                          {t('dashboards.maintenance.externalMaintenance')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* In Progress Tab Content */}
        {activeTab === 'inprogress' && (
          <div className="p-6">
            {mockInProgress.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Wrench size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.noWorkInProgress')}</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {mockInProgress.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-600 font-bold">{task.id}</span>
                          <Badge type="info">{t('dashboards.maintenance.inProgressTab')}</Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{task.vehicle}</p>
                        <p className="text-xs text-slate-500">{task.task}</p>
                        <p className="text-xs text-slate-400 mt-1">{task.assignee} • {t('time.startedAgo')}: {task.startDate}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{t('dashboards.maintenance.progress')}</span>
                        <span className="font-bold text-slate-700">{task.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestParts(task.id)}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                      >
                        <Package size={16} /> {t('dashboards.maintenance.requestParts')}
                      </button>
                      <button
                        onClick={() => handleCompleteWork(task.id)}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> {t('dashboards.maintenance.markAsComplete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scheduled Tab Content */}
        {activeTab === 'scheduled' && (
          <div className="p-6">
            {mockScheduled.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.maintenance.noScheduledMaintenance')}</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {mockScheduled.map((task) => (
                  <div key={task.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{task.vehicle}</span>
                          <Badge type="info">{task.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{task.task}</p>
                        <p className="text-xs text-slate-400">{t('dashboards.maintenance.scheduledDate')} {task.scheduledDate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartWork(task.id)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      <Play size={16} /> {t('dashboards.maintenance.startWork')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Parts Request Tab Content */}
        {activeTab === 'parts' && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t('dashboards.maintenance.lowStockParts')}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('dashboards.maintenance.partsNeedReorder', { count: inventory.filter(i => i.quantity <= i.minStock).length })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">{t('dashboards.maintenance.availableParts')}</h4>
                <div className="space-y-2">
                  {inventory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        item.quantity <= item.minStock
                          ? 'bg-red-50 border-red-100'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                          {item.quantity} {t('dashboards.maintenance.available')}
                        </span>
                        <button
                          onClick={() => showToast(t('dashboards.maintenance.requestingPart', { name: item.name }), 'info')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                        >
                          {t('dashboards.maintenance.request')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
