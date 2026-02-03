import { useMemo, useState } from 'react';
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
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard, Modal } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';

// Types for request data
interface CarRequest {
  id: string;
  type: string;
  requester: string;
  department: string;
  date: string;
  priority: string;
}

interface MaintenanceRequest {
  id: string;
  type: string;
  vehicle: string;
  description: string;
  cost: string;
  date: string;
}

interface InventoryRequest {
  id: string;
  type: string;
  item: string;
  requestedBy: string;
  cost: string;
  date: string;
}

interface AddVehicleRequest {
  id: string;
  type: string;
  plate: string;
  brand: string;
  requestedBy: string;
  date: string;
}

type RequestType = CarRequest | MaintenanceRequest | InventoryRequest | AddVehicleRequest;

type TabType = 'carRequests' | 'maintenance' | 'inventory' | 'carInventory';

// Mock pending approvals data
const mockPendingApprovals = {
  carRequests: [
    { id: 'CR-001', type: 'طلب مركبة', requester: 'أحمد محمد', department: 'العمليات', date: '2024-01-15', priority: 'عالية' },
    { id: 'CR-002', type: 'طلب مركبة', requester: 'سعد العلي', department: 'العمليات', date: '2024-01-14', priority: 'متوسطة' },
    { id: 'CR-003', type: 'طلب مركبة', requester: 'محمد سالم', department: 'الصيانة', date: '2024-01-13', priority: 'عالية' },
  ],
  maintenance: [
    { id: 'MR-001', type: 'صيانة', vehicle: 'ABC 1234', description: 'تغيير زيت', cost: '500 ريال', date: '2024-01-15' },
    { id: 'MR-002', type: 'صيانة', vehicle: 'XYZ 5678', description: 'فحص شامل', cost: '1200 ريال', date: '2024-01-14' },
  ],
  inventory: [
    { id: 'PR-001', type: 'شراء قطع', item: 'فلتر زيت (10)', requestedBy: 'الكراج', cost: '800 ريال', date: '2024-01-15' },
    { id: 'PR-002', type: 'شراء قطع', item: 'إطارات (4)', requestedBy: 'الصيانة', cost: '2400 ريال', date: '2024-01-14' },
  ],
  carInventory: [
    { id: 'CI-001', type: 'إضافة مركبة', plate: 'NEW 1234', brand: 'Toyota Camry', requestedBy: 'الكراج', date: '2024-01-15' },
    { id: 'CI-002', type: 'إضافة مركبة', plate: 'NEW 5678', brand: 'Hyundai Sonata', requestedBy: 'الإدارة', date: '2024-01-14' },
  ],
};

const tabs: { key: TabType; icon: typeof Car; color: string; bgColor: string }[] = [
  { key: 'carRequests', icon: Car, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'maintenance', icon: Wrench, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { key: 'inventory', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { key: 'carInventory', icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
];

export function AdminDashboard() {
  const { t } = useTranslation();
  const { vehicles, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('carRequests');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'نشط').length;
    const pendingApprovals = mockPendingApprovals.carRequests.length +
                            mockPendingApprovals.maintenance.length +
                            mockPendingApprovals.inventory.length +
                            mockPendingApprovals.carInventory.length;
    const completedToday = 5;
    return { totalVehicles, activeVehicles, pendingApprovals, completedToday };
  }, [vehicles]);

  const currentRequests = mockPendingApprovals[activeTab];

  const getTabLabel = (key: TabType) => {
    const labels: Record<TabType, string> = {
      carRequests: t('dashboards.admin.carRequests'),
      maintenance: t('dashboards.admin.maintenanceRequests'),
      inventory: t('dashboards.admin.purchaseRequests'),
      carInventory: t('dashboards.admin.addVehicleRequests'),
    };
    return labels[key];
  };

  const getTypeKey = (tab: TabType): string => {
    const keys: Record<TabType, string> = {
      carRequests: 'request',
      maintenance: 'maintenanceRequest',
      inventory: 'purchaseRequest',
      carInventory: 'addRequest',
    };
    return keys[tab];
  };

  const handleRowClick = (request: RequestType) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleCheckboxChange = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === currentRequests.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentRequests.map(r => r.id)));
    }
  };

  const handleApprove = (id: string) => {
    showToast(t('dashboards.admin.approvedRequest', { type: t(`dashboards.admin.${getTypeKey(activeTab)}`), id }), 'success');
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    showToast(t('dashboards.admin.rejectedRequest', { type: t(`dashboards.admin.${getTypeKey(activeTab)}`), id }), 'warning');
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleBulkApprove = () => {
    if (selectedItems.size === 0) return;
    showToast(t('dashboards.admin.bulkApproved', { count: selectedItems.size }), 'success');
    setSelectedItems(new Set());
  };

  const handleBulkReject = () => {
    if (selectedItems.size === 0) return;
    showToast(t('dashboards.admin.bulkRejected', { count: selectedItems.size }), 'warning');
    setSelectedItems(new Set());
  };

  // Render table columns based on active tab
  const renderTableHeader = () => {
    switch (activeTab) {
      case 'carRequests':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requester')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.department')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.priority')}</th>
          </tr>
        );
      case 'maintenance':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('vehicles.vehicle')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.description')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('maintenance.cost')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
          </tr>
        );
      case 'inventory':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.item')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('requests.requestedBy')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('maintenance.cost')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
          </tr>
        );
      case 'carInventory':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('vehicles.plateNumber')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.vehicleBrand')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('requests.requestedBy')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
          </tr>
        );
    }
  };

  const renderTableRow = (request: RequestType) => {
    const isSelected = selectedItems.has(request.id);

    switch (activeTab) {
      case 'carRequests': {
        const req = request as CarRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.requester}</td>
            <td className="py-3 px-4 text-slate-600">{req.department}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
            <td className="py-3 px-4">
              <Badge type={req.priority === 'عالية' ? 'danger' : 'warning'}>{req.priority}</Badge>
            </td>
          </tr>
        );
      }
      case 'maintenance': {
        const req = request as MaintenanceRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.vehicle}</td>
            <td className="py-3 px-4 text-slate-600">{req.description}</td>
            <td className="py-3 px-4 text-slate-600">{req.cost}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
          </tr>
        );
      }
      case 'inventory': {
        const req = request as InventoryRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.item}</td>
            <td className="py-3 px-4 text-slate-600">{req.requestedBy}</td>
            <td className="py-3 px-4 text-slate-600">{req.cost}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
          </tr>
        );
      }
      case 'carInventory': {
        const req = request as AddVehicleRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.plate}</td>
            <td className="py-3 px-4 text-slate-600">{req.brand}</td>
            <td className="py-3 px-4 text-slate-600">{req.requestedBy}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
          </tr>
        );
      }
    }
  };

  const renderModalContent = () => {
    if (!selectedRequest) return null;

    switch (activeTab) {
      case 'carRequests': {
        const req = selectedRequest as CarRequest;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.requestId')}</p>
                <p className="font-medium text-slate-800">{req.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.requester')}</p>
                <p className="font-medium text-slate-800">{req.requester}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.department')}</p>
                <p className="font-medium text-slate-800">{req.department}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.date')}</p>
                <p className="font-medium text-slate-800">{req.date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.priority')}</p>
                <Badge type={req.priority === 'عالية' ? 'danger' : 'warning'}>{req.priority}</Badge>
              </div>
            </div>
          </div>
        );
      }
      case 'maintenance': {
        const req = selectedRequest as MaintenanceRequest;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.requestId')}</p>
                <p className="font-medium text-slate-800">{req.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('vehicles.vehicle')}</p>
                <p className="font-medium text-slate-800">{req.vehicle}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">{t('common.description')}</p>
                <p className="font-medium text-slate-800">{req.description}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('maintenance.cost')}</p>
                <p className="font-medium text-slate-800">{req.cost}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.date')}</p>
                <p className="font-medium text-slate-800">{req.date}</p>
              </div>
            </div>
          </div>
        );
      }
      case 'inventory': {
        const req = selectedRequest as InventoryRequest;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.requestId')}</p>
                <p className="font-medium text-slate-800">{req.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.item')}</p>
                <p className="font-medium text-slate-800">{req.item}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('requests.requestedBy')}</p>
                <p className="font-medium text-slate-800">{req.requestedBy}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('maintenance.cost')}</p>
                <p className="font-medium text-slate-800">{req.cost}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.date')}</p>
                <p className="font-medium text-slate-800">{req.date}</p>
              </div>
            </div>
          </div>
        );
      }
      case 'carInventory': {
        const req = selectedRequest as AddVehicleRequest;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.requestId')}</p>
                <p className="font-medium text-slate-800">{req.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('vehicles.plateNumber')}</p>
                <p className="font-medium text-slate-800">{req.plate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('dashboards.admin.vehicleBrand')}</p>
                <p className="font-medium text-slate-800">{req.brand}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('requests.requestedBy')}</p>
                <p className="font-medium text-slate-800">{req.requestedBy}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.date')}</p>
                <p className="font-medium text-slate-800">{req.date}</p>
              </div>
            </div>
          </div>
        );
      }
    }
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

      {/* Pending Approvals Section with Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{t('dashboards.admin.pendingApprovalsSection')}</h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            {stats.pendingApprovals} {t('dashboards.admin.pending')}
          </span>
        </div>

        <GlassCard className="p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = mockPendingApprovals[tab.key].length;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSelectedItems(new Set());
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `${tab.bgColor} ${tab.color} shadow-sm`
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{getTabLabel(tab.key)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/50' : 'bg-slate-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
              <span className="text-sm text-blue-700 font-medium">
                {t('dashboards.admin.selectedCount', { count: selectedItems.size })}
              </span>
              <div className="flex gap-2 ms-auto">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  {t('dashboards.admin.approveSelected')}
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle size={16} />
                  {t('dashboards.admin.rejectSelected')}
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {renderTableHeader()}
              </thead>
              <tbody className="text-sm">
                {currentRequests.length > 0 ? (
                  currentRequests.map(renderTableRow)
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {t('dashboards.admin.noPendingRequests')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
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

      {/* Approval Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequest(null);
        }}
        title={t('dashboards.admin.requestDetails')}
        size="md"
      >
        <div className="p-6">
          {renderModalContent()}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {t('dashboards.admin.approve')}
            </button>
            <button
              onClick={() => selectedRequest && handleReject(selectedRequest.id)}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              {t('dashboards.admin.reject')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}