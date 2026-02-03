import { Smartphone, Map, History, User, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DriverViewType } from '../../types';

interface BottomNavProps {
  activeView: DriverViewType;
  onViewChange: (view: DriverViewType) => void;
  onScanQR?: () => void;
}

export function BottomNav({ activeView, onViewChange, onScanQR }: BottomNavProps) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home' as DriverViewType, icon: Smartphone, label: t('driver.nav.home') },
    { id: 'tasks' as DriverViewType, icon: Map, label: t('driver.nav.tasks') },
    { id: 'history' as DriverViewType, icon: History, label: t('driver.nav.history') },
    { id: 'profile' as DriverViewType, icon: User, label: t('driver.nav.myAccount') },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 safe-area-inset-bottom">
      {navItems.slice(0, 2).map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
            activeView === item.id ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}

      {/* Center QR Button */}
      <div className="relative -top-6">
        <button
          onClick={onScanQR}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-500/40 flex items-center justify-center border-4 border-white hover:bg-emerald-700 transition-colors active:scale-95"
        >
          <QrCode size={24} />
        </button>
      </div>

      {navItems.slice(2).map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
            activeView === item.id ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
