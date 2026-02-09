import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import type { Driver } from '../../types';

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (data: Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function DriverForm({ driver, onSubmit, onCancel }: DriverFormProps) {
  const { t } = useTranslation();
  const { vehicles } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    nationality: '',
    occupation: '',
    phone: '',
    licenseNumber: '',
    licenseType: '' as 'private' | 'public' | 'heavy' | 'motorcycle' | '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    assignedCarId: '' as string,
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
        nationalId: driver.nationalId,
        nationality: driver.nationality,
        occupation: driver.occupation,
        phone: driver.phone,
        licenseNumber: driver.license.number,
        licenseType: driver.license.type,
        licenseIssueDate: driver.license.issueDate,
        licenseExpiryDate: driver.license.expiryDate,
        assignedCarId: driver.assignedCarId || '',
      });
    }
  }, [driver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      nationalId: formData.nationalId,
      nationality: formData.nationality,
      occupation: formData.occupation,
      phone: formData.phone,
      license: {
        number: formData.licenseNumber,
        type: formData.licenseType as 'private' | 'public' | 'heavy' | 'motorcycle',
        issueDate: formData.licenseIssueDate,
        expiryDate: formData.licenseExpiryDate,
      },
      assignedCarId: formData.assignedCarId || null,
      permits: driver?.permits || [],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nationalities = [
    'saudi', 'egyptian', 'pakistani', 'indian', 'bangladeshi',
    'yemeni', 'sudanese', 'filipino', 'indonesian', 'other',
  ];

  const licenseTypes = ['private', 'public', 'heavy', 'motorcycle'];

  // Available vehicles: active vehicles not assigned to other drivers
  const availableVehicles = vehicles.filter(v => v.status === 'active');

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.driverName')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('pages.drivers.driverNamePlaceholder')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* National ID */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.nationalId')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nationalId"
            value={formData.nationalId}
            onChange={handleChange}
            placeholder={t('pages.drivers.nationalIdPlaceholder')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.nationality')} <span className="text-rose-500">*</span>
          </label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          >
            <option value="">{t('pages.drivers.selectNationality')}</option>
            {nationalities.map(nat => (
              <option key={nat} value={nat}>
                {t(`pages.drivers.nationalities.${nat}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.occupation')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            placeholder={t('pages.drivers.occupationPlaceholder')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.phone')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t('pages.drivers.phonePlaceholder')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* License Section Header */}
        <div className="md:col-span-2 pt-2">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            {t('pages.drivers.licenseInfo')}
          </h3>
        </div>

        {/* License Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.licenseNumber')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder={t('pages.drivers.licenseNumberPlaceholder')}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* License Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.licenseType')} <span className="text-rose-500">*</span>
          </label>
          <select
            name="licenseType"
            value={formData.licenseType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          >
            <option value="">{t('pages.drivers.selectLicenseType')}</option>
            {licenseTypes.map(lt => (
              <option key={lt} value={lt}>
                {t(`pages.drivers.licenseTypes.${lt}`)}
              </option>
            ))}
          </select>
        </div>

        {/* License Issue Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.licenseIssueDate')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="licenseIssueDate"
            value={formData.licenseIssueDate}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* License Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.licenseExpiryDate')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="licenseExpiryDate"
            value={formData.licenseExpiryDate}
            onChange={handleChange}
            min={formData.licenseIssueDate}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        {/* Assigned Car */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.drivers.assignedCar')}
          </label>
          <select
            name="assignedCarId"
            value={formData.assignedCarId}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          >
            <option value="">{t('pages.drivers.noCarAssigned')}</option>
            {availableVehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
        >
          {driver ? t('pages.drivers.updateDriver') : t('pages.drivers.registerDriver')}
        </button>
      </div>
    </form>
  );
}
