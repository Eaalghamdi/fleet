import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Car,
  User,
  Shield,
  ArrowLeft,
  Calendar,
  Clock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui';
import { useApp } from '../contexts/AppContext';
import {
  getVehicleExpiryAlerts,
  getDriverExpiryAlerts,
} from '../utils/expiryUtils';
import type { ExpiryAlert } from '../utils/expiryUtils';

type StatusFilter = 'all' | 'expired' | 'expiring_soon';
type EntityFilter = 'all' | 'vehicle' | 'driver';

export function Alerts() {
  const { t } = useTranslation();
  const { vehicles, drivers } = useApp();

  const allAlerts = useMemo(() => {
    const vehicleAlerts = getVehicleExpiryAlerts(vehicles);
    const driverAlerts = getDriverExpiryAlerts(drivers);
    return [...vehicleAlerts, ...driverAlerts].sort(
      (a, b) => a.daysRemaining - b.daysRemaining
    );
  }, [vehicles, drivers]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      const matchesStatus =
        statusFilter === 'all' || alert.status === statusFilter;
      const matchesEntity =
        entityFilter === 'all' || alert.entityType === entityFilter;
      return matchesStatus && matchesEntity;
    });
  }, [allAlerts, statusFilter, entityFilter]);

  const selectedAlert = useMemo(
    () => filteredAlerts.find((a) => a.id === selectedAlertId) || null,
    [filteredAlerts, selectedAlertId]
  );

  const relatedAlerts = useMemo(() => {
    if (!selectedAlert) return [];
    return allAlerts.filter(
      (a) =>
        a.entityId === selectedAlert.entityId && a.id !== selectedAlert.id
    );
  }, [allAlerts, selectedAlert]);

  const selectedVehicle = useMemo(() => {
    if (!selectedAlert || selectedAlert.entityType !== 'vehicle') return null;
    return vehicles.find((v) => v.id === selectedAlert.entityId) || null;
  }, [selectedAlert, vehicles]);

  const selectedDriver = useMemo(() => {
    if (!selectedAlert || selectedAlert.entityType !== 'driver') return null;
    return drivers.find((d) => d.id === selectedAlert.entityId) || null;
  }, [selectedAlert, drivers]);

  const handleSelectAlert = (alert: ExpiryAlert) => {
    setSelectedAlertId(alert.id);
    setMobileShowDetail(true);
  };

  const handleBackToList = () => {
    setMobileShowDetail(false);
  };

  const getDaysLabel = (days: number) => {
    if (days < 0)
      return t('pages.alerts.daysOverdue', { days: Math.abs(days) });
    if (days === 0) return t('pages.alerts.expiresToday');
    return t('pages.alerts.daysLeft', { days });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  // Alert list item
  const renderAlertItem = (alert: ExpiryAlert) => {
    const isSelected = selectedAlertId === alert.id;
    const isExpired = alert.status === 'expired';

    return (
      <button
        key={alert.id}
        onClick={() => handleSelectAlert(alert)}
        className={`w-full text-start p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
          isSelected
            ? 'bg-emerald-50/50 border-s-4 border-s-emerald-500'
            : 'border-s-4 border-s-transparent'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isExpired ? 'bg-rose-100' : 'bg-amber-100'
            }`}
          >
            <AlertTriangle
              size={16}
              className={isExpired ? 'text-rose-600' : 'text-amber-600'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {alert.entityLabel}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(`expiryAlerts.fields.${alert.field}`)}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
              isExpired
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {getDaysLabel(alert.daysRemaining)}
          </span>
        </div>
      </button>
    );
  };

  // Detail panel
  const renderDetailPanel = () => {
    if (!selectedAlert) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
          <Shield size={48} className="mb-4" />
          <p className="text-sm font-medium">{t('pages.alerts.selectAlert')}</p>
        </div>
      );
    }

    const isExpired = selectedAlert.status === 'expired';

    return (
      <div className="p-6 space-y-6">
        {/* Mobile back button */}
        <button
          onClick={handleBackToList}
          className="lg:hidden flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-2"
        >
          <ArrowLeft size={16} />
          {t('pages.alerts.backToList')}
        </button>

        {/* Entity info header */}
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl ${
              selectedAlert.entityType === 'vehicle'
                ? 'bg-blue-100'
                : 'bg-purple-100'
            }`}
          >
            {selectedAlert.entityType === 'vehicle' ? (
              <Car
                size={24}
                className="text-blue-600"
              />
            ) : (
              <User
                size={24}
                className="text-purple-600"
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {selectedAlert.entityLabel}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                selectedAlert.entityType === 'vehicle'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {selectedAlert.entityType === 'vehicle'
                ? t('pages.alerts.vehicleInfo')
                : t('pages.alerts.driverInfo')}
            </span>
          </div>
        </div>

        {/* Expiry details card */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-4">
            {t('pages.alerts.expiryInfo')}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                {t(`expiryAlerts.fields.${selectedAlert.field}`)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={14} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-800">
                  {t('pages.alerts.expiresOn', {
                    date: formatDate(selectedAlert.expiryDate),
                  })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">
                {t('common.status')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} className="text-slate-400" />
                <span
                  className={`text-sm font-bold ${
                    isExpired ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  {getDaysLabel(selectedAlert.daysRemaining)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                isExpired
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <AlertTriangle size={12} />
              {isExpired
                ? t('expiryAlerts.expired')
                : t('expiryAlerts.expiringSoon')}
            </span>
          </div>
        </GlassCard>

        {/* Entity metadata */}
        <GlassCard className="p-5">
          <h4 className="text-sm font-bold text-slate-700 mb-4">
            {selectedAlert.entityType === 'vehicle'
              ? t('pages.alerts.vehicleInfo')
              : t('pages.alerts.driverInfo')}
          </h4>
          {selectedAlert.entityType === 'vehicle' && selectedVehicle && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t('pages.alerts.plateNumber')}
                </span>
                <span className="font-medium text-slate-800">
                  {selectedVehicle.plate}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t('pages.alerts.brandModel')}
                </span>
                <span className="font-medium text-slate-800">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </span>
              </div>
            </div>
          )}
          {selectedAlert.entityType === 'driver' && selectedDriver && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t('pages.alerts.nationalId')}
                </span>
                <span className="font-medium text-slate-800">
                  {selectedDriver.nationalId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t('pages.alerts.phone')}
                </span>
                <span className="font-medium text-slate-800">
                  {selectedDriver.phone}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {t('pages.alerts.license')}
                </span>
                <span className="font-medium text-slate-800">
                  {selectedDriver.license?.number || '-'}
                </span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Related alerts */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">
            {t('pages.alerts.relatedAlerts')}
          </h4>
          {relatedAlerts.length === 0 ? (
            <p className="text-xs text-slate-400">
              {t('pages.alerts.noRelatedAlerts')}
            </p>
          ) : (
            <div className="space-y-2">
              {relatedAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => handleSelectAlert(alert)}
                  className="w-full text-start p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-3"
                >
                  <AlertTriangle
                    size={14}
                    className={
                      alert.status === 'expired'
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">
                      {t(`expiryAlerts.fields.${alert.field}`)}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      alert.status === 'expired'
                        ? 'text-rose-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {getDaysLabel(alert.daysRemaining)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          {t('pages.alerts.title')}
        </h1>
        <p className="text-slate-500 text-sm">
          {t('pages.alerts.description')}
        </p>
      </div>

      {/* Segmented controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status segmented control */}
        <div className="bg-slate-100 rounded-xl p-1 flex flex-1">
          {(
            [
              { key: 'all', label: t('common.all') },
              { key: 'expired', label: t('expiryAlerts.expired') },
              { key: 'expiring_soon', label: t('expiryAlerts.expiringSoon') },
            ] as const
          ).map((seg) => (
            <button
              key={seg.key}
              onClick={() => setStatusFilter(seg.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                statusFilter === seg.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>
        {/* Entity segmented control */}
        <div className="bg-slate-100 rounded-xl p-1 flex sm:w-64">
          {(
            [
              { key: 'all', label: t('common.all'), icon: null },
              { key: 'vehicle', label: t('expiryAlerts.vehicle'), icon: Car },
              { key: 'driver', label: t('expiryAlerts.driver'), icon: User },
            ] as const
          ).map((seg) => {
            const Icon = seg.icon;
            return (
              <button
                key={seg.key}
                onClick={() => setEntityFilter(seg.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  entityFilter === seg.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {Icon && <Icon size={13} />}
                {seg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inbox layout */}
      <GlassCard className="overflow-hidden">
        <div className="flex h-[calc(100vh-440px)] lg:h-[calc(100vh-380px)] min-h-[400px] lg:min-h-[500px]">
          {/* Alert list panel (left) */}
          <div
            className={`w-full lg:w-2/5 border-e border-slate-100 flex flex-col ${
              mobileShowDetail ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Alert list */}
            <div className="flex-1 overflow-y-auto">
              {filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                  <Shield size={40} className="mb-3" />
                  <p className="text-sm">{t('pages.alerts.noAlerts')}</p>
                </div>
              ) : (
                filteredAlerts.map(renderAlertItem)
              )}
            </div>
          </div>

          {/* Detail panel (right) */}
          <div
            className={`w-full lg:w-3/5 overflow-y-auto ${
              mobileShowDetail ? 'block' : 'hidden lg:block'
            }`}
          >
            {renderDetailPanel()}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
