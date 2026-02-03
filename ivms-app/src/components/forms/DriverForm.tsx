import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Driver } from '../../types';

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (data: Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function DriverForm({ driver, onSubmit, onCancel }: DriverFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    nationalId: '',
    nationality: '',
    occupation: '',
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
        nationalId: driver.nationalId,
        nationality: driver.nationality,
        occupation: driver.occupation,
      });
    }
  }, [driver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nationalities = [
    'saudi',
    'egyptian',
    'pakistani',
    'indian',
    'bangladeshi',
    'yemeni',
    'sudanese',
    'filipino',
    'indonesian',
    'other',
  ];

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
        <div className="md:col-span-2">
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
