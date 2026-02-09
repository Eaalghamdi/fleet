import type { Vehicle, Driver } from '../types';

export type ExpiryStatus = 'expired' | 'expiring_soon' | 'valid';

export interface ExpiryAlert {
  id: string;
  entityId: string;
  entityType: 'vehicle' | 'driver';
  entityLabel: string;
  field: string;
  expiryDate: string;
  daysRemaining: number;
  status: ExpiryStatus;
  alertType: 'critical' | 'warning';
}

export function getExpiryStatus(dateString: string): { status: ExpiryStatus; daysRemaining: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateString);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'expired', daysRemaining };
  }
  if (daysRemaining <= 30) {
    return { status: 'expiring_soon', daysRemaining };
  }
  return { status: 'valid', daysRemaining };
}

const vehicleFields = [
  { key: 'insuranceExpiryDate', field: 'insuranceExpiry' },
  { key: 'registrationExpiryDate', field: 'registrationExpiry' },
  { key: 'warrantyExpiryDate', field: 'warrantyExpiry' },
  { key: 'nextMaintenanceDate', field: 'nextMaintenance' },
] as const;

export function getVehicleExpiryAlerts(vehicles: Vehicle[]): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];

  for (const vehicle of vehicles) {
    const label = `${vehicle.brand} ${vehicle.model} (${vehicle.plate})`;

    for (const { key, field } of vehicleFields) {
      const dateValue = vehicle[key as keyof Vehicle] as string | undefined;
      if (!dateValue) continue;

      const { status, daysRemaining } = getExpiryStatus(dateValue);
      if (status === 'valid') continue;

      alerts.push({
        id: `${vehicle.id}-${field}`,
        entityId: vehicle.id,
        entityType: 'vehicle',
        entityLabel: label,
        field,
        expiryDate: dateValue,
        daysRemaining,
        status,
        alertType: status === 'expired' ? 'critical' : 'warning',
      });
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getDriverExpiryAlerts(drivers: Driver[]): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];

  for (const driver of drivers) {
    // Check license expiry
    if (driver.license?.expiryDate) {
      const { status, daysRemaining } = getExpiryStatus(driver.license.expiryDate);
      if (status !== 'valid') {
        alerts.push({
          id: `${driver.id}-license`,
          entityId: driver.id,
          entityType: 'driver',
          entityLabel: driver.name,
          field: 'licenseExpiry',
          expiryDate: driver.license.expiryDate,
          daysRemaining,
          status,
          alertType: status === 'expired' ? 'critical' : 'warning',
        });
      }
    }

    // Check permit expiry
    for (const permit of driver.permits || []) {
      if (!permit.expiryDate) continue;
      const { status, daysRemaining } = getExpiryStatus(permit.expiryDate);
      if (status === 'valid') continue;

      alerts.push({
        id: `${driver.id}-permit-${permit.id}`,
        entityId: driver.id,
        entityType: 'driver',
        entityLabel: driver.name,
        field: 'permitExpiry',
        expiryDate: permit.expiryDate,
        daysRemaining,
        status,
        alertType: status === 'expired' ? 'critical' : 'warning',
      });
    }
  }

  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function countByStatus(alerts: ExpiryAlert[]): { expired: number; expiringSoon: number; total: number } {
  const expired = alerts.filter(a => a.status === 'expired').length;
  const expiringSoon = alerts.filter(a => a.status === 'expiring_soon').length;
  return { expired, expiringSoon, total: alerts.length };
}
