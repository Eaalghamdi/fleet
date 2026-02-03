import type { LucideIcon } from 'lucide-react';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: 'نشط' | 'صيانة' | 'متوقف';
  driver: string;
  fuel: number;
  mileage: number;
  location: string;
}

export interface MaintenanceRequest {
  id: string;
  vehicle: string;
  type: 'تصحيحية' | 'وقائية';
  description: string;
  status: 'قيد التنفيذ' | 'بانتظار الموافقة' | 'مكتمل' | 'مجدول';
  priority: 'عالية' | 'متوسطة' | 'منخفضة';
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
}

export interface FuelDataPoint {
  month: string;
  value: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export type BadgeType = 'success' | 'danger' | 'warning' | 'info';

export type ViewType = 'dashboard' | 'vehicles' | 'maintenance' | 'inventory' | 'reports' | 'settings';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
