import { useState, useMemo, type ReactNode } from 'react';
import {
  Car,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  ArrowLeftRight,
  MapPin,
  Calendar,
  Search,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard, Dropdown } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';

// Mock car requests data
const mockCarRequests = [
  { id: 'CR-001', purpose: 'توصيل بضائع', destination: 'الرياض', startDate: '2024-01-15', endDate: '2024-01-17', status: 'معلق', assignedCar: null },
  { id: 'CR-002', purpose: 'زيارة عميل', destination: 'جدة', startDate: '2024-01-16', endDate: '2024-01-16', status: 'تم التعيين', assignedCar: 'ABC 1234' },
  { id: 'CR-003', purpose: 'نقل موظفين', destination: 'الدمام', startDate: '2024-01-17', endDate: '2024-01-18', status: 'في الطريق', assignedCar: 'XYZ 5678' },
  { id: 'CR-004', purpose: 'اجتماع', destination: 'مكة', startDate: '2024-01-14', endDate: '2024-01-14', status: 'مكتمل', assignedCar: 'DEF 9012' },
];

export function OperationDashboard() {
  const { t } = useTranslation();
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const stats = useMemo(() => {
    const pending = mockCarRequests.filter(r => r.status === 'معلق').length;
    const assigned = mockCarRequests.filter(r => r.status === 'تم التعيين').length;
    const inTransit = mockCarRequests.filter(r => r.status === 'في الطريق').length;
    const completed = mockCarRequests.filter(r => r.status === 'مكتمل').length;
    return { pending, assigned, inTransit, completed, total: mockCarRequests.length };
  }, []);

  const filteredRequests = useMemo(() => {
    return mockCarRequests.filter(req => {
      const matchesSearch = req.id.includes(searchTerm) ||
                           req.purpose.includes(searchTerm) ||
                           req.destination.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const handleNewRequest = () => {
    showToast(t('dashboards.operation.openingNewRequestForm'), 'info');
  };

  const handleMarkInTransit = (id: string) => {
    showToast(t('dashboards.operation.statusUpdated', { id }), 'success');
  };

  const handleCancelRequest = (id: string) => {
    showToast(t('dashboards.operation.requestCancelled', { id }), 'warning');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'معلق': return <Badge type="warning">{status}</Badge>;
      case 'تم التعيين': return <Badge type="info">{status}</Badge>;
      case 'في الطريق': return <Badge type="success">{status}</Badge>;
      case 'مكتمل': return <Badge type="success">{status}</Badge>;
      case 'مرفوض': return <Badge type="danger">{status}</Badge>;
      default: return <Badge type="info">{status}</Badge>;
    }
  };

  const getDropdownItems = (request: typeof mockCarRequests[0]) => {
    const items: { label: string; icon: ReactNode; onClick: () => void; variant?: 'default' | 'danger' }[] = [
      { label: t('dashboards.operation.viewDetails'), icon: <Eye size={16} />, onClick: () => showToast(t('dashboards.operation.viewRequestDetails', { id: request.id }), 'info') },
    ];

    if (request.status === 'تم التعيين') {
      items.push({
        label: t('dashboards.operation.markAsInTransit'),
        icon: <Send size={16} />,
        onClick: () => handleMarkInTransit(request.id),
      });
    }

    if (request.status === 'معلق' || request.status === 'تم التعيين') {
      items.push({
        label: t('dashboards.operation.cancelRequest'),
        icon: <ArrowLeftRight size={16} />,
        onClick: () => handleCancelRequest(request.id),
        variant: 'danger',
      });
    }

    return items;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.operation.title')}</h1>
          <p className="text-slate-500 text-sm">{t('dashboards.operation.description')}</p>
        </div>
        <button
          onClick={handleNewRequest}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> {t('dashboards.operation.newCarRequest')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboards.operation.pendingRequests')}
          value={stats.pending.toString()}
          icon={Clock}
          trend={t('dashboards.operation.awaitingAssignment')}
          trendType={stats.pending > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title={t('dashboards.operation.assigned')}
          value={stats.assigned.toString()}
          icon={Car}
          trend={t('dashboards.operation.readyToGo')}
          trendType="info"
        />
        <StatCard
          title={t('dashboards.operation.inTransit')}
          value={stats.inTransit.toString()}
          icon={Send}
          trend={t('dashboards.operation.activeTrips')}
          trendType="success"
        />
        <StatCard
          title={t('dashboards.operation.completed')}
          value={stats.completed.toString()}
          icon={CheckCircle2}
          trend={t('dashboards.operation.thisMonth')}
          trendType="success"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleNewRequest}
          className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors flex items-center gap-3"
        >
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Plus size={24} />
          </div>
          <div className="text-right rtl:text-right ltr:text-left">
            <p className="font-bold text-slate-800">{t('dashboards.operation.newCarRequest')}</p>
            <p className="text-xs text-slate-500">{t('dashboards.operation.createCarRequest')}</p>
          </div>
        </button>

        <button
          onClick={() => showToast(t('dashboards.operation.viewReadyRequests'), 'info')}
          className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-100 transition-colors flex items-center gap-3"
        >
          <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
            <Send size={24} />
          </div>
          <div className="text-right rtl:text-right ltr:text-left">
            <p className="font-bold text-slate-800">{t('dashboards.operation.markDeparture')}</p>
            <p className="text-xs text-slate-500">{t('dashboards.operation.confirmTripStart')}</p>
          </div>
        </button>

        <button
          onClick={() => showToast(t('dashboards.operation.viewRequestLog'), 'info')}
          className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-colors flex items-center gap-3"
        >
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div className="text-right rtl:text-right ltr:text-left">
            <p className="font-bold text-slate-800">{t('dashboards.operation.requestLog')}</p>
            <p className="text-xs text-slate-500">{t('dashboards.operation.viewCompletedRequests')}</p>
          </div>
        </button>
      </div>

      {/* Car Requests Table */}
      <GlassCard>
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">{t('dashboards.operation.carRequests')}</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t('dashboards.operation.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              <option value="all">{t('dashboards.operation.allStatuses')}</option>
              <option value="معلق">{t('dashboards.operation.pending')}</option>
              <option value="تم التعيين">{t('dashboards.operation.assigned')}</option>
              <option value="في الطريق">{t('dashboards.operation.inTransitStatus')}</option>
              <option value="مكتمل">{t('dashboards.operation.completedStatus')}</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full rtl:text-right ltr:text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4">{t('dashboards.operation.requestNumber')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.purpose')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.destination')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.date')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.vehicle')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.status')}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{req.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{req.purpose}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin size={14} className="text-red-500" />
                      {req.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={14} />
                      {req.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {req.assignedCar || <span className="text-slate-400">-</span>}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                  <td className="px-6 py-4">
                    <Dropdown
                      trigger={<MoreVertical size={18} />}
                      items={getDropdownItems(req)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredRequests.map((req) => (
            <div key={req.id} className="p-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-emerald-600 font-bold text-sm">{req.id}</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{req.purpose}</p>
                </div>
                <Dropdown
                  trigger={<MoreVertical size={18} />}
                  items={getDropdownItems(req)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} className="text-red-500" />
                  {req.destination}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  {req.startDate}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {req.assignedCar || t('dashboards.operation.notAssigned')}
                </span>
                {getStatusBadge(req.status)}
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <Car size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.operation.noRequests')}</h3>
            <p className="text-sm text-slate-400">
              {searchTerm || filterStatus !== 'all' ? t('dashboards.operation.noResults') : t('dashboards.operation.startByCreating')}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
