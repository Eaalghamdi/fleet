import { useState, useMemo } from 'react';
import { Search, Plus, Car, Pencil, FileDown, Filter, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, Modal, Pagination } from '../components/ui';
import { VehicleModal } from '../components/modals/VehicleModal';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import type { Vehicle } from '../types';

export function Vehicles() {
  const { t } = useTranslation();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useApp();
  const { hasDepartment } = useAuth();

  // Operation users can only view vehicles, not add/edit/delete
  const canManageVehicles = !hasDepartment('OPERATION');
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  // Get unique models from vehicles
  const uniqueModels = useMemo(() => {
    const models = new Set(vehicles.map(v => v.model));
    return Array.from(models).sort();
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.plate.includes(searchTerm) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driver.includes(searchTerm);
      const matchesModel = modelFilter === 'all' || v.model === modelFilter;
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [vehicles, searchTerm, modelFilter, statusFilter]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const handleAdd = (data: Omit<Vehicle, 'id'>) => {
    addVehicle(data);
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: Omit<Vehicle, 'id'>) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, data);
      setEditingVehicle(null);
    }
  };

  const handleDelete = () => {
    if (deletingVehicle) {
      deleteVehicle(deletingVehicle.id);
      setDeletingVehicle(null);
    }
  };

  const handleExportExcel = () => {
    // Generate CSV content
    const headers = ['رقم المركبة', 'رقم اللوحة', 'الشركة', 'الموديل', 'السنة', 'السائق', 'الحالة', 'الوقود', 'المسافة', 'الموقع'];
    const rows = vehicles.map(v => [
      v.id,
      v.plate,
      v.brand,
      v.model,
      v.year.toString(),
      v.driver,
      v.status,
      v.fuel.toString() + '%',
      v.mileage.toString() + ' كم',
      v.location
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'vehicles.csv';
    link.click();
  };

  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'active':
        return t('vehicleStatuses.active');
      case 'maintenance':
        return t('vehicleStatuses.maintenance');
      default:
        return t('vehicleStatuses.inactive');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('pages.vehicles.title')}</h1>
          <p className="text-sm text-gray-500">{t('pages.vehicles.description')} ({t('pages.vehicles.vehicleCount', { count: vehicles.length })})</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search, Filters, and Actions */}
        <div className="p-4 sm:p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder={t('pages.vehicles.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="hidden sm:flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 items-center gap-2"
              >
                <FileDown size={16} />
                {t('pages.vehicles.exportExcel')}
              </button>
              {canManageVehicles && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
                >
                  <Plus size={18} /> {t('pages.vehicles.addVehicle')}
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter size={16} />
              <span>{t('common.filter')}:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Model Filter */}
              <select
                value={modelFilter}
                onChange={(e) => { setModelFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[140px]"
              >
                <option value="all">{t('pages.vehicles.allModels')}</option>
                {uniqueModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[140px]"
              >
                <option value="all">{t('pages.vehicles.allStatuses')}</option>
                <option value="active">{t('vehicleStatuses.active')}</option>
                <option value="maintenance">{t('vehicleStatuses.maintenance')}</option>
                <option value="inactive">{t('vehicleStatuses.inactive')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredVehicles.length === 0 && (
          <div className="p-12 text-center">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">{t('pages.vehicles.noVehicles')}</h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm ? t('pages.vehicles.noSearchResults') : t('pages.vehicles.startByAdding')}
            </p>
            {!searchTerm && canManageVehicles && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
              >
                {t('pages.vehicles.addVehicle')}
              </button>
            )}
          </div>
        )}

        {/* Desktop Table */}
        {filteredVehicles.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full rtl:text-right ltr:text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-4">{t('dashboards.garage.theVehicle')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.plate')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.year')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.mileage')}</th>
                  <th className="px-6 py-4">{t('dashboards.garage.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedVehicles.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => setViewingVehicle(v)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Car size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{v.brand} {v.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{v.plate}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.year}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.mileage.toLocaleString()} {t('common.kilometers')}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${
                        v.status === 'active' ? 'text-emerald-600' : v.status === 'maintenance' ? 'text-amber-600' : 'text-rose-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          v.status === 'active' ? 'bg-emerald-500' : v.status === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></span>
                        {getTranslatedStatus(v.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {filteredVehicles.length > 0 && (
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedVehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => setViewingVehicle(v)}
                className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <Car size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{v.brand} {v.model}</p>
                      <p className="text-xs text-slate-500">{v.plate}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    v.status === 'active' ? 'text-emerald-600' : v.status === 'maintenance' ? 'text-amber-600' : 'text-rose-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      v.status === 'active' ? 'bg-emerald-500' : v.status === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></span>
                    {getTranslatedStatus(v.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">{t('dashboards.garage.year')}</p>
                    <p className="text-slate-700 font-medium">{v.year}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">{t('dashboards.garage.mileage')}</p>
                    <p className="text-slate-700 font-medium">{v.mileage.toLocaleString()} {t('common.kilometers')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredVehicles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredVehicles.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Add Modal */}
      <VehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      {/* Edit Modal */}
      <VehicleModal
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        vehicle={editingVehicle || undefined}
        onSubmit={handleEdit}
      />

      {/* View Modal */}
      <Modal
        isOpen={!!viewingVehicle}
        onClose={() => setViewingVehicle(null)}
        title={t('pages.vehicles.vehicleDetails')}
        size="lg"
      >
        {viewingVehicle && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewingVehicle.brand} {viewingVehicle.model}</h3>
                <p className="text-sm text-slate-500">{viewingVehicle.plate} &middot; {viewingVehicle.year}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                viewingVehicle.status === 'active' ? 'bg-emerald-100 text-emerald-700' : viewingVehicle.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  viewingVehicle.status === 'active' ? 'bg-emerald-500' : viewingVehicle.status === 'maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
                {getTranslatedStatus(viewingVehicle.status)}
              </span>
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.driver')}</p>
                <p className="text-sm font-medium text-slate-800">{viewingVehicle.driver || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.garage.mileage')}</p>
                <p className="text-sm font-medium text-slate-800">{viewingVehicle.mileage.toLocaleString()} {t('common.kilometers')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.currentLocation')}</p>
                <p className="text-sm font-medium text-slate-800">{viewingVehicle.location || '-'}</p>
              </div>
              {viewingVehicle.vin && (
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.vin')}</p>
                  <p className="text-sm font-medium text-slate-800 font-mono">{viewingVehicle.vin}</p>
                </div>
              )}
            </div>

            {/* Insurance & Dates */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-600 mb-3">{t('forms.vehicle.steps.insuranceWarranty')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.insuranceIssueDate')}</p>
                  <p className="text-sm font-medium text-slate-800">{viewingVehicle.insuranceIssueDate ? new Date(viewingVehicle.insuranceIssueDate).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.insuranceExpiryDate')}</p>
                  <p className="text-sm font-medium text-slate-800">{viewingVehicle.insuranceExpiryDate ? new Date(viewingVehicle.insuranceExpiryDate).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.warrantyExpiryDate')}</p>
                  <p className="text-sm font-medium text-slate-800">{viewingVehicle.warrantyExpiryDate ? new Date(viewingVehicle.warrantyExpiryDate).toLocaleDateString() : '-'}</p>
                </div>
                {viewingVehicle.registrationExpiryDate && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.registrationExpiryDate')}</p>
                    <p className="text-sm font-medium text-slate-800">{new Date(viewingVehicle.registrationExpiryDate).toLocaleDateString()}</p>
                  </div>
                )}
                {viewingVehicle.nextMaintenanceDate && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('forms.vehicle.nextMaintenanceDate')}</p>
                    <p className="text-sm font-medium text-slate-800">{new Date(viewingVehicle.nextMaintenanceDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              {canManageVehicles && (
                <>
                  <button
                    onClick={() => {
                      setViewingVehicle(null);
                      setEditingVehicle(viewingVehicle);
                    }}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil size={16} />
                    {t('pages.vehicles.edit')}
                  </button>
                  <button
                    onClick={() => {
                      setViewingVehicle(null);
                      setDeletingVehicle(viewingVehicle);
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleDelete}
        title={t('pages.vehicles.deleteVehicle')}
        message={t('pages.vehicles.deleteConfirmation', { plate: deletingVehicle?.plate })}
        confirmText={t('pages.vehicles.deleteButton')}
        cancelText={t('pages.vehicles.cancelButton')}
        type="danger"
      />
    </div>
  );
}
