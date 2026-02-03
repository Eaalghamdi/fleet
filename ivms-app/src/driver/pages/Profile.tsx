import { useState } from 'react';
import { User, Phone, CreditCard, Car, Bell, Shield, LogOut, ChevronLeft, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui';
import { useDriver } from '../contexts/DriverContext';
import { EditProfileModal, SettingsModal, DocumentsModal } from '../components/modals';

export function Profile() {
  const { driver, updateDriver, stats, showToast } = useDriver();
  const { t } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  const menuItems = [
    { icon: User, label: t('driver.profile.personalInfo'), desc: t('driver.profile.editNameEmail'), action: () => setIsEditModalOpen(true) },
    { icon: CreditCard, label: t('driver.profile.drivingLicense'), desc: `${t('driver.profile.expiresOn')} ${driver.licenseExpiry}`, badge: t('driver.profile.valid'), action: () => showToast(t('driver.profile.drivingLicense') + ' - ' + t('driver.profile.valid'), 'info') },
    { icon: Car, label: t('driver.profile.assignedVehicle'), desc: 'Toyota Hilux - ABC 1234', action: () => setIsDocsModalOpen(true) },
    { icon: Bell, label: t('notifications.notifications'), desc: t('notifications.manageAlerts'), action: () => setIsSettingsModalOpen(true) },
    { icon: Shield, label: t('settings.securityPrivacy'), desc: t('settings.passwordVerification'), action: () => setIsSettingsModalOpen(true) },
    { icon: HelpCircle, label: t('settings.helpSupport'), desc: t('settings.faqContact'), action: () => showToast(t('settings.technicalSupport') + ': 920001234', 'info') },
  ];

  const handleLogout = () => {
    showToast(t('auth.logoutSuccess'), 'success');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-slate-200 rounded-3xl border-4 border-white shadow-lg overflow-hidden">
          {driver.avatar ? (
            <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-3xl">
              {driver.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{driver.name}</h2>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mt-1">
            <Phone size={14} /> {driver.phone}
          </p>
        </div>
        <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
          {t('driver.profile.activeDriver')}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{stats.totalTrips}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">{t('driver.profile.trip')}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{stats.rating}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">{t('driver.profile.rating')}</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-black text-amber-600">{stats.compliance}%</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">{t('driver.profile.compliance')}</p>
        </GlassCard>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-200 transition-colors group"
          >
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <item.icon size={20} />
            </div>
            <div className="flex-1 rtl:text-right ltr:text-left">
              <p className="font-bold text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                {item.badge}
              </span>
            )}
            <ChevronLeft size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors rtl:rotate-0 ltr:rotate-180" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-center gap-3 text-rose-600 hover:bg-rose-100 transition-colors"
      >
        <LogOut size={20} />
        <span className="font-bold">{t('auth.logout')}</span>
      </button>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        driver={driver}
        onSave={updateDriver}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <DocumentsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}
