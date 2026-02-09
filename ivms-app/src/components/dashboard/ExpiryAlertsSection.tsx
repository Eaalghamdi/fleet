import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield } from 'lucide-react';
import { AlertCard } from '../ui';
import type { ExpiryAlert } from '../../utils/expiryUtils';
import { countByStatus } from '../../utils/expiryUtils';

interface ExpiryAlertsSectionProps {
  alerts: ExpiryAlert[];
  title?: string;
  maxVisible?: number;
}

export function ExpiryAlertsSection({ alerts, title, maxVisible = 5 }: ExpiryAlertsSectionProps) {
  const { t } = useTranslation();

  if (alerts.length === 0) return null;

  const { expired, expiringSoon } = countByStatus(alerts);
  const visibleAlerts = alerts.slice(0, maxVisible);
  const hiddenCount = alerts.length - visibleAlerts.length;

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

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {hiddenCount > 0 && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-500">
          <Shield size={14} />
          <span>{t('expiryAlerts.moreAlerts', { count: hiddenCount })}</span>
        </div>
      )}
    </div>
  );
}
