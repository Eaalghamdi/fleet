import { useState, useMemo, useEffect } from 'react';
import {
  Car,
  Plus,
  Clock,
  CheckCircle2,
  Send,
  MapPin,
  Calendar,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, GlassCard, Pagination } from '../../components/ui';

const ITEMS_PER_PAGE = 10;
import { useApp } from '../../contexts/AppContext';
import { carRequests as initialCarRequests } from '../../data';
import type { CarRequest, CarRequestStatus } from '../../types';
import { CarRequestForm } from '../../components/forms/CarRequestForm';
import { CarRequestModal } from '../../components/modals/CarRequestModal';

export function OperationDashboard() {
  const { t } = useTranslation();
  const { showToast } = useApp();

  // State management
  const [carRequests, setCarRequests] = useState<CarRequest[]>(initialCarRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'recent'>('all');
  const [requestsPage, setRequestsPage] = useState(1);

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CarRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<CarRequest | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const pending = carRequests.filter(r => r.status === 'pending').length;
    const assigned = carRequests.filter(r => r.status === 'assigned').length;
    const approved = carRequests.filter(r => r.status === 'approved').length;
    const inTransit = carRequests.filter(r => r.status === 'in_transit').length;
    const returned = carRequests.filter(r => r.status === 'returned').length;
    const completed = returned;
    return { pending, assigned, approved, inTransit, completed, total: carRequests.length };
  }, [carRequests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return carRequests.filter(req => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.departureLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || req.status === filterStatus;

      const requestDate = new Date(req.createdAt).toISOString().split('T')[0];
      const matchesDateFrom = !dateFrom || requestDate >= dateFrom;
      const matchesDateTo = !dateTo || requestDate <= dateTo;

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [carRequests, searchTerm, filterStatus, dateFrom, dateTo]);

  // Pending actions (requests that need attention from Operations)
  const pendingActions = useMemo(() => {
    return carRequests.filter(r => r.status === 'approved');
  }, [carRequests]);

  // Recent activity (completed, rejected, returned, cancelled)
  const recentActivity = useMemo(() => {
    return carRequests
      .filter(r => ['returned', 'rejected', 'cancelled'].includes(r.status))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [carRequests]);

  // Handlers
  const handleNewRequest = () => {
    setEditingRequest(null);
    setShowFormModal(true);
  };

  const handleEditRequest = (request: CarRequest) => {
    setEditingRequest(request);
    setShowDetailsModal(false);
    setShowFormModal(true);
  };

  const handleViewDetails = (request: CarRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleMarkInTransit = (id: string) => {
    setCarRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: 'in_transit' as CarRequestStatus, updatedAt: new Date().toISOString() }
        : r
    ));
    setShowDetailsModal(false);
    showToast(t('dashboards.operation.statusUpdated', { id }), 'success');
  };

  const handleCancelRequest = (id: string) => {
    setCarRequests(prev => prev.map(r =>
      r.id === id
        ? { ...r, status: 'cancelled' as CarRequestStatus, cancelledBy: 'Current User', updatedAt: new Date().toISOString() }
        : r
    ));
    setShowDetailsModal(false);
    setShowCancelConfirm(false);
    showToast(t('dashboards.operation.requestCancelled', { id }), 'warning');
  };

  const handleFormSubmit = (data: Omit<CarRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'cancelledBy' | 'assignedBy' | 'approvedBy' | 'returnConditionNotes' | 'assignedCarPlate' | 'isRental' | 'rentalCompanyId' | 'rentalCompanyName'>) => {
    if (editingRequest) {
      setCarRequests(prev => prev.map(r =>
        r.id === editingRequest.id
          ? { ...r, ...data, updatedAt: new Date().toISOString() }
          : r
      ));
      showToast(t('dashboards.operation.requestUpdated'), 'success');
    } else {
      const newRequest: CarRequest = {
        ...data,
        id: `CR-${String(carRequests.length + 1).padStart(3, '0')}`,
        status: 'pending',
        driverId: data.driverId,
        isRental: false,
        rentalCompanyId: null,
        rentalCompanyName: null,
        assignedCarPlate: null,
        cancelledBy: null,
        assignedBy: null,
        approvedBy: null,
        returnConditionNotes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCarRequests(prev => [newRequest, ...prev]);
      showToast(t('dashboards.operation.requestCreated'), 'success');
    }
    setShowFormModal(false);
    setEditingRequest(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setDateFrom('');
    setDateTo('');
  };

  // Pagination for requests
  const requestsTotalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const paginatedRequests = useMemo(() => {
    const start = (requestsPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRequests, requestsPage]);

  // Reset pages when filters change
  useEffect(() => {
    setRequestsPage(1);
  }, [searchTerm, filterStatus, dateFrom, dateTo]);

  const getStatusStyle = (status: CarRequestStatus) => {
    switch (status) {
      case 'pending': return 'text-amber-600';
      case 'assigned': return 'text-slate-600';
      case 'approved': return 'text-emerald-600';
      case 'rejected': return 'text-rose-600';
      case 'in_transit': return 'text-emerald-600';
      case 'returned': return 'text-emerald-600';
      case 'cancelled': return 'text-rose-600';
      default: return 'text-slate-600';
    }
  };

  const getStatusText = (status: CarRequestStatus) => {
    switch (status) {
      case 'pending': return t('carRequestStatuses.pending');
      case 'assigned': return t('carRequestStatuses.assigned');
      case 'approved': return t('carRequestStatuses.approved');
      case 'rejected': return t('carRequestStatuses.rejected');
      case 'in_transit': return t('carRequestStatuses.inTransit');
      case 'returned': return t('carRequestStatuses.returned');
      case 'cancelled': return t('carRequestStatuses.cancelled');
      default: return status;
    }
  };

  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString();
  };

  const displayedRequests = activeTab === 'pending'
    ? pendingActions
    : activeTab === 'recent'
      ? recentActivity
      : paginatedRequests;

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
          value={(stats.assigned + stats.approved).toString()}
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
            <div className="text-start rtl:text-right ltr:text-left">
              <p className="font-bold text-slate-800">{t('dashboards.operation.newCarRequest')}</p>
              <p className="text-xs text-slate-500">{t('dashboards.operation.createCarRequest')}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-100 transition-colors flex items-center gap-3"
          >
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <Send size={24} />
            </div>
            <div className="text-start rtl:text-right ltr:text-left flex-1">
              <p className="font-bold text-slate-800">{t('dashboards.operation.markDeparture')}</p>
              <p className="text-xs text-slate-500">{t('dashboards.operation.confirmTripStart')}</p>
            </div>
            {pendingActions.length > 0 && (
              <span className="bg-slate-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingActions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-colors flex items-center gap-3"
          >
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-start rtl:text-right ltr:text-left">
              <p className="font-bold text-slate-800">{t('dashboards.operation.requestLog')}</p>
              <p className="text-xs text-slate-500">{t('dashboards.operation.viewCompletedRequests')}</p>
            </div>
          </button>
        </div>

      {/* Car Requests Table */}
      <GlassCard>
        {/* Tab Navigation */}
        <div className="border-b border-slate-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('dashboards.operation.carRequests')}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('dashboards.operation.pendingActions')}
              {pendingActions.length > 0 && (
                <span className="bg-slate-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {pendingActions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('dashboards.operation.recentActivity')}
            </button>
          </div>
        </div>

        {/* Filters - Only show for "all" tab */}
        {activeTab === 'all' && (
          <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
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
                <option value="pending">{t('carRequestStatuses.pending')}</option>
                <option value="assigned">{t('carRequestStatuses.assigned')}</option>
                <option value="approved">{t('carRequestStatuses.approved')}</option>
                <option value="in_transit">{t('carRequestStatuses.inTransit')}</option>
                <option value="returned">{t('carRequestStatuses.returned')}</option>
                <option value="rejected">{t('carRequestStatuses.rejected')}</option>
                <option value="cancelled">{t('carRequestStatuses.cancelled')}</option>
              </select>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">{t('dashboards.operation.from')}:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">{t('dashboards.operation.to')}:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    min={dateFrom}
                    className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {(searchTerm || filterStatus !== 'all' || dateFrom || dateTo) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Filter size={14} />
                  {t('dashboards.operation.clearFilters')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full rtl:text-right ltr:text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4">{t('dashboards.operation.requestNumber')}</th>
                <th className="px-6 py-4">{t('common.description')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.destination')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.date')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.vehicle')}</th>
                <th className="px-6 py-4">{t('dashboards.operation.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedRequests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => handleViewDetails(req)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{req.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 max-w-xs truncate">
                    {req.description || t('dashboards.operation.noDescription')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <MapPin size={14} className="text-red-500 shrink-0" />
                      <span className="truncate max-w-[150px]">{req.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={14} />
                      {formatDate(req.departureDatetime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {req.assignedCarPlate || <span className="text-slate-400">{t('dashboards.operation.notAssigned')}</span>}
                  </td>
                  <td className="px-6 py-4"><span className={`text-xs font-medium ${getStatusStyle(req.status)}`}>{getStatusText(req.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {displayedRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => handleViewDetails(req)}
              className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-emerald-600 font-bold text-sm">{req.id}</span>
                  <p className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">
                    {req.description || t('dashboards.operation.noDescription')}
                  </p>
                </div>
                <span className={`text-xs font-medium ${getStatusStyle(req.status)}`}>{getStatusText(req.status)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} className="text-red-500" />
                  {req.destination}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  {formatDate(req.departureDatetime)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {req.assignedCarPlate || t('dashboards.operation.notAssigned')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {displayedRequests.length === 0 && (
          <div className="p-12 text-center">
            <Car size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">{t('dashboards.operation.noRequests')}</h3>
            <p className="text-sm text-slate-400">
              {searchTerm || filterStatus !== 'all' || dateFrom || dateTo
                ? t('dashboards.operation.noResults')
                : t('dashboards.operation.startByCreating')}
            </p>
          </div>
        )}

        {/* Requests Pagination - only show for 'all' tab */}
        {activeTab === 'all' && (
          <Pagination
            currentPage={requestsPage}
            totalPages={requestsTotalPages}
            onPageChange={setRequestsPage}
            totalItems={filteredRequests.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </GlassCard>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingRequest ? t('dashboards.operation.editRequest') : t('dashboards.operation.newCarRequest')}
              </h2>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  setEditingRequest(null);
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <CarRequestForm
              request={editingRequest || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowFormModal(false);
                setEditingRequest(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <CarRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
          onMarkInTransit={handleMarkInTransit}
          onCancel={() => {
            setShowCancelConfirm(true);
          }}
          onEdit={handleEditRequest}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t('dashboards.operation.confirmCancelTitle')}</h3>
            <p className="text-sm text-slate-600 mb-6">{t('dashboards.operation.confirmCancel')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                {t('common.no')}
              </button>
              <button
                onClick={() => handleCancelRequest(selectedRequest.id)}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
              >
                {t('common.yes')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
