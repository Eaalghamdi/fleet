import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeftRight,
  ClipboardList,
  ShoppingCart,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Badge, GlassCard } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';

// Mock data for pending assignments (Car Request data model)
const mockPendingAssignments = [
  {
    id: 'CR-001',
    carType: 'SUV',
    departureLocation: 'الرياض - المقر الرئيسي',
    destination: 'جدة - فرع الغرب',
    departureDateTime: '2024-01-15 08:00',
    returnDateTime: '2024-01-15 18:00',
    createdBy: 'أحمد محمد'
  },
  {
    id: 'CR-002',
    carType: 'Sedan',
    departureLocation: 'الدمام - المستودع',
    destination: 'الرياض - العميل',
    departureDateTime: '2024-01-16 09:00',
    returnDateTime: '2024-01-16 16:00',
    createdBy: 'سعد العلي'
  },
];

// Mock data for pending returns (Cars currently In Transit awaiting return)
const mockPendingReturns = [
  {
    id: 'CR-010',
    vehiclePlate: 'أ ب ج ١٢٣٤',
    vehicleModel: 'Toyota Hilux',
    destination: 'جدة - فرع الغرب',
    returnDateTime: '2024-01-15 16:00',
    isLate: true
  },
  {
    id: 'CR-011',
    vehiclePlate: 'س ع د ٥٦٧٨',
    vehicleModel: 'Nissan Patrol',
    destination: 'الرياض - العميل',
    returnDateTime: '2024-01-15 18:00',
    isLate: false
  },
];

export function GarageDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { vehicles, inventory, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'assignments' | 'returns'>('assignments');

  const stats = useMemo(() => {
    const totalCars = vehicles.length;
    const availableCars = vehicles.filter(v => v.status === 'نشط').length;
    const pendingAssignments = mockPendingAssignments.length;
    const pendingReturns = mockPendingReturns.length;
    const lowStockParts = inventory.filter(i => i.quantity <= i.minStock).length;
    return { totalCars, availableCars, pendingAssignments, pendingReturns, lowStockParts };
  }, [vehicles, inventory]);

  const handleAssignCar = (requestId: string, carPlate: string) => {
    showToast(t('dashboards.garage.vehicleAssigned', { plate: carPlate, id: requestId }), 'success');
  };

  const handleConfirmReturn = (requestId: string) => {
    showToast(t('dashboards.garage.returnConfirmed', { id: requestId }), 'success');
  };

  const availableCarsForAssignment = vehicles.filter(v => v.status === 'نشط');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.garage.title')}</h1>
        <p className="text-slate-500 text-sm">{t('dashboards.garage.description')}</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/vehicles')}
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group text-start"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ClipboardList size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{t('dashboards.garage.vehicleInventory')}</h3>
              <p className="text-sm text-slate-500">{t('dashboards.garage.viewVehicleInventory')}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => {
            navigate('/inventory');
            showToast(t('dashboards.garage.openingSparePartsRequest'), 'info');
          }}
          className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all group text-start"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <ShoppingCart size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{t('dashboards.garage.sparePartsRequest')}</h3>
              <p className="text-sm text-slate-500">{t('dashboards.garage.requestSpareParts')}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'assignments', label: t('dashboards.garage.assignmentRequests2'), icon: Clock, count: stats.pendingAssignments },
          { id: 'returns', label: t('dashboards.garage.returns'), icon: ArrowLeftRight, count: stats.pendingReturns },
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

      {/* Pending Assignments Tab */}
      {activeTab === 'assignments' && (
        <GlassCard className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">{t('dashboards.garage.requestsAwaitingAssignment')}</h3>
          {mockPendingAssignments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle size={48} className="mx-auto mb-2 text-emerald-500" />
              <p>{t('dashboards.garage.noPendingRequests')}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full rtl:text-right ltr:text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                      <th className="px-4 py-3">{t('dashboards.garage.requestId')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.carType')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.departureLocation')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.destination')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.departureTime')}</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockPendingAssignments.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-emerald-600">{req.id}</td>
                        <td className="px-4 py-3">
                          <Badge type="info">{req.carType}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{req.departureLocation}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{req.destination}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{req.departureDateTime}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleAssignCar(req.id, availableCarsForAssignment[0]?.plate || '')}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                          >
                            <Car size={14} /> {t('dashboards.garage.assignVehicle')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {mockPendingAssignments.map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">{req.id}</span>
                        <Badge type="info">{req.carType}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('dashboards.garage.departureLocation')}:</span>
                        <span className="text-slate-700 font-medium">{req.departureLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('dashboards.garage.destination')}:</span>
                        <span className="text-slate-700 font-medium">{req.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('dashboards.garage.departureTime')}:</span>
                        <span className="text-slate-700 font-medium">{req.departureDateTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssignCar(req.id, availableCarsForAssignment[0]?.plate || '')}
                      className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Car size={16} /> {t('dashboards.garage.assignVehicle')}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
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
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full rtl:text-right ltr:text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                      <th className="px-4 py-3">{t('dashboards.garage.requestId')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.theVehicle')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.destination')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.expectedReturn')}</th>
                      <th className="px-4 py-3">{t('dashboards.garage.status')}</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {mockPendingReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-emerald-600">{ret.id}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{ret.vehiclePlate}</p>
                            <p className="text-xs text-slate-500">{ret.vehicleModel}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{ret.destination}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{ret.returnDateTime}</td>
                        <td className="px-4 py-3">
                          <Badge type={ret.isLate ? 'danger' : 'success'}>
                            {ret.isLate ? t('dashboards.garage.late') : t('dashboards.garage.onTime')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleConfirmReturn(ret.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle size={14} /> {t('dashboards.garage.confirmReturn')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {mockPendingReturns.map((ret) => (
                  <div key={ret.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">{ret.id}</span>
                        <Badge type={ret.isLate ? 'danger' : 'success'}>
                          {ret.isLate ? t('dashboards.garage.late') : t('dashboards.garage.onTime')}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('dashboards.garage.theVehicle')}:</span>
                        <span className="text-slate-700 font-medium">{ret.vehiclePlate} - {ret.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('dashboards.garage.destination')}:</span>
                        <span className="text-slate-700 font-medium">{ret.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('dashboards.garage.expectedReturn')}:</span>
                        <span className="text-slate-700 font-medium">{ret.returnDateTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleConfirmReturn(ret.id)}
                      className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> {t('dashboards.garage.confirmReturn')}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      )}
    </div>
  );
}
