import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  MapPin,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard, Badge, Dropdown } from '../components/ui';
import { useApp } from '../contexts/AppContext';

interface CarRequest {
  id: string;
  purpose: string;
  destination: string;
  requester: string;
  startDate: string;
  endDate: string;
  status: 'مكتمل' | 'ملغي' | 'معلق' | 'تم التعيين' | 'في الطريق';
  assignedCar: string | null;
  driver: string | null;
}

// Mock historical car requests data
const mockRequestLog: CarRequest[] = [
  { id: 'CR-001', purpose: 'توصيل بضائع', destination: 'الرياض', requester: 'أحمد محمد', startDate: '2024-01-10', endDate: '2024-01-10', status: 'مكتمل', assignedCar: 'ABC 1234', driver: 'سعيد العتيبي' },
  { id: 'CR-002', purpose: 'زيارة عميل', destination: 'جدة', requester: 'محمد علي', startDate: '2024-01-09', endDate: '2024-01-09', status: 'مكتمل', assignedCar: 'XYZ 5678', driver: 'خالد الشمري' },
  { id: 'CR-003', purpose: 'نقل موظفين', destination: 'الدمام', requester: 'فهد السعيد', startDate: '2024-01-08', endDate: '2024-01-08', status: 'ملغي', assignedCar: null, driver: null },
  { id: 'CR-004', purpose: 'اجتماع', destination: 'مكة', requester: 'عبدالله خالد', startDate: '2024-01-07', endDate: '2024-01-07', status: 'مكتمل', assignedCar: 'DEF 9012', driver: 'يوسف الحربي' },
  { id: 'CR-005', purpose: 'توصيل مستندات', destination: 'المدينة', requester: 'سلطان العمري', startDate: '2024-01-06', endDate: '2024-01-06', status: 'مكتمل', assignedCar: 'GHI 3456', driver: 'سعد القحطاني' },
  { id: 'CR-006', purpose: 'فحص موقع', destination: 'الطائف', requester: 'ناصر الدوسري', startDate: '2024-01-05', endDate: '2024-01-05', status: 'مكتمل', assignedCar: 'JKL 7890', driver: 'عمر الزهراني' },
  { id: 'CR-007', purpose: 'مقابلة عمل', destination: 'أبها', requester: 'راشد المطيري', startDate: '2024-01-04', endDate: '2024-01-04', status: 'ملغي', assignedCar: null, driver: null },
  { id: 'CR-008', purpose: 'تسليم طلبية', destination: 'تبوك', requester: 'بندر الغامدي', startDate: '2024-01-03', endDate: '2024-01-03', status: 'مكتمل', assignedCar: 'MNO 2468', driver: 'فيصل البقمي' },
];

export function OperationRequestLog() {
  const { t } = useTranslation();
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const stats = useMemo(() => {
    const completed = mockRequestLog.filter(r => r.status === 'مكتمل').length;
    const cancelled = mockRequestLog.filter(r => r.status === 'ملغي').length;
    const total = mockRequestLog.length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    return { completed, cancelled, total, completionRate };
  }, []);

  const filteredRequests = useMemo(() => {
    return mockRequestLog.filter(req => {
      const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.purpose.includes(searchTerm) ||
                           req.destination.includes(searchTerm) ||
                           req.requester.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  const handleDownloadLog = () => {
    const report = `
سجل طلبات المركبات
==================

إحصائيات:
- إجمالي الطلبات: ${stats.total}
- الطلبات المكتملة: ${stats.completed}
- الطلبات الملغاة: ${stats.cancelled}
- نسبة الإنجاز: ${stats.completionRate}%

الطلبات:
${mockRequestLog.map(req => `
رقم الطلب: ${req.id}
الغرض: ${req.purpose}
الوجهة: ${req.destination}
مقدم الطلب: ${req.requester}
التاريخ: ${req.startDate}
الحالة: ${req.status}
المركبة: ${req.assignedCar || 'غير معين'}
السائق: ${req.driver || 'غير معين'}
`).join('\n---\n')}

تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}
    `.trim();

    const blob = new Blob(['\ufeff' + report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'request-log.txt';
    link.click();
    showToast(t('pages.requestLog.logDownloaded'), 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مكتمل': return <Badge type="success">{status}</Badge>;
      case 'ملغي': return <Badge type="danger">{status}</Badge>;
      case 'معلق': return <Badge type="warning">{status}</Badge>;
      case 'تم التعيين': return <Badge type="info">{status}</Badge>;
      case 'في الطريق': return <Badge type="success">{status}</Badge>;
      default: return <Badge type="info">{status}</Badge>;
    }
  };

  const getDropdownItems = (request: CarRequest) => {
    return [
      {
        label: t('dashboards.operation.viewDetails'),
        icon: <Eye size={16} />,
        onClick: () => showToast(t('dashboards.operation.viewRequestDetails', { id: request.id }), 'info')
      },
    ];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.requestLog.title')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">{t('pages.requestLog.description')}</p>
        </div>
        <button
          onClick={handleDownloadLog}
          className="w-full sm:w-auto bg-slate-900 text-white px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Download size={18} /> {t('pages.requestLog.downloadLog')}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Requests */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.requestLog.totalRequests')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.total}</p>
        </GlassCard>

        {/* Completed */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.requestLog.completed')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.completed}</p>
        </GlassCard>

        {/* Cancelled */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.requestLog.cancelled')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.cancelled}</p>
        </GlassCard>

        {/* Completion Rate */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Clock size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.requestLog.completionRate')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.completionRate}%</p>
        </GlassCard>
      </div>

      {/* Request Log Table */}
      <GlassCard>
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">{t('pages.requestLog.requestHistory')}</h3>
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
              <option value="مكتمل">{t('dashboards.operation.completedStatus')}</option>
              <option value="ملغي">{t('pages.requestLog.cancelledStatus')}</option>
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
                <th className="px-6 py-4">{t('pages.requestLog.requester')}</th>
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
                  <td className="px-6 py-4 text-sm text-slate-600">{req.requester}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={14} />
                      {req.startDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {req.assignedCar ? (
                      <div className="flex items-center gap-1">
                        <Car size={14} className="text-slate-400" />
                        {req.assignedCar}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
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
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">{t('pages.requestLog.noRequests')}</h3>
            <p className="text-sm text-slate-400">
              {searchTerm || filterStatus !== 'all' ? t('dashboards.operation.noResults') : t('pages.requestLog.noRequestHistory')}
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
