import { useState, useMemo } from 'react';
import {
  Car,
  Package,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  ArrowLeftRight,
  Search,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard, Dropdown } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';

// Mock data for pending assignments
const mockPendingAssignments = [
  { id: 'CR-001', requester: 'أحمد محمد', purpose: 'توصيل بضائع', destination: 'الرياض', startDate: '2024-01-15', priority: 'عالية' },
  { id: 'CR-002', requester: 'سعد العلي', purpose: 'زيارة عميل', destination: 'جدة', startDate: '2024-01-16', priority: 'متوسطة' },
];

// Mock data for pending returns
const mockPendingReturns = [
  { id: 'CR-010', car: 'ABC 1234', driver: 'خالد عبدالله', expectedReturn: '2024-01-15 16:00', status: 'متأخر' },
  { id: 'CR-011', car: 'XYZ 5678', driver: 'محمد أحمد', expectedReturn: '2024-01-15 18:00', status: 'في الموعد' },
];

export function GarageDashboard() {
  const { t } = useTranslation();
  const { vehicles, inventory, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'inventory' | 'assignments' | 'returns' | 'parts'>('inventory');

  const stats = useMemo(() => {
    const totalCars = vehicles.length;
    const availableCars = vehicles.filter(v => v.status === 'نشط').length;
    const inMaintenance = vehicles.filter(v => v.status === 'صيانة').length;
    const pendingAssignments = mockPendingAssignments.length;
    const pendingReturns = mockPendingReturns.length;
    const lowStockParts = inventory.filter(i => i.quantity <= i.minStock).length;
    return { totalCars, availableCars, inMaintenance, pendingAssignments, pendingReturns, lowStockParts };
  }, [vehicles, inventory]);

  const handleAssignCar = (requestId: string, carPlate: string) => {
    showToast(t('dashboards.garage.vehicleAssigned', { plate: carPlate, id: requestId }), 'success');
  };

  const handleConfirmReturn = (requestId: string) => {
    showToast(t('dashboards.garage.returnConfirmed', { id: requestId }), 'success');
  };

  const handleAddCar = () => {
    showToast(t('dashboards.garage.openingAddVehicleForm'), 'info');
  };

  const handleRequestMaintenance = (carId: string) => {
    showToast(t('dashboards.garage.maintenanceRequestCreated', { id: carId }), 'info');
  };

  const availableCarsForAssignment = vehicles.filter(v => v.status === 'نشط');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.garage.title')}</h1>
          <p className="text-slate-500 text-sm">{t('dashboards.garage.description')}</p>
        </div>
        <button
          onClick={handleAddCar}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={18} /> {t('dashboards.garage.addVehicleRequest')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboards.garage.availableVehicles')}
          value={stats.availableCars.toString()}
          icon={Car}
          trend={t('dashboards.garage.outOf', { total: stats.totalCars })}
          trendType="success"
        />
        <StatCard
          title={t('dashboards.garage.assignmentRequests')}
          value={stats.pendingAssignments.toString()}
          icon={Clock}
          trend={t('dashboards.garage.awaitingAssignment')}
          trendType={stats.pendingAssignments > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title={t('dashboards.garage.awaitingReturn')}
          value={stats.pendingReturns.toString()}
          icon={ArrowLeftRight}
          trend={t('dashboards.garage.tracking')}
          trendType="info"
        />
        <StatCard
          title={t('dashboards.garage.lowStockParts')}
          value={stats.lowStockParts.toString()}
          icon={AlertTriangle}
          trend={stats.lowStockParts > 0 ? t('dashboards.garage.needsOrder') : t('dashboards.garage.goodStock')}
          trendType={stats.lowStockParts > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'inventory', label: t('dashboards.garage.vehicleInventory'), icon: Car },
          { id: 'assignments', label: t('dashboards.garage.assignmentRequests2'), icon: Clock, count: stats.pendingAssignments },
          { id: 'returns', label: t('dashboards.garage.returns'), icon: ArrowLeftRight, count: stats.pendingReturns },
          { id: 'parts', label: t('dashboards.garage.spareParts'), icon: Package, count: stats.lowStockParts },
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

      {/* Car Inventory Tab */}
      {activeTab === 'inventory' && (
        <GlassCard>
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">{t('dashboards.garage.vehicleInventory')}</h3>
            <div className="relative">
              <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t('dashboards.garage.search')}
                className="bg-white border border-slate-200 rounded-xl py-2 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-64"
              />
            </div>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full rtl:text-right ltr:text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-4">{t('dashboards.garage.theVehicle')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.currentDriver')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.fuel')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.mileage')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.status')}</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Car size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{v.plate}</p>
                          <p className="text-xs text-slate-500">{v.brand} {v.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.driver || t('dashboards.garage.notAssigned')}</td>
                    <td className="px-6 py-4">
                      <div className="w-20 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${v.fuel < 30 ? 'bg-red-500' : v.fuel < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${v.fuel}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600">{v.fuel}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.mileage.toLocaleString()} {t('common.kilometers')}</td>
                    <td className="px-6 py-4">
                      <Badge type={v.status === 'نشط' ? 'success' : v.status === 'صيانة' ? 'warning' : 'danger'}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Dropdown
                        trigger={<MoreVertical size={18} />}
                        items={[
                          { label: t('dashboards.garage.viewDetails'), icon: <Eye size={16} />, onClick: () => showToast(t('dashboards.garage.viewingDetails', { plate: v.plate }), 'info') },
                          { label: t('dashboards.garage.requestMaintenance'), icon: <Wrench size={16} />, onClick: () => handleRequestMaintenance(v.id) },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Pending Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.garage.requestsAwaitingAssignment')}</h3>
            {mockPendingAssignments.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={48} className="mx-auto mb-2 text-emerald-500" />
                <p>{t('dashboards.garage.noPendingRequests')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockPendingAssignments.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-600 font-bold">{req.id}</span>
                          <Badge type={req.priority === 'عالية' ? 'danger' : 'warning'}>{req.priority}</Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-800">{req.purpose}</p>
                        <p className="text-xs text-slate-500">{req.requester} • {req.destination} • {req.startDate}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <p className="text-xs text-slate-500 mb-2">{t('dashboards.garage.selectVehicleForAssignment')}</p>
                      <div className="flex flex-wrap gap-2">
                        {availableCarsForAssignment.slice(0, 3).map((car) => (
                          <button
                            key={car.id}
                            onClick={() => handleAssignCar(req.id, car.plate)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                          >
                            {car.plate}
                          </button>
                        ))}
                        <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
                          {t('dashboards.garage.viewAll')}
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

      {/* Pending Returns Tab */}
      {activeTab === 'returns' && (
        <GlassCard className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.garage.vehiclesAwaitingReturn')}</h3>
          {mockPendingReturns.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle size={48} className="mx-auto mb-2 text-emerald-500" />
              <p>{t('dashboards.garage.noVehiclesAwaitingReturn')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockPendingReturns.map((ret) => (
                <div key={ret.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                      <Car size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{ret.car}</span>
                        <Badge type={ret.status === 'متأخر' ? 'danger' : 'success'}>
                          {ret.status === 'متأخر' ? t('dashboards.garage.late') : t('dashboards.garage.onTime')}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{ret.driver} • {t('dashboards.garage.returnTime')} {ret.expectedReturn}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfirmReturn(ret.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> {t('dashboards.garage.confirmReturn')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Parts Tab */}
      {activeTab === 'parts' && (
        <GlassCard>
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">{t('dashboards.garage.partsInventory')}</h3>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2">
              <Plus size={16} /> {t('dashboards.garage.purchaseOrder')}
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    item.quantity <= item.minStock
                      ? 'bg-red-50 border-red-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.quantity <= item.minStock ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <div className="rtl:text-left ltr:text-right">
                    <p className={`text-lg font-bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.quantity}
                    </p>
                    <p className="text-[10px] text-slate-400">{t('dashboards.garage.minimum')} {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
