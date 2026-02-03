import { useState, useMemo } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard, Badge, Dropdown, ConfirmDialog, Modal } from '../components/ui';
import { MaintenanceModal } from '../components/modals/MaintenanceModal';
import { useApp } from '../contexts/AppContext';
import type { MaintenanceRequest } from '../types';

const ITEMS_PER_PAGE = 5;

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'مكتمل':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'قيد التنفيذ':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'بانتظار الموافقة':
      return 'bg-blue-50 text-blue-600 border-blue-100';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export function Maintenance() {
  const { t } = useTranslation();
  const { maintenance, vehicles, addMaintenance, updateMaintenance, deleteMaintenance } = useApp();
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
    const inProgress = maintenance.filter(m => m.status === 'قيد التنفيذ').length;
    const completed = maintenance.filter(m => m.status === 'مكتمل').length;
    const highPriority = maintenance.filter(m => m.priority === 'عالية' && m.status !== 'مكتمل').length;
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

  const getDropdownItems = (item: MaintenanceRequest) => [
    {
      label: t('pages.maintenance.viewDetails'),
      icon: <Eye size={16} />,
      onClick: () => setViewingMaintenance(item),
    },
    {
      label: t('pages.maintenance.edit'),
      icon: <Pencil size={16} />,
      onClick: () => setEditingMaintenance(item),
    },
    {
      label: t('pages.maintenance.delete'),
      icon: <Trash2 size={16} />,
      onClick: () => setDeletingMaintenance(item),
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.maintenance.title')}
          </h1>
          <p className="text-slate-500 text-sm">{t('pages.maintenance.description')} ({t('pages.maintenance.requestCount', { count: maintenance.length })})</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Calendar size={18} /> {t('pages.maintenance.scheduleNew')}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fleet Readiness Card */}
        <GlassCard className="p-6 bg-emerald-900 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-emerald-300 text-xs font-bold mb-1 uppercase tracking-wider">
                {t('pages.maintenance.fleetReadiness')}
              </p>
              <h3 className="text-3xl font-black">{stats.readiness}%</h3>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Wrench size={24} />
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${stats.readiness}%` }}></div>
          </div>
        </GlassCard>

        {/* In Progress Tasks */}
        <GlassCard className="p-6">
          <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
            {t('pages.maintenance.tasksInProgress')}
          </p>
          <h3 className="text-3xl font-black text-slate-800">{stats.inProgress}</h3>
          <p className="text-amber-500 text-xs mt-2 font-bold flex items-center gap-1">
            <Clock size={14} /> {stats.highPriority} {t('pages.maintenance.urgentTasks')}
          </p>
        </GlassCard>

        {/* Completed */}
        <GlassCard className="p-6">
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
      <GlassCard>
        {/* Table Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <h4 className="font-bold text-slate-800">{t('pages.maintenance.maintenanceLog')}</h4>
          <div className="relative w-full md:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('pages.maintenance.searchByOrder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all w-full md:w-64"
            />
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
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedMaintenance.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-emerald-600 text-sm">{task.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{getVehicleName(task.vehicle)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-medium">
                        {task.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge type={task.priority === 'عالية' ? 'danger' : task.priority === 'متوسطة' ? 'warning' : 'info'}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{task.createdAt}</td>
                    <td className="px-6 py-4 text-left">
                      <Dropdown
                        trigger={<MoreVertical size={18} />}
                        items={getDropdownItems(task)}
                      />
                    </td>
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
              <div key={task.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-emerald-600 font-bold text-sm">{task.id}</span>
                    <p className="text-sm font-bold text-slate-800 mt-1">{getVehicleName(task.vehicle)}</p>
                  </div>
                  <Dropdown
                    trigger={<MoreVertical size={18} />}
                    items={getDropdownItems(task)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-medium">
                    {task.type}
                  </span>
                  <Badge type={task.priority === 'عالية' ? 'danger' : task.priority === 'متوسطة' ? 'warning' : 'info'}>
                    {task.priority}
                  </Badge>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{task.createdAt}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table Footer with Pagination */}
        {filteredMaintenance.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-400">
              {t('pages.maintenance.showing')} {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMaintenance.length)} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredMaintenance.length)} {t('pages.maintenance.of')} {filteredMaintenance.length} {t('pages.maintenance.records')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:border-emerald-200 hover:text-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pages.maintenance.previous')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    currentPage === page
                      ? 'text-white bg-emerald-600'
                      : 'text-slate-500 bg-white border border-slate-200 hover:border-emerald-200 hover:text-emerald-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pages.maintenance.next')}
              </button>
            </div>
          </div>
        )}
      </GlassCard>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.maintenanceType')}</p>
                <p className="text-sm font-medium text-slate-700">{viewingMaintenance.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.priority')}</p>
                <Badge type={viewingMaintenance.priority === 'عالية' ? 'danger' : viewingMaintenance.priority === 'متوسطة' ? 'warning' : 'info'}>
                  {viewingMaintenance.priority}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.maintenance.status')}</p>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusStyle(viewingMaintenance.status)}`}>
                  {viewingMaintenance.status}
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
                onClick={() => setViewingMaintenance(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                {t('common.close')}
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
