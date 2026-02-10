import { useState } from 'react';
import { X, User, CreditCard, Car, Shield, Plus, Pencil, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import type { Driver, DriverPermit } from '../../types';

interface DriverDetailModalProps {
  driver: Driver;
  onClose: () => void;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export function DriverDetailModal({ driver, onClose, onEdit, onDelete }: DriverDetailModalProps) {
  const { t } = useTranslation();
  const { vehicles, updateDriver } = useApp();
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [permitData, setPermitData] = useState({
    type: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  const assignedVehicle = driver.assignedCarId
    ? vehicles.find(v => v.id === driver.assignedCarId)
    : null;

  const isLicenseExpired = new Date(driver.license.expiryDate) < new Date();
  const isLicenseNearExpiry = !isLicenseExpired &&
    new Date(driver.license.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const handleAddPermit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPermit: DriverPermit = {
      id: `PRM-${Date.now()}`,
      type: permitData.type,
      issueDate: permitData.issueDate,
      expiryDate: permitData.expiryDate,
      status: new Date(permitData.expiryDate) > new Date() ? 'active' : 'expired',
      notes: permitData.notes || undefined,
    };
    updateDriver(driver.id, { permits: [...driver.permits, newPermit] });
    setShowPermitForm(false);
    setPermitData({ type: '', issueDate: '', expiryDate: '', notes: '' });
  };

  const getPermitStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50';
      case 'expired': return 'text-rose-600 bg-rose-50';
      case 'revoked': return 'text-amber-600 bg-amber-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const permitTypes = ['city_permit', 'highway_permit', 'hazmat', 'special_transport'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{t('pages.drivers.driverDetails')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Driver Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <User size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">{driver.name}</h3>
              <p className="text-sm text-slate-500">{driver.occupation}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1.5 text-xs font-medium ${
                  driver.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    driver.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></span>
                  {driver.status === 'active' ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <User size={16} />
              {t('pages.drivers.personalInfo')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.nationalId')}</p>
                <p className="text-sm font-medium text-slate-700">{driver.nationalId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.nationality')}</p>
                <p className="text-sm font-medium text-slate-700">
                  {t(`pages.drivers.nationalities.${driver.nationality}`)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.phone')}</p>
                <p className="text-sm font-medium text-slate-700">{driver.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.occupation')}</p>
                <p className="text-sm font-medium text-slate-700">{driver.occupation}</p>
              </div>
            </div>
          </div>

          {/* License Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <CreditCard size={16} />
              {t('pages.drivers.licenseInfo')}
            </h4>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.licenseNumber')}</p>
                <p className="text-sm font-medium text-slate-700">{driver.license.number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.licenseType')}</p>
                <p className="text-sm font-medium text-slate-700">
                  {t(`pages.drivers.licenseTypes.${driver.license.type}`)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.licenseIssueDate')}</p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(driver.license.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.drivers.licenseExpiryDate')}</p>
                <p className={`text-sm font-medium ${
                  isLicenseExpired ? 'text-rose-600' : isLicenseNearExpiry ? 'text-amber-600' : 'text-slate-700'
                }`}>
                  {new Date(driver.license.expiryDate).toLocaleDateString()}
                  {isLicenseExpired && (
                    <span className="text-xs ms-2 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full">
                      {t('common.expired')}
                    </span>
                  )}
                  {isLicenseNearExpiry && (
                    <span className="text-xs ms-2 px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">
                      {t('common.nearExpiry')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Car */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Car size={16} />
              {t('pages.drivers.assignedCar')}
            </h4>
            {assignedVehicle ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Car size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{assignedVehicle.plate}</p>
                  <p className="text-xs text-slate-500">{assignedVehicle.brand} {assignedVehicle.model} ({assignedVehicle.year})</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-xl">
                {t('pages.drivers.noCarAssigned')}
              </p>
            )}
          </div>

          {/* Permit History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Shield size={16} />
                {t('pages.drivers.permitHistory')}
              </h4>
              <button
                onClick={() => setShowPermitForm(!showPermitForm)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus size={14} />
                {t('pages.drivers.addPermit')}
              </button>
            </div>

            {/* Add Permit Form */}
            {showPermitForm && (
              <form onSubmit={handleAddPermit} className="p-4 bg-emerald-50 rounded-xl mb-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={permitData.type}
                    onChange={e => setPermitData(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  >
                    <option value="">{t('pages.drivers.selectPermitType')}</option>
                    {permitTypes.map(pt => (
                      <option key={pt} value={pt}>{t(`pages.drivers.permitTypes.${pt}`)}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t('common.notes')}
                    value={permitData.notes}
                    onChange={e => setPermitData(prev => ({ ...prev, notes: e.target.value }))}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <input
                    type="date"
                    value={permitData.issueDate}
                    onChange={e => setPermitData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                  <input
                    type="date"
                    value={permitData.expiryDate}
                    onChange={e => setPermitData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    min={permitData.issueDate}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPermitForm(false)}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    {t('pages.drivers.addPermit')}
                  </button>
                </div>
              </form>
            )}

            {/* Permit Timeline */}
            {driver.permits.length > 0 ? (
              <div className="space-y-3">
                {driver.permits.map((permit) => (
                  <div key={permit.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="mt-0.5">
                      <Clock size={16} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800">
                          {t(`pages.drivers.permitTypes.${permit.type}`)}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPermitStatusColor(permit.status)}`}>
                          {t(`pages.drivers.permitStatuses.${permit.status}`)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(permit.issueDate).toLocaleDateString()} — {new Date(permit.expiryDate).toLocaleDateString()}
                      </p>
                      {permit.notes && (
                        <p className="text-xs text-slate-400 mt-1">{permit.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 p-4 bg-slate-50 rounded-xl">
                {t('pages.drivers.noPermits')}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => { onClose(); onEdit(driver); }}
            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Pencil size={16} />
            {t('common.edit')}
          </button>
          <button
            onClick={() => { onClose(); onDelete(driver); }}
            className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
