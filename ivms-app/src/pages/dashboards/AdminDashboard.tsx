import { useMemo } from 'react';
import {
  Car,
  Wrench,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';

// Mock pending approvals data
const mockPendingApprovals = {
  carRequests: [
    { id: 'CR-001', type: 'طلب مركبة', requester: 'أحمد محمد', department: 'العمليات', date: '2024-01-15', priority: 'عالية' },
    { id: 'CR-002', type: 'طلب مركبة', requester: 'سعد العلي', department: 'العمليات', date: '2024-01-14', priority: 'متوسطة' },
  ],
  maintenance: [
    { id: 'MR-001', type: 'صيانة', vehicle: 'ABC 1234', description: 'تغيير زيت', cost: '500 ريال', date: '2024-01-15' },
    { id: 'MR-002', type: 'صيانة', vehicle: 'XYZ 5678', description: 'فحص شامل', cost: '1200 ريال', date: '2024-01-14' },
  ],
  inventory: [
    { id: 'PR-001', type: 'شراء قطع', item: 'فلتر زيت (10)', requestedBy: 'الكراج', cost: '800 ريال', date: '2024-01-15' },
  ],
  carInventory: [
    { id: 'CI-001', type: 'إضافة مركبة', plate: 'NEW 1234', brand: 'Toyota Camry', requestedBy: 'الكراج', date: '2024-01-15' },
  ],
};

export function AdminDashboard() {
  const { t } = useTranslation();
  const { vehicles, showToast } = useApp();

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'نشط').length;
    const pendingApprovals = mockPendingApprovals.carRequests.length +
                            mockPendingApprovals.maintenance.length +
                            mockPendingApprovals.inventory.length +
                            mockPendingApprovals.carInventory.length;
    const completedToday = 5; // Mock
    return { totalVehicles, activeVehicles, pendingApprovals, completedToday };
  }, [vehicles]);

  const handleApprove = (id: string, typeKey: string) => {
    showToast(t('dashboards.admin.approvedRequest', { type: t(`dashboards.admin.${typeKey}`), id }), 'success');
  };

  const handleReject = (id: string, typeKey: string) => {
    showToast(t('dashboards.admin.rejectedRequest', { type: t(`dashboards.admin.${typeKey}`), id }), 'warning');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.admin.title')}</h1>
        <p className="text-slate-500 text-sm">{t('dashboards.admin.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboards.admin.totalVehicles')}
          value={stats.totalVehicles.toString()}
          icon={Car}
          trend={`${stats.activeVehicles} ${t('dashboards.admin.active')}`}
          trendType="success"
        />
        <StatCard
          title={t('dashboards.admin.pendingApprovals')}
          value={stats.pendingApprovals.toString()}
          icon={Clock}
          trend={t('dashboards.admin.needsReview')}
          trendType={stats.pendingApprovals > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title={t('dashboards.admin.requestsToday')}
          value={stats.completedToday.toString()}
          icon={FileText}
          trend={t('dashboards.admin.completed')}
          trendType="success"
        />
        <StatCard
          title={t('dashboards.admin.activeUsers')}
          value="12"
          icon={Users}
          trend={t('dashboards.admin.onlineNow')}
          trendType="info"
        />
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{t('dashboards.admin.pendingApprovalsSection')}</h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            {stats.pendingApprovals} {t('dashboards.admin.pending')}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Car Requests Approvals */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Car size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{t('dashboards.admin.carRequests')}</h3>
              </div>
              <Badge type="info">{mockPendingApprovals.carRequests.length}</Badge>
            </div>
            <div className="space-y-3">
              {mockPendingApprovals.carRequests.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.requester}</p>
                      <p className="text-xs text-slate-500">{req.department} • {req.date}</p>
                    </div>
                    <Badge type={req.priority === 'عالية' ? 'danger' : 'warning'}>{req.priority}</Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(req.id, 'request')}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> {t('dashboards.admin.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req.id, 'request')}
                      className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> {t('dashboards.admin.reject')}
                    </button>
                  </div>
                </div>
              ))}
              {mockPendingApprovals.carRequests.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">{t('dashboards.admin.noPendingRequests')}</p>
              )}
            </div>
          </GlassCard>

          {/* Maintenance Approvals */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                  <Wrench size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{t('dashboards.admin.maintenanceRequests')}</h3>
              </div>
              <Badge type="warning">{mockPendingApprovals.maintenance.length}</Badge>
            </div>
            <div className="space-y-3">
              {mockPendingApprovals.maintenance.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.vehicle}</p>
                      <p className="text-xs text-slate-500">{req.description} • {req.cost}</p>
                    </div>
                    <span className="text-xs text-slate-400">{req.date}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(req.id, 'maintenanceRequest')}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> {t('dashboards.admin.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req.id, 'maintenanceRequest')}
                      className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> {t('dashboards.admin.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Purchase Requests */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Package size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{t('dashboards.admin.purchaseRequests')}</h3>
              </div>
              <Badge type="info">{mockPendingApprovals.inventory.length}</Badge>
            </div>
            <div className="space-y-3">
              {mockPendingApprovals.inventory.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.item}</p>
                      <p className="text-xs text-slate-500">{req.requestedBy} • {req.cost}</p>
                    </div>
                    <span className="text-xs text-slate-400">{req.date}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(req.id, 'purchaseRequest')}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> {t('dashboards.admin.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req.id, 'purchaseRequest')}
                      className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> {t('dashboards.admin.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Car Inventory Requests */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{t('dashboards.admin.addVehicleRequests')}</h3>
              </div>
              <Badge type="success">{mockPendingApprovals.carInventory.length}</Badge>
            </div>
            <div className="space-y-3">
              {mockPendingApprovals.carInventory.map((req) => (
                <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{req.plate}</p>
                      <p className="text-xs text-slate-500">{req.brand} • {req.requestedBy}</p>
                    </div>
                    <span className="text-xs text-slate-400">{req.date}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(req.id, 'addRequest')}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> {t('dashboards.admin.approve')}
                    </button>
                    <button
                      onClick={() => handleReject(req.id, 'addRequest')}
                      className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> {t('dashboards.admin.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.admin.recentActivity')}</h3>
        <div className="space-y-3">
          {[
            { action: t('dashboards.admin.carRequestApproved'), user: t('dashboards.admin.theManager'), time: t('dashboards.admin.minutesAgo', { count: 5 }), type: 'success' },
            { action: t('dashboards.admin.newMaintenanceRequest'), user: t('dashboards.admin.theGarage'), time: t('dashboards.admin.minutesAgo', { count: 15 }), type: 'info' },
            { action: t('dashboards.admin.vehicleReturned'), user: t('dashboards.admin.theOperations'), time: t('dashboards.admin.minutesAgo', { count: 30 }), type: 'success' },
            { action: t('dashboards.admin.partsOrderRequest'), user: t('dashboards.admin.theMaintenance'), time: t('dashboards.admin.hourAgo'), type: 'warning' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-emerald-500' :
                  activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-800">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.user}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
