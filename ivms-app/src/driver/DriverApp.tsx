import { useState } from 'react';
import { BottomNav } from './components/layout';
import { Home, Tasks, History, Profile } from './pages';
import { DriverProvider, useDriver } from './contexts/DriverContext';
import { QRScannerModal } from './components/modals';
import type { DriverViewType } from './types';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

// Toast Container for Driver App
function DriverToastContainer() {
  const { toasts, removeToast } = useDriver();

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: 'bg-emerald-600', icon: CheckCircle };
      case 'error':
        return { bg: 'bg-rose-600', icon: AlertTriangle };
      case 'warning':
        return { bg: 'bg-amber-500', icon: AlertTriangle };
      default:
        return { bg: 'bg-blue-600', icon: Info };
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => {
        const styles = getToastStyles(toast.type);
        const Icon = styles.icon;
        return (
          <div
            key={toast.id}
            className={`${styles.bg} text-white p-4 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto animate-in slide-in-from-top-2 duration-300`}
          >
            <Icon size={20} />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function DriverAppContent() {
  const [activeView, setActiveView] = useState<DriverViewType>('home');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { showToast } = useDriver();

  const handleScanQR = () => {
    setIsQRModalOpen(true);
  };

  const handleQRScanned = (code: string) => {
    showToast(`تم مسح الرمز: ${code}`, 'success');
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home />;
      case 'tasks':
        return <Tasks />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Container */}
      <DriverToastContainer />

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeView={activeView} onViewChange={setActiveView} onScanQR={handleScanQR} />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScan={handleQRScanned}
      />
    </div>
  );
}

export function DriverApp() {
  return (
    <DriverProvider>
      <DriverAppContent />
    </DriverProvider>
  );
}
