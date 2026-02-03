import { useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Calendar,
  Eye,
  MoreVertical,
  Play,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard, Dropdown } from '../../components/ui';
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
  { id: 'MR-020', vehicle: 'JKL 7890', task: 'صيانة دورية 50,000 كم', scheduledDate: '2024-01-20', type: 'وقائية' },
  { id: 'MR-021', vehicle: 'MNO 1234', task: 'تغيير زيت', scheduledDate: '2024-01-22', type: 'وقائية' },
  { id: 'MR-022', vehicle: 'PQR 5678', task: 'فحص الإطارات', scheduledDate: '2024-01-25', type: 'وقائية' },
];

export function MaintenanceDashboard() {
  const { t } = useTranslation();
  const { maintenance, inventory, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'triage' | 'inprogress' | 'scheduled' | 'parts'>('triage');

  const stats = useMemo(() => {
    const pendingTriage = mockPendingTriage.length;
    const inProgress = mockInProgress.length;
    const scheduled = mockScheduled.length;
    const completedThisMonth = maintenance.filter(m => m.status === 'مكتمل').length;
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'triage', label: t('dashboards.maintenance.triage'), icon: Settings, count: stats.pendingTriage },
          { id: 'inprogress', label: t('dashboards.maintenance.inProgressTab'), icon: Wrench, count: stats.inProgress },
          { id: 'scheduled', label: t('dashboards.maintenance.scheduledTab'), icon: Calendar, count: stats.scheduled },
          { id: 'parts', label: t('dashboards.maintenance.partsRequest'), icon: Package },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-amber-100 text-amber-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Triage Tab */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.maintenance.requestsAwaitingTriage')}</h3>
            {mockPendingTriage.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 size={48} className="mx-auto mb-2 text-emerald-500" />
                <p>{t('dashboards.maintenance.noPendingTriageRequests')}</p>
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
          </GlassCard>
        </div>
      )}

      {/* In Progress Tab */}
      {activeTab === 'inprogress' && (
        <GlassCard className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.maintenance.maintenanceInProgress')}</h3>
          {mockInProgress.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Wrench size={48} className="mx-auto mb-2" />
              <p>{t('dashboards.maintenance.noWorkInProgress')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockInProgress.map((task) => (
                <div key={task.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
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
                    <Dropdown
                      trigger={<MoreVertical size={18} />}
                      items={[
                        { label: t('dashboards.maintenance.viewDetails'), icon: <Eye size={16} />, onClick: () => showToast(t('dashboards.maintenance.viewDetails') + ` ${task.id}`, 'info') },
                        { label: t('dashboards.maintenance.requestParts'), icon: <Package size={16} />, onClick: () => handleRequestParts(task.id) },
                      ]}
                    />
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
                  <button
                    onClick={() => handleCompleteWork(task.id)}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> {t('dashboards.maintenance.markAsComplete')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <GlassCard className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.maintenance.scheduledMaintenance')}</h3>
          {mockScheduled.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar size={48} className="mx-auto mb-2" />
              <p>{t('dashboards.maintenance.noScheduledMaintenance')}</p>
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
        </GlassCard>
      )}

      {/* Parts Request Tab */}
      {activeTab === 'parts' && (
        <GlassCard className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.maintenance.partsRequestForMaintenance')}</h3>
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
        </GlassCard>
      )}
    </div>
  );
}
