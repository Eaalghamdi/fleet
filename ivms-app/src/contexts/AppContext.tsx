import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { vehicleData, maintenanceRequests, inventoryData } from '../data';
import type { Vehicle, MaintenanceRequest, InventoryItem, Notification, Toast } from '../types';

interface AppContextType {
  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  // Maintenance
  maintenance: MaintenanceRequest[];
  addMaintenance: (request: Omit<MaintenanceRequest, 'id'>) => void;
  updateMaintenance: (id: string, request: Partial<MaintenanceRequest>) => void;
  deleteMaintenance: (id: string) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  orderInventoryItem: (id: string, quantity: number) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function AppProvider({ children }: { children: ReactNode }) {
  // Persistent state with localStorage
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('ivms-vehicles', vehicleData);
  const [maintenance, setMaintenance] = useLocalStorage<MaintenanceRequest[]>('ivms-maintenance', maintenanceRequests);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('ivms-inventory', inventoryData);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('ivms-notifications', []);

  // Toasts are transient, not persisted
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Vehicle operations
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = { ...vehicle, id: generateId('VH') };
    setVehicles(prev => [...prev, newVehicle]);
    showToast('تمت إضافة المركبة بنجاح', 'success');
  }, []);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    showToast('تم تحديث بيانات المركبة', 'success');
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    showToast('تم حذف المركبة', 'success');
  }, []);

  // Maintenance operations
  const addMaintenance = useCallback((request: Omit<MaintenanceRequest, 'id'>) => {
    const newRequest: MaintenanceRequest = { ...request, id: generateId('MR') };
    setMaintenance(prev => [...prev, newRequest]);
    showToast('تم إنشاء طلب الصيانة', 'success');
  }, []);

  const updateMaintenance = useCallback((id: string, updates: Partial<MaintenanceRequest>) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    showToast('تم تحديث طلب الصيانة', 'success');
  }, []);

  const deleteMaintenance = useCallback((id: string) => {
    setMaintenance(prev => prev.filter(m => m.id !== id));
    showToast('تم حذف طلب الصيانة', 'success');
  }, []);

  // Inventory operations
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...item, id: generateId('INV') };
    setInventory(prev => [...prev, newItem]);
    showToast('تمت إضافة الصنف بنجاح', 'success');
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    showToast('تم تحديث بيانات الصنف', 'success');
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast('تم حذف الصنف', 'success');
  }, []);

  const orderInventoryItem = useCallback((id: string, quantity: number) => {
    setInventory(prev => prev.map(i =>
      i.id === id ? { ...i, quantity: i.quantity + quantity } : i
    ));
    showToast(`تم طلب ${quantity} وحدة`, 'success');
    addNotification({
      title: 'طلب مخزون جديد',
      message: `تم طلب ${quantity} وحدة`,
      type: 'info',
    });
  }, []);

  // Notification operations
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId('NOT'),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toast operations
  const showToast = useCallback((message: string, type: Toast['type']) => {
    const toast: Toast = { id: generateId('TOAST'), message, type };
    setToasts(prev => [...prev, toast]);
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: AppContextType = {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    maintenance,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    orderInventoryItem,
    notifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    toasts,
    showToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
