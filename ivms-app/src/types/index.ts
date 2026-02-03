import type { LucideIcon } from 'lucide-react';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive';
  driver: string;
  fuel: number;
  mileage: number;
  location: string;
}

export interface MaintenanceRequest {
  id: string;
  vehicle: string;
  type: 'corrective' | 'preventive';
  description: string;
  status: 'in_progress' | 'pending_approval' | 'completed' | 'scheduled';
  priority: 'high' | 'medium' | 'low';
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

export type ViewType = 'dashboard' | 'vehicles' | 'maintenance' | 'inventory' | 'reports' | 'settings' | 'users';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export type CarType = 'sedan' | 'suv' | 'truck';

export type CarRequestStatus =
  | 'pending'
  | 'assigned'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'returned'
  | 'cancelled';

export interface CarRequest {
  id: string;
  requestedCarType: CarType;
  requestedCarId: string | null;
  isRental: boolean;
  rentalCompanyId: string | null;
  rentalCompanyName: string | null;
  departureLocation: string;
  destination: string;
  departureDatetime: string;
  returnDatetime: string;
  description: string | null;
  status: CarRequestStatus;
  images: string[];
  assignedCarPlate: string | null;
  cancelledBy: string | null;
  assignedBy: string | null;
  approvedBy: string | null;
  returnConditionNotes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalCompany {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
