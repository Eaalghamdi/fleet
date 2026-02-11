import {
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { SidebarItem } from '../ui';
import { getNavItemsForDepartment, getDepartmentLabel } from '../../utils/navUtils';
import type { ViewType } from '../../types';

interface SidebarProps {
  activeTab: ViewType;
  setActiveTab: (tab: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout?: () => void;
  userName?: string;
  userDepartment?: string;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, userName, userDepartment }: SidebarProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const CollapseIcon = isRTL ? ChevronLeft : ChevronRight;
  const ExpandIcon = isRTL ? ChevronRight : ChevronLeft;

  const navItems = getNavItemsForDepartment(userDepartment, t);
  const departmentLabel = getDepartmentLabel(userDepartment, t);

  return (
    <aside
      className={`${
        isOpen ? 'w-72' : 'w-20'
      } bg-slate-900 text-slate-400 rtl:border-l ltr:border-r border-white/5 transition-all duration-500 hidden lg:flex flex-col fixed inset-y-0 rtl:right-0 ltr:left-0 z-50`}
    >
      {/* Logo & Brand */}
      <div className="p-8 flex items-center justify-between mb-8">
        {isOpen ? (
          <span className="text-xl font-black text-white tracking-tighter">
            IVMS
          </span>
        ) : (
          <span className="text-lg font-black text-white tracking-tighter mx-auto">
            IV
          </span>
        )}
        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 hover:bg-white/10 rounded-xl transition-colors ${!isOpen ? 'hidden!' : ''}`}
        >
          <CollapseIcon size={20} />
        </button>
      </div>

      {/* Collapse Toggle for Collapsed State */}
      {!isOpen && (
        <div className="px-4 mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2 hover:bg-white/10 rounded-xl transition-colors flex justify-center"
          >
            <ExpandIcon size={20} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id as ViewType)}
            collapsed={!isOpen}
          />
        ))}
      </nav>

      {/* Bottom Section: User Profile */}
      <div className="p-4 space-y-4">
        {/* User Profile Card - Expanded */}
        {isOpen && (
          <div className={`p-4 rounded-2xl border transition-all ${activeTab === 'settings' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activeTab === 'settings' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-emerald-400'}`}>
                <User size={20} />
              </div>
              <div className="text-right overflow-hidden flex-1">
                <p className="text-xs font-bold text-white truncate">{userName || t('departments.user')}</p>
                <p className="text-[10px] opacity-50">{departmentLabel}</p>
              </div>
            </button>
            <button
              onClick={onLogout}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              {t('auth.logout')}
            </button>
          </div>
        )}

        {/* User Profile - Collapsed */}
        {!isOpen && (
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-center p-3 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-emerald-500 text-white' : 'text-emerald-400 hover:bg-white/10'}`}
              title={t('settings.profile')}
            >
              <User size={20} />
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
              title={t('auth.logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
