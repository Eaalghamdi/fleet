import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, Fuel, AlertTriangle, Play } from 'lucide-react';
import type { Driver, ActiveTrip, ScheduledTask, RecentActivity } from '../types';
import {
  currentDriver as initialDriver,
  activeTrip as initialActiveTrip,
  scheduledTasks as initialTasks,
  recentActivities as initialActivities,
  tripHistory as initialTripHistory,
} from '../data';

interface TripHistoryItem {
  id: string;
  destination: string;
  date: string;
  status: string;
  distance: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface DriverContextType {
  // Driver
  driver: Driver;
  updateDriver: (updates: Partial<Driver>) => void;

  // Active Trip
  activeTrip: ActiveTrip | null;
  endTrip: () => void;
  startTrip: (taskId: string) => void;

  // Tasks
  tasks: ScheduledTask[];
  completeTask: (taskId: string) => void;

  // Activities
  activities: RecentActivity[];
  addActivity: (activity: Omit<RecentActivity, 'id'>) => void;

  // Trip History
  tripHistory: TripHistoryItem[];

  // Stats
  stats: {
    totalTrips: number;
    totalDistance: number;
    rating: number;
    compliance: number;
    completedToday: number;
    inProgressToday: number;
  };

  // Toast
  toasts: Toast[];
  showToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;

  // Modals
  fuelReports: Array<{ id: string; amount: number; station: string; date: string }>;
  addFuelReport: (amount: number, station: string) => void;

  issueReports: Array<{ id: string; type: string; description: string; date: string; status: string }>;
  addIssueReport: (type: string, description: string) => void;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function DriverProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver>(initialDriver);
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(initialActiveTrip);
  const [tasks, setTasks] = useState<ScheduledTask[]>(initialTasks);
  const [activities, setActivities] = useState<RecentActivity[]>(initialActivities);
  const [tripHistory, setTripHistory] = useState<TripHistoryItem[]>(initialTripHistory);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fuelReports, setFuelReports] = useState<Array<{ id: string; amount: number; station: string; date: string }>>([]);
  const [issueReports, setIssueReports] = useState<Array<{ id: string; type: string; description: string; date: string; status: string }>>([]);

  // Stats calculation
  const stats = {
    totalTrips: tripHistory.length + (activeTrip ? 1 : 0),
    totalDistance: 4520,
    rating: 4.8,
    compliance: 98,
    completedToday: 0,
    inProgressToday: activeTrip ? 1 : 0,
  };

  // Toast operations
  const showToast = useCallback((message: string, type: Toast['type']) => {
    const toast: Toast = { id: generateId('TOAST'), message, type };
    setToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Driver operations
  const updateDriver = useCallback((updates: Partial<Driver>) => {
    setDriver(prev => ({ ...prev, ...updates }));
    showToast('تم تحديث البيانات بنجاح', 'success');
  }, [showToast]);

  // Trip operations
  const endTrip = useCallback(() => {
    if (activeTrip) {
      // Add to history
      setTripHistory(prev => [{
        id: activeTrip.id,
        destination: activeTrip.destination,
        date: 'الآن',
        status: 'completed',
        distance: '-- كم',
      }, ...prev]);

      // Add activity
      const newActivity: RecentActivity = {
        id: generateId('ACT'),
        icon: CheckCircle2,
        title: `اكتملت الرحلة #${activeTrip.id}`,
        description: 'تم التوصيل بنجاح',
        time: 'الآن',
        color: 'emerald',
      };
      setActivities(prev => [newActivity, ...prev]);

      // Clear active trip
      setActiveTrip(null);
      showToast('تم إنهاء الرحلة بنجاح', 'success');
    }
  }, [activeTrip, showToast]);

  const startTrip = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !activeTrip) {
      // Create new active trip from task
      const newTrip: ActiveTrip = {
        id: generateId('TRP'),
        vehicle: task.vehicle,
        vehiclePlate: 'أ ب ج 1234',
        destination: task.title,
        startTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        status: 'active',
        estimatedArrival: '--:--',
      };
      setActiveTrip(newTrip);

      // Remove task from scheduled
      setTasks(prev => prev.filter(t => t.id !== taskId));

      // Add activity
      const newActivity: RecentActivity = {
        id: generateId('ACT'),
        icon: Play,
        title: `بدء مهمة: ${task.title}`,
        description: task.vehicle,
        time: 'الآن',
        color: 'emerald',
      };
      setActivities(prev => [newActivity, ...prev]);

      showToast('تم بدء المهمة', 'success');
    }
  }, [tasks, activeTrip, showToast]);

  // Task operations
  const completeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast('تم إكمال المهمة', 'success');
  }, [showToast]);

  // Activity operations
  const addActivity = useCallback((activity: Omit<RecentActivity, 'id'>) => {
    const newActivity: RecentActivity = {
      ...activity,
      id: generateId('ACT'),
    };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  // Fuel report operations
  const addFuelReport = useCallback((amount: number, station: string) => {
    const report = {
      id: generateId('FUEL'),
      amount,
      station,
      date: new Date().toLocaleDateString('ar-SA'),
    };
    setFuelReports(prev => [report, ...prev]);

    // Add activity
    const newActivity: RecentActivity = {
      id: generateId('ACT'),
      icon: Fuel,
      title: `تعبئة وقود - ${amount} لتر`,
      description: station,
      time: 'الآن',
      color: 'blue',
    };
    setActivities(prev => [newActivity, ...prev]);

    showToast('تم تسجيل الوقود بنجاح', 'success');
  }, [showToast]);

  // Issue report operations
  const addIssueReport = useCallback((type: string, description: string) => {
    const report = {
      id: generateId('ISSUE'),
      type,
      description,
      date: new Date().toLocaleDateString('ar-SA'),
      status: 'pending',
    };
    setIssueReports(prev => [report, ...prev]);

    // Add activity
    const newActivity: RecentActivity = {
      id: generateId('ACT'),
      icon: AlertTriangle,
      title: `بلاغ عطل - ${type}`,
      description: description,
      time: 'الآن',
      color: 'red',
    };
    setActivities(prev => [newActivity, ...prev]);

    showToast('تم إرسال البلاغ بنجاح', 'success');
  }, [showToast]);

  const value: DriverContextType = {
    driver,
    updateDriver,
    activeTrip,
    endTrip,
    startTrip,
    tasks,
    completeTask,
    activities,
    addActivity,
    tripHistory,
    stats,
    toasts,
    showToast,
    removeToast,
    fuelReports,
    addFuelReport,
    issueReports,
    addIssueReport,
  };

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export function useDriver() {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
}
