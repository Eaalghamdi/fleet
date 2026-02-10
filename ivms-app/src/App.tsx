import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, AlertTriangle } from 'lucide-react';
import { Sidebar, Header } from './components/layout';
import { Dashboard, Vehicles, Maintenance, Inventory, Reports, Unauthorized, AdminDashboard, OperationDashboard, GarageDashboard, MaintenanceDashboard, Settings, UserManagement, Drivers, Alerts } from './pages';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ProtectedRoute, LoginPage } from './components/auth';
import { ToastContainer } from './components/ui';
import type { ViewType } from './types';
import { getVehicleExpiryAlerts, getDriverExpiryAlerts, countByStatus } from './utils/expiryUtils';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { direction } = useLanguage();
  const { vehicles, drivers } = useApp();

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when navigating
  const handleTabChange = (tab: ViewType) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const mobileAlertCount = useMemo(() => {
    const vehicleAlerts = getVehicleExpiryAlerts(vehicles);
    const driverAlerts = getDriverExpiryAlerts(drivers);
    const { total } = countByStatus([...vehicleAlerts, ...driverAlerts]);
    return total;
  }, [vehicles, drivers]);

  // Get department-specific dashboard
  const getDepartmentDashboard = () => {
    switch (user?.department) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'OPERATION':
        return <OperationDashboard />;
      case 'GARAGE':
        return <GarageDashboard />;
      case 'MAINTENANCE':
        return <MaintenanceDashboard />;
      default:
        return <Dashboard />;
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return getDepartmentDashboard();
      case 'vehicles':
        return <Vehicles />;
      case 'maintenance':
        return <Maintenance />;
      case 'inventory':
        return <Inventory />;
      case 'users':
        return <UserManagement />;
      case 'drivers':
        return <Drivers />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return getDepartmentDashboard();
    }
  };

  // Main view
  return (
    <div className="flex min-h-screen bg-slate-50" dir={direction}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} className="text-slate-700" />
        </button>
        <span className="text-lg font-black text-slate-800 tracking-tighter">IVMP</span>
        <div className="flex items-center gap-2">
          {/* Alert Icon */}
          <button
            onClick={() => handleTabChange('alerts')}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 relative"
          >
            <AlertTriangle size={16} />
            {mobileAlertCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-amber-500 border-2 border-white rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                {mobileAlertCount > 9 ? '9+' : mobileAlertCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onLogout={logout}
        userName={user?.fullName}
        userDepartment={user?.department}
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 pt-14 lg:pt-0 ${isSidebarOpen ? 'lg:rtl:mr-72 lg:ltr:ml-72' : 'lg:rtl:mr-20 lg:ltr:ml-20'}`}>
        {/* Header / Command Bar */}
        <Header onNavigateToAlerts={() => handleTabChange('alerts')} />

        {/* View Content */}
        <div className="px-3 sm:px-4 lg:px-10 pb-6 sm:pb-10">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function MainApp() {
  const { toasts, removeToast } = useApp();

  return (
    <>
      <AppContent />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
