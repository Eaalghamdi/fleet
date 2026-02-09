import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { MaintenanceRequest } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface MaintenanceFormProps {
  maintenance?: MaintenanceRequest;
  onSubmit: (data: Omit<MaintenanceRequest, 'id'>) => void;
  onCancel: () => void;
}

const typeOptions: MaintenanceRequest['type'][] = ['corrective', 'preventive'];
const statusOptions: MaintenanceRequest['status'][] = ['scheduled', 'pending_approval', 'in_progress', 'completed'];
const priorityOptions: MaintenanceRequest['priority'][] = ['high', 'medium', 'low'];

export function MaintenanceForm({ maintenance, onSubmit, onCancel }: MaintenanceFormProps) {
  const { t } = useTranslation();
  const { vehicles } = useApp();

  const [formData, setFormData] = useState({
    vehicle: '',
    type: 'preventive' as MaintenanceRequest['type'],
    description: '',
    status: 'scheduled' as MaintenanceRequest['status'],
    priority: 'medium' as MaintenanceRequest['priority'],
    createdAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (maintenance) {
      setFormData({
        vehicle: maintenance.vehicle,
        type: maintenance.type,
        description: maintenance.description,
        status: maintenance.status,
        priority: maintenance.priority,
        createdAt: maintenance.createdAt,
      });
    }
  }, [maintenance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.maintenance.vehicle')} <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={formData.vehicle}
            onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">{t('pages.maintenance.selectVehicle')}</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} - {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.maintenance.maintenanceType')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceRequest['type'] })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {t(`maintenanceTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.maintenance.priority')}
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenanceRequest['priority'] })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {t(`priorities.${priority}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.maintenance.status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceRequest['status'] })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status === 'in_progress' ? 'inProgress' : status === 'pending_approval' ? 'pendingApproval' : status}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.maintenance.date')}
          </label>
          <input
            type="date"
            value={formData.createdAt}
            onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('pages.maintenance.description')} <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            placeholder={t('pages.maintenance.descriptionPlaceholder')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30"
        >
          {maintenance ? t('common.save') : t('pages.maintenance.createRequest')}
        </button>
      </div>
    </form>
  );
}
