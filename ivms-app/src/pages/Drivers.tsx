import { useState, useMemo } from 'react';
import {
  Search, Plus, Users, Filter, FileDown, X,
  ChevronDown, ChevronUp, AlertTriangle, UserCheck, UserX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, Pagination, ConfirmDialog } from '../components/ui';
import { DriverDetailModal } from '../components/modals/DriverDetailModal';
import { DriverForm } from '../components/forms/DriverForm';
import { useApp } from '../contexts/AppContext';
import type { Driver } from '../types';

export function Drivers() {
  const { t } = useTranslation();
  const { drivers, vehicles, addDriver, updateDriver, deleteDriver } = useApp();

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carAssignmentFilter, setCarAssignmentFilter] = useState('all');
  const [licenseExpiryFrom, setLicenseExpiryFrom] = useState('');
  const [licenseExpiryTo, setLicenseExpiryTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewingDriver, setViewingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

  // Nationalities list for filter
  const nationalities = [
    'saudi', 'egyptian', 'pakistani', 'indian', 'bangladeshi',
    'yemeni', 'sudanese', 'filipino', 'indonesian', 'other',
  ];

  const licenseTypes = ['private', 'public', 'heavy', 'motorcycle'];

  // Stats
  const stats = useMemo(() => {
    const total = drivers.length;
    const active = drivers.filter(d => d.status === 'active').length;
    const inactive = drivers.filter(d => d.status === 'inactive').length;
    const now = new Date();
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringLicenses = drivers.filter(d => {
      const expiry = new Date(d.license.expiryDate);
      return expiry > now && expiry <= ninetyDays;
    }).length;
    return { total, active, inactive, expiringLicenses };
  }, [drivers]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = !searchTerm ||
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.nationalId.includes(searchTerm) ||
        d.phone.includes(searchTerm) ||
        d.license.number.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesNationality = nationalityFilter === 'all' || d.nationality === nationalityFilter;
      const matchesLicenseType = licenseTypeFilter === 'all' || d.license.type === licenseTypeFilter;
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

      const matchesCarAssignment =
        carAssignmentFilter === 'all' ||
        (carAssignmentFilter === 'assigned' && d.assignedCarId !== null) ||
        (carAssignmentFilter === 'unassigned' && d.assignedCarId === null);

      const matchesExpiryFrom = !licenseExpiryFrom || d.license.expiryDate >= licenseExpiryFrom;
      const matchesExpiryTo = !licenseExpiryTo || d.license.expiryDate <= licenseExpiryTo;

      return matchesSearch && matchesNationality && matchesLicenseType &&
        matchesStatus && matchesCarAssignment && matchesExpiryFrom && matchesExpiryTo;
    });
  }, [drivers, searchTerm, nationalityFilter, licenseTypeFilter, statusFilter, carAssignmentFilter, licenseExpiryFrom, licenseExpiryTo]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage, itemsPerPage]);

  const hasActiveFilters = nationalityFilter !== 'all' || licenseTypeFilter !== 'all' ||
    statusFilter !== 'all' || carAssignmentFilter !== 'all' || licenseExpiryFrom || licenseExpiryTo;

  const clearAllFilters = () => {
    setNationalityFilter('all');
    setLicenseTypeFilter('all');
    setStatusFilter('all');
    setCarAssignmentFilter('all');
    setLicenseExpiryFrom('');
    setLicenseExpiryTo('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Get vehicle plate by ID
  const getVehiclePlate = (carId: string | null) => {
    if (!carId) return null;
    const vehicle = vehicles.find(v => v.id === carId);
    return vehicle ? vehicle.plate : null;
  };

  // Handlers
  const handleAdd = (data: Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    addDriver({ ...data, status: 'active' });
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (editingDriver) {
      updateDriver(editingDriver.id, data);
      setEditingDriver(null);
    }
  };

  const handleDelete = () => {
    if (deletingDriver) {
      deleteDriver(deletingDriver.id);
      setDeletingDriver(null);
    }
  };

  const handleExportExcel = () => {
    const headers = [
      t('pages.drivers.driverName'),
      t('pages.drivers.nationalId'),
      t('pages.drivers.nationality'),
      t('pages.drivers.phone'),
      t('pages.drivers.licenseNumber'),
      t('pages.drivers.licenseType'),
      t('pages.drivers.licenseExpiryDate'),
      t('pages.drivers.assignedCar'),
      t('common.status'),
    ];
    const rows = drivers.map(d => [
      d.name,
      d.nationalId,
      t(`pages.drivers.nationalities.${d.nationality}`),
      d.phone,
      d.license.number,
      t(`pages.drivers.licenseTypes.${d.license.type}`),
      d.license.expiryDate,
      getVehiclePlate(d.assignedCarId) || t('pages.drivers.noCarAssigned'),
      d.status === 'active' ? t('common.active') : t('common.inactive'),
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'drivers.csv';
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('pages.drivers.title')}</h1>
          <p className="text-sm text-gray-500">{t('pages.drivers.description')} ({t('pages.drivers.driverCount', { count: drivers.length })})</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t('pages.drivers.totalDrivers')}
          value={stats.total.toString()}
          icon={Users}
          trend={t('pages.drivers.registered')}
          trendType="info"
        />
        <StatCard
          title={t('pages.drivers.activeDrivers')}
          value={stats.active.toString()}
          icon={UserCheck}
          trend={t('pages.drivers.currentlyActive')}
          trendType="success"
        />
        <StatCard
          title={t('pages.drivers.inactiveDrivers')}
          value={stats.inactive.toString()}
          icon={UserX}
          trend={t('pages.drivers.unassigned')}
          trendType="warning"
        />
        <StatCard
          title={t('pages.drivers.expiringLicenses')}
          value={stats.expiringLicenses.toString()}
          icon={AlertTriangle}
          trend={t('pages.drivers.within90Days')}
          trendType={stats.expiringLicenses > 0 ? 'warning' : 'success'}
        />
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
                placeholder={t('pages.drivers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`px-3 sm:px-4 py-2 border rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  showAdvancedSearch || hasActiveFilters
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter size={16} />
                <span className="hidden sm:inline">{t('pages.drivers.advancedSearch')}</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
                {showAdvancedSearch ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={handleExportExcel}
                className="hidden sm:flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 items-center gap-2"
              >
                <FileDown size={16} />
                {t('pages.vehicles.exportExcel')}
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
              >
                <Plus size={18} /> <span className="hidden sm:inline">{t('pages.drivers.registerDriver')}</span><span className="sm:hidden">{t('common.add')}</span>
              </button>
            </div>
          </div>

          {/* Advanced Search Panel */}
          {showAdvancedSearch && (
            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Nationality Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t('pages.drivers.filterByNationality')}
                  </label>
                  <select
                    value={nationalityFilter}
                    onChange={(e) => { setNationalityFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="all">{t('common.all')}</option>
                    {nationalities.map(n => (
                      <option key={n} value={n}>{t(`pages.drivers.nationalities.${n}`)}</option>
                    ))}
                  </select>
                </div>

                {/* License Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t('pages.drivers.filterByLicenseType')}
                  </label>
                  <select
                    value={licenseTypeFilter}
                    onChange={(e) => { setLicenseTypeFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="all">{t('common.all')}</option>
                    {licenseTypes.map(lt => (
                      <option key={lt} value={lt}>{t(`pages.drivers.licenseTypes.${lt}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t('pages.drivers.filterByStatus')}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="all">{t('common.all')}</option>
                    <option value="active">{t('common.active')}</option>
                    <option value="inactive">{t('common.inactive')}</option>
                  </select>
                </div>

                {/* Car Assignment Filter */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t('pages.drivers.filterByCarAssignment')}
                  </label>
                  <select
                    value={carAssignmentFilter}
                    onChange={(e) => { setCarAssignmentFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="all">{t('common.all')}</option>
                    <option value="assigned">{t('pages.drivers.assigned')}</option>
                    <option value="unassigned">{t('pages.drivers.unassigned')}</option>
                  </select>
                </div>

                {/* License Expiry Date Range */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t('pages.drivers.licenseExpiryFrom')}
                  </label>
                  <input
                    type="date"
                    value={licenseExpiryFrom}
                    onChange={(e) => { setLicenseExpiryFrom(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t('pages.drivers.licenseExpiryTo')}
                  </label>
                  <input
                    type="date"
                    value={licenseExpiryTo}
                    onChange={(e) => { setLicenseExpiryTo(e.target.value); setCurrentPage(1); }}
                    min={licenseExpiryFrom}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={14} />
                  {t('pages.drivers.clearAllFilters')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredDrivers.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">{t('pages.drivers.noDrivers')}</h3>
            <p className="text-sm text-gray-400 mb-4">
              {searchTerm || hasActiveFilters ? t('pages.drivers.noSearchResults') : t('pages.drivers.startByRegistering')}
            </p>
            {!searchTerm && !hasActiveFilters && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
              >
                {t('pages.drivers.registerDriver')}
              </button>
            )}
          </div>
        )}

        {/* Desktop Table */}
        {filteredDrivers.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full rtl:text-right ltr:text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                  <th className="px-6 py-4">{t('pages.drivers.driverName')}</th>
                  <th className="px-6 py-4">{t('pages.drivers.nationalId')}</th>
                  <th className="px-6 py-4">{t('pages.drivers.nationality')}</th>
                  <th className="px-6 py-4">{t('pages.drivers.licenseType')}</th>
                  <th className="px-6 py-4">{t('pages.drivers.assignedCar')}</th>
                  <th className="px-6 py-4">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    onClick={() => setViewingDriver(driver)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{driver.name}</p>
                          <p className="text-xs text-slate-400">{driver.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{driver.nationalId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {t(`pages.drivers.nationalities.${driver.nationality}`)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {t(`pages.drivers.licenseTypes.${driver.license.type}`)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getVehiclePlate(driver.assignedCarId) || (
                        <span className="text-slate-400">{t('pages.drivers.noCarAssigned')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${
                        driver.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          driver.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></span>
                        {driver.status === 'active' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Cards */}
        {filteredDrivers.length > 0 && (
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setViewingDriver(driver)}
                className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{driver.name}</p>
                      <p className="text-xs text-slate-500">{driver.phone}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    driver.status === 'active' ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      driver.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}></span>
                    {driver.status === 'active' ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">{t('pages.drivers.nationality')}</p>
                    <p className="text-slate-700 font-medium">
                      {t(`pages.drivers.nationalities.${driver.nationality}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">{t('pages.drivers.licenseType')}</p>
                    <p className="text-slate-700 font-medium">
                      {t(`pages.drivers.licenseTypes.${driver.license.type}`)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">{t('pages.drivers.assignedCar')}</p>
                    <p className="text-slate-700 font-medium">
                      {getVehiclePlate(driver.assignedCarId) || t('pages.drivers.noCarAssigned')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">{t('pages.drivers.nationalId')}</p>
                    <p className="text-slate-700 font-medium">{driver.nationalId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredDrivers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredDrivers.length}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">{t('pages.drivers.registerNewDriver')}</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <DriverForm
              onSubmit={handleAdd}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">{t('pages.drivers.editDriver')}</h2>
              <button
                onClick={() => setEditingDriver(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <DriverForm
              driver={editingDriver}
              onSubmit={handleEdit}
              onCancel={() => setEditingDriver(null)}
            />
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingDriver && (
        <DriverDetailModal
          driver={viewingDriver}
          onClose={() => setViewingDriver(null)}
          onEdit={(d) => { setViewingDriver(null); setEditingDriver(d); }}
          onDelete={(d) => { setViewingDriver(null); setDeletingDriver(d); }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingDriver}
        onClose={() => setDeletingDriver(null)}
        onConfirm={handleDelete}
        title={t('pages.drivers.deleteDriver')}
        message={t('pages.drivers.deleteConfirmation', { name: deletingDriver?.name })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
