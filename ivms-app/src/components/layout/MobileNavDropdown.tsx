import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { getNavItemsForDepartment, getDepartmentLabel } from '../../utils/navUtils';
import type { ViewType } from '../../types';

interface MobileNavDropdownProps {
  activeTab: ViewType;
  setActiveTab: (tab: ViewType) => void;
  onLogout?: () => void;
  userName?: string;
  userDepartment?: string;
}

export function MobileNavDropdown({ activeTab, setActiveTab, onLogout, userName, userDepartment }: MobileNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const navItems = getNavItemsForDepartment(userDepartment, t);
  const departmentLabel = getDepartmentLabel(userDepartment, t);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNav = (id: string) => {
    setActiveTab(id as ViewType);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
      >
        {isOpen ? <X size={24} className="text-slate-700" /> : <Menu size={24} className="text-slate-700" />}
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isRTL ? 'right-0' : 'left-0'}`}>
          {/* Nav Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Divider + User Profile */}
          <div className="my-2 border-t border-slate-100" />
          <div className="px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{userName || t('departments.user')}</p>
              <p className="text-[10px] text-slate-400">{departmentLabel}</p>
            </div>
          </div>

          {/* Settings */}
          <button
            onClick={() => handleNav('settings')}
            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Settings size={18} className={activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="text-sm font-medium">{t('settings.profile')}</span>
          </button>

          {/* Divider + Logout */}
          <div className="my-2 border-t border-slate-100" />
          <button
            onClick={() => { onLogout?.(); setIsOpen(false); }}
            className="w-full px-4 py-3 flex items-center gap-3 text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">{t('auth.logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
