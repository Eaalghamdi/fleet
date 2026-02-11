import {
  LayoutDashboard,
  Car,
  Wrench,
  Package,
  FileText,
  Users,
} from 'lucide-react';
import type { TFunction } from 'i18next';
import type { NavItem } from '../types';

export function getNavItemsForDepartment(department: string | undefined, t: TFunction): NavItem[] {
  const baseItems: NavItem[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  ];

  switch (department) {
    case 'ADMIN':
      return [
        { id: 'dashboard', label: t('nav.adminDashboard'), icon: LayoutDashboard },
        { id: 'vehicles', label: t('nav.vehicleManagement'), icon: Car },
        { id: 'maintenance', label: t('nav.maintenanceManagement'), icon: Wrench },
        { id: 'inventory', label: t('nav.inventoryManagement'), icon: Package },
        { id: 'users', label: t('nav.userManagement'), icon: Users },
        { id: 'reports', label: t('nav.reports'), icon: FileText },
      ];
    case 'OPERATION':
      return [
        { id: 'dashboard', label: t('nav.operationDashboard'), icon: LayoutDashboard },
        { id: 'vehicles', label: t('nav.availableVehicles'), icon: Car },
        { id: 'drivers', label: t('nav.driverManagement'), icon: Users },
      ];
    case 'GARAGE':
      return [
        { id: 'dashboard', label: t('nav.garageDashboard'), icon: LayoutDashboard },
        { id: 'vehicles', label: t('nav.vehicleInventory'), icon: Car },
        { id: 'inventory', label: t('nav.spareParts'), icon: Package },
        { id: 'maintenance', label: t('nav.maintenanceRequests'), icon: Wrench },
      ];
    case 'MAINTENANCE':
      return [
        { id: 'dashboard', label: t('nav.maintenanceDashboard'), icon: LayoutDashboard },
        { id: 'maintenance', label: t('nav.maintenanceWork'), icon: Wrench },
        { id: 'inventory', label: t('nav.partsAndMaterials'), icon: Package },
      ];
    default:
      return baseItems;
  }
}

export function getDepartmentLabel(department: string | undefined, t: TFunction): string {
  switch (department) {
    case 'ADMIN': return t('departments.admin');
    case 'OPERATION': return t('departments.operation');
    case 'GARAGE': return t('departments.garage');
    case 'MAINTENANCE': return t('departments.maintenance');
    default: return t('departments.user');
  }
}
