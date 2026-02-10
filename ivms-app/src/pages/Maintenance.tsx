import { useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Pencil,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard, ConfirmDialog, Modal, Pagination } from '../components/ui';
import { MaintenanceModal } from '../components/modals/MaintenanceModal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Department } from '../api/types';
import type { MaintenanceRequest } from '../types';

const ITEMS_PER_PAGE = 10;

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'in_progress':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'pending_approval':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'scheduled':
      return 'bg-purple-50 text-purple-600 border-purple-100';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

const getStatusKey = (status: string) => {
  switch (status) {
    case 'completed': return 'statuses.completed';
    case 'in_progress': return 'statuses.inProgress';
    case 'pending_approval': return 'statuses.pendingApproval';
    case 'scheduled': return 'statuses.scheduled';
    default: return 'statuses.unknown';
  }
};

const getPriorityKey = (priority: string) => {
  switch (priority) {
    case 'high': return 'priorities.high';
    case 'medium': return 'priorities.medium';
    case 'low': return 'priorities.low';
    default: return 'priorities.unknown';
  }
};

const getTypeKey = (type: string) => {
  switch (type) {
    case 'corrective': return 'maintenanceTypes.corrective';
    case 'preventive': return 'maintenanceTypes.preventive';
    default: return 'maintenanceTypes.unknown';
  }
};

export function Maintenance() {
  const { t } = useTranslation();
  const { maintenance, vehicles, addMaintenance, updateMaintenance, deleteMaintenance } = useApp();
  const { hasDepartment } = useAuth();
  const isAdmin = hasDepartment(Department.ADMIN);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRequest | null>(null);
  const [viewingMaintenance, setViewingMaintenance] = useState<MaintenanceRequest | null>(null);
  const [deletingMaintenance, setDeletingMaintenance] = useState<MaintenanceRequest | null>(null);

  // Filter and paginate
  const filteredMaintenance = useMemo(() => {
    return maintenance.filter(
      (m) =>
        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.includes(searchTerm) ||
        m.vehicle.includes(searchTerm)
    );
  }, [maintenance, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredMaintenance.length / ITEMS_PER_PAGE));
  const paginatedMaintenance = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMaintenance.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMaintenance, currentPage]);

  // Stats
  const stats = useMemo(() => {
    const inProgress = maintenance.filter(m => m.status === 'in_progress').length;
    const completed = maintenance.filter(m => m.status === 'completed').length;
    const highPriority = maintenance.filter(m => m.priority === 'high' && m.status !== 'completed').length;
    const readiness = maintenance.length > 0
      ? ((maintenance.length - inProgress) / maintenance.length * 100).toFixed(1)
      : '100.0';
    return { inProgress, completed, highPriority, readiness };
  }, [maintenance]);

  // Get vehicle display name
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : vehicleId;
  };

  // Handlers
  const handleAdd = (data: Omit<MaintenanceRequest, 'id'>) => {
    addMaintenance(data);
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: Omit<MaintenanceRequest, 'id'>) => {
    if (editingMaintenance) {
      updateMaintenance(editingMaintenance.id, data);
      setEditingMaintenance(null);
    }
  };

  const handleDelete = () => {
    if (deletingMaintenance) {
      deleteMaintenance(deletingMaintenance.id);
      setDeletingMaintenance(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.maintenance.title')}
          </h1>
          <p className="text-slate-500 text-sm">{t('pages.maintenance.description')} ({t('pages.maintenance.requestCount', { count: maintenance.length })})</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Calendar size={18} /> {t('pages.maintenance.scheduleNew')}
          </button>
        )}
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {/* Fleet Readiness Card */}
        <GlassCard className="p-4 sm:p-6">
          <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
            {t('pages.maintenance.fleetReadiness')}
          </p>
          <h3 className="text-3xl font-black text-slate-800">{stats.readiness}%</h3>
        </GlassCard>

        {/* In Progress Tasks */}
        <GlassCard className="p-4 sm:p-6">
          <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
            {t('pages.maintenance.tasksInProgress')}
          </p>
          <h3 className="text-3xl font-black text-slate-800">{stats.inProgress}</h3>
          <p className="text-amber-500 text-xs mt-2 font-bold flex items-center gap-1">
            <Clock size={14} /> {stats.highPriority} {t('pages.maintenance.urgentTasks')}
          </p>
        </GlassCard>

        {/* Completed */}
        <GlassCard className="p-4 sm:p-6">
          <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
            {t('pages.maintenance.completed')}
          </p>
          <h3 className="text-3xl font-black text-slate-800">{stats.completed}</h3>
          <p className="text-emerald-600 text-xs mt-2 font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> {t('pages.maintenance.highEfficiency')}
          </p>
        </GlassCard>
      </div>

      {/* Maintenance Tasks Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h4 className="font-bold text-slate-800">{t('pages.maintenance.maintenanceLog')}</h4>
            <div className="relative flex-1 md:flex-none md:w-64">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder={t('pages.maintenance.searchByOrder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {paginatedMaintenance.length === 0 && (
          <div className="p-12 text-center">
            <Wrench size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">{t('pages.maintenance.noMaintenanceRequests')}</h3>
            <p className="text-sm text-slate-400 mb-4">
              {searchTerm ? t('pages.maintenance.noSearchResults') : t('pages.maintenance.startByCreating')}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
              >
                {t('pages.maintenance.scheduleMaintenance')}
              </button>
            )}
          </div>
        )}

        {/* Desktop Table */}
        {paginatedMaintenance.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-4">{t('pages.maintenance.orderNumber')}</th>
                  <th className="px-6 py-4">{t('pages.maintenance.vehicle')}</th>
                  <th className="px-6 py-4">{t('pages.maintenance.maintenanceType')}</th>
                  <th className="px-6 py-4">{t('pages.maintenance.priority')}</th>
                  <th className="px-6 py-4">{t('pages.maintenance.status')}</th>
                  <th className="px-6 py-4">{t('pages.maintenance.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedMaintenance.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setViewingMaintenance(task)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{task.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{getVehicleName(task.vehicle)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-medium">
                        {t(getTypeKey(task.type))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${
                        task.priority === 'high' ? 'text-rose-600' : task.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {t(getPriorityKey(task.priority))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                        {t(getStatusKey(task.status))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{task.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {paginatedMaintenance.length > 0 && (
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedMaintenance.map((task) => (
              <div
                key={task.id}
                onClick={() => setViewingMaintenance(task)}
                className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-emerald-600 font-bold text-sm">{task.id}</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">{getVehicleName(task.vehicle)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-medium">
                    {t(getTypeKey(task.type))}
                  </span>
                  <span className={`text-xs font-medium ${
                    task.priority === 'high' ? 'text-rose-600' : task.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'
                  }`}>
                    {t(getPriorityKey(task.priority))}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                    {t(getStatusKey(task.status))}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{task.createdAt}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table Footer with Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={filteredMaintenance.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* Add Modal */}
      <MaintenanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      {/* Edit Modal */}
      <MaintenanceModal
        isOpen={!!editingMaintenance}
        onClose={() => setEditingMaintenance(null)}
        maintenance={editingMaintenance || undefined}
        onSubmit={handleEdit}
      />

      {/* View Modal */}
      <Modal
        isOpen={!!viewingMaintenance}
        onClose={() => setViewingMaintenance(null)}
        title={t('pages.maintenance.maintenanceDetails')}
        size="md"
      >
        {viewingMaintenance && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Wrench size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewingMaintenance.id}</h3>
                <p className="text-sm text-slate-500">{getVehicleName(viewingMaintenance.vehicle)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.maintenanceType')}</p>
                <p className="text-sm font-medium text-slate-700">{t(getTypeKey(viewingMaintenance.type))}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.priority')}</p>
                <span className={`text-sm font-medium ${
                  viewingMaintenance.priority === 'high' ? 'text-rose-600' : viewingMaintenance.priority === 'medium' ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {t(getPriorityKey(viewingMaintenance.priority))}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.status')}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(viewingMaintenance.status)}`}>
                  {t(getStatusKey(viewingMaintenance.status))}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.date')}</p>
                <p className="text-sm font-medium text-slate-700">{viewingMaintenance.createdAt}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.description')}</p>
                <p className="text-sm font-medium text-slate-700">{viewingMaintenance.description}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setViewingMaintenance(null);
                  setEditingMaintenance(viewingMaintenance);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                {t('pages.maintenance.edit')}
              </button>
              <button
                onClick={() => {
                  setViewingMaintenance(null);
                  setDeletingMaintenance(viewingMaintenance);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMaintenance}
        onClose={() => setDeletingMaintenance(null)}
        onConfirm={handleDelete}
        title={t('pages.maintenance.deleteRequest')}
        message={t('pages.maintenance.deleteConfirmation', { id: deletingMaintenance?.id })}
        confirmText={t('pages.maintenance.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
