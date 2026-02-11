import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { AlertCard } from '../ui';
import type { ExpiryAlert } from '../../utils/expiryUtils';
import { countByStatus } from '../../utils/expiryUtils';

type StatusFilter = 'all' | 'expired' | 'expiring_soon';
type EntityFilter = 'all' | 'vehicle' | 'driver';

interface ExpiryAlertsSectionProps {
  alerts: ExpiryAlert[];
  title?: string;
  maxVisible?: number;
}

const COLLAPSED_COUNT = 6;

export function ExpiryAlertsSection({ alerts, title }: ExpiryAlertsSectionProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all');
  const [expanded, setExpanded] = useState(false);

  const { expired, expiringSoon } = countByStatus(alerts);

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(a => a.status === statusFilter);
    }

    // Filter by entity type
    if (entityFilter !== 'all') {
      result = result.filter(a => a.entityType === entityFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.entityLabel.toLowerCase().includes(term) ||
        t(`expiryAlerts.fields.${a.field}`).toLowerCase().includes(term)
      );
    }

    return result;
  }, [alerts, statusFilter, entityFilter, searchTerm, t]);

  if (alerts.length === 0) return null;

  const visibleAlerts = expanded ? filteredAlerts : filteredAlerts.slice(0, COLLAPSED_COUNT);
  const hiddenCount = filteredAlerts.length - visibleAlerts.length;
  const hasFilters = searchTerm || statusFilter !== 'all' || entityFilter !== 'all';

  const getFieldLabel = (field: string): string => {
    return t(`expiryAlerts.fields.${field}`);
  };

  const getTimeLabel = (alert: ExpiryAlert): string => {
    if (alert.daysRemaining < 0) {
      return t('expiryAlerts.expiredDaysAgo', { days: Math.abs(alert.daysRemaining) });
    }
    if (alert.daysRemaining === 0) {
      return t('expiryAlerts.expiresToday');
    }
    return t('expiryAlerts.expiresInDays', { days: alert.daysRemaining });
  };

  const statusFilters: { key: StatusFilter; label: string; count: number; color: string }[] = [
    { key: 'all', label: t('common.all'), count: alerts.length, color: 'bg-slate-100 text-slate-700' },
    { key: 'expired', label: t('expiryAlerts.expired'), count: expired, color: 'bg-rose-100 text-rose-700' },
    { key: 'expiring_soon', label: t('expiryAlerts.expiringSoon'), count: expiringSoon, color: 'bg-amber-100 text-amber-700' },
  ];

  const entityFilters: { key: EntityFilter; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'vehicle', label: t('expiryAlerts.vehicle') },
    { key: 'driver', label: t('expiryAlerts.driver') },
  ];

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">
            {title || t('expiryAlerts.title')}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {expired > 0 && (
            <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
              {expired} {t('expiryAlerts.expired')}
            </span>
          )}
          {expiringSoon > 0 && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
              {expiringSoon} {t('expiryAlerts.expiringSoon')}
            </span>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute rtl:right-3 ltr:left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder={t('expiryAlerts.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setExpanded(false); }}
            className="w-full bg-white border border-slate-200 py-2 rtl:pr-9 rtl:pl-8 ltr:pl-9 ltr:pr-8 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute rtl:left-3 ltr:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setExpanded(false); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.key
                  ? f.key === 'all'
                    ? 'bg-slate-800 text-white'
                    : f.key === 'expired'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  : f.color + ' hover:opacity-80'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Entity filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {entityFilters.map(f => (
            <button
              key={f.key}
              onClick={() => { setEntityFilter(f.key); setExpanded(false); }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                entityFilter === f.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert cards grid */}
      {filteredAlerts.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
          <Shield size={16} />
          <span>{hasFilters ? t('expiryAlerts.noResults') : t('expiryAlerts.noAlerts')}</span>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${expanded && filteredAlerts.length > COLLAPSED_COUNT ? 'max-h-[480px] overflow-y-auto pr-1' : ''}`}>
            {visibleAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                type={alert.alertType === 'critical' ? 'critical' : 'warning'}
                message={`${alert.entityLabel} - ${getFieldLabel(alert.field)}`}
                time={getTimeLabel(alert)}
                value={alert.expiryDate}
                valueLabel={alert.entityType === 'vehicle' ? t('expiryAlerts.vehicle') : t('expiryAlerts.driver')}
              />
            ))}
          </div>

          {/* Show more / Show less toggle */}
          {filteredAlerts.length > COLLAPSED_COUNT && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors rounded-xl hover:bg-slate-50"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  {t('expiryAlerts.showLess')}
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  {t('expiryAlerts.showAll', { count: hiddenCount })}
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
