import { CheckCircle2, Fuel, AlertTriangle, Wrench } from 'lucide-react';
import type { Driver, ActiveTrip, ScheduledTask, RecentActivity } from '../types';

export const currentDriver: Driver = {
  id: 'DRV-001',
  name: 'فهد',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahad',
  phone: '+966 50 123 4567',
  licenseExpiry: '2025-06-15',
};

export const activeTrip: ActiveTrip = {
  id: 'TRP-904',
  vehicle: 'تويوتا هايلكس',
  vehiclePlate: 'أ ب ج 1234',
  destination: 'المستودع المركزي - مخرج 18',
  startTime: '08:30 AM',
  status: 'active',
  estimatedArrival: '09:15 AM',
};

export const scheduledTasks: ScheduledTask[] = [
  { id: 'TSK-001', title: 'توصيل طرد للعميل', vehicle: 'تويوتا هايلكس', time: '10:00 AM', type: 'delivery' },
  { id: 'TSK-002', title: 'استلام بضاعة من المورد', vehicle: 'تويوتا هايلكس', time: '12:30 PM', type: 'pickup' },
  { id: 'TSK-003', title: 'فحص دوري للمركبة', vehicle: 'تويوتا هايلكس', time: '03:00 PM', type: 'inspection' },
];

export const recentActivities: RecentActivity[] = [
  {
    id: 'ACT-001',
    icon: CheckCircle2,
    title: 'اكتملت الرحلة #TRP-899',
    description: 'تم التوصيل بنجاح',
    time: 'أمس، 04:20 PM',
    color: 'emerald',
  },
  {
    id: 'ACT-002',
    icon: Fuel,
    title: 'تعبئة وقود - 45 لتر',
    description: 'محطة أرامكو - طريق الملك فهد',
    time: 'أمس، 09:00 AM',
    color: 'blue',
  },
  {
    id: 'ACT-003',
    icon: Wrench,
    title: 'صيانة دورية مكتملة',
    description: 'تغيير زيت وفلتر',
    time: 'قبل 3 أيام',
    color: 'amber',
  },
  {
    id: 'ACT-004',
    icon: AlertTriangle,
    title: 'بلاغ عطل - إطار مثقوب',
    description: 'تم الإصلاح',
    time: 'قبل أسبوع',
    color: 'red',
  },
];

export const tripHistory = [
  { id: 'TRP-899', destination: 'المستودع الشمالي', date: 'أمس', status: 'completed', distance: '45 كم' },
  { id: 'TRP-898', destination: 'فرع الرياض', date: 'قبل يومين', status: 'completed', distance: '32 كم' },
  { id: 'TRP-897', destination: 'مركز التوزيع', date: 'قبل 3 أيام', status: 'completed', distance: '28 كم' },
  { id: 'TRP-896', destination: 'المقر الرئيسي', date: 'قبل 4 أيام', status: 'completed', distance: '15 كم' },
];
