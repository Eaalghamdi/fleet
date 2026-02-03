import type { LucideIcon } from 'lucide-react';

export interface Driver {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  licenseExpiry: string;
}

export interface ActiveTrip {
  id: string;
  vehicle: string;
  vehiclePlate: string;
  destination: string;
  startTime: string;
  status: 'active' | 'completed' | 'cancelled';
  estimatedArrival?: string;
}

export interface ScheduledTask {
  id: string;
  title: string;
  vehicle: string;
  time: string;
  type: 'delivery' | 'pickup' | 'inspection' | 'maintenance';
}

export interface RecentActivity {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
}

export interface QuickAction {
  id: string;
  icon: LucideIcon;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
  onClick?: () => void;
}

export type DriverViewType = 'home' | 'tasks' | 'history' | 'profile';

export interface BottomNavItem {
  id: DriverViewType;
  icon: LucideIcon;
  label: string;
}
