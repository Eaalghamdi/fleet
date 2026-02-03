import { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Search, Monitor, Smartphone, X, Car, Wrench, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../contexts/AppContext';
import { NotificationsPanel } from './NotificationsPanel';
import { LanguageSwitcher } from '../ui';

type UserRole = 'admin' | 'driver';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

interface SearchResult {
  type: 'vehicle' | 'maintenance' | 'inventory';
  title: string;
  subtitle: string;
  id: string;
}

export function Header({ userRole, setUserRole }: HeaderProps) {
  const { vehicles, maintenance, inventory, notifications } = useApp();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Global search across all data
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Search vehicles
    vehicles.forEach(v => {
      if (
        v.plate.toLowerCase().includes(term) ||
        v.brand.toLowerCase().includes(term) ||
        v.model.toLowerCase().includes(term) ||
        v.driver.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'vehicle',
          title: `${v.brand} ${v.model}`,
          subtitle: `${v.plate} - ${v.driver}`,
          id: v.id,
        });
      }
    });

    // Search maintenance
    maintenance.forEach(m => {
      if (
        m.description.toLowerCase().includes(term) ||
        m.vehicle.toLowerCase().includes(term) ||
        m.type.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'maintenance',
          title: m.description,
          subtitle: `${m.vehicle} - ${m.type}`,
          id: m.id,
        });
      }
    });

    // Search inventory
    inventory.forEach(i => {
      if (
        i.name.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term)
      ) {
        results.push({
          type: 'inventory',
          title: i.name,
          subtitle: `${i.category} - الكمية: ${i.quantity}`,
          id: i.id,
        });
      }
    });

    return results.slice(0, 10); // Limit results
  }, [searchTerm, vehicles, maintenance, inventory]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'vehicle':
        return <Car size={16} className="text-emerald-600" />;
      case 'maintenance':
        return <Wrench size={16} className="text-amber-600" />;
      case 'inventory':
        return <Package size={16} className="text-blue-600" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'vehicle':
        return t('vehicles.vehicle');
      case 'maintenance':
        return t('maintenance.maintenance');
      case 'inventory':
        return t('inventory.inventory');
    }
  };

  return (
    <header className="mb-6 lg:mb-10 flex gap-6 items-center justify-between px-4 lg:px-10 pt-4 lg:pt-10">
      {/* Search Bar */}
      <div ref={searchRef} className="relative group max-w-xl flex-1">
        <Search
          className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder={t('common.search') + '...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          className="w-full bg-white border border-slate-200 py-2.5 lg:py-3 rtl:pr-12 rtl:pl-10 ltr:pl-12 ltr:pr-10 rounded-xl lg:rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}

        {/* Search Results Dropdown */}
        {isSearchFocused && searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {searchResults.length === 0 ? (
              <div className="p-6 text-center">
                <Search size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">{t('table.noData')}</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-right"
                    onClick={() => {
                      setSearchTerm('');
                      setIsSearchFocused(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{result.title}</p>
                      <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded shrink-0">
                      {getTypeLabel(result.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions - Hidden on mobile (already in top nav) */}
      <div className="hidden lg:flex gap-3 items-center">
        {/* Language Switcher */}
        <LanguageSwitcher variant="toggle" />

        {/* Role Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setUserRole('admin')}
            className={`p-2 rounded-lg transition-all ${
              userRole === 'admin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
            title="لوحة المدير"
          >
            <Monitor size={16} />
          </button>
          <button
            onClick={() => setUserRole('driver')}
            className={`p-2 rounded-lg transition-all ${
              userRole === 'driver'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
            title="واجهة السائق"
          >
            <Smartphone size={16} />
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all relative"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-rose-500 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          <NotificationsPanel
            isOpen={isNotificationsPanelOpen}
            onClose={() => setIsNotificationsPanelOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
