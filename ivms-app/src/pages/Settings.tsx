import { useState } from 'react';
import { User, Lock, Globe, Eye, EyeOff, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { GlassCard } from '../components/ui';

export function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language, setLanguage, direction } = useLanguage();
  const { showToast } = useApp();
  const isRTL = direction === 'rtl';

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast(t('pages.settings.passwordMismatch'), 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast(t('pages.settings.passwordTooShort'), 'error');
      return;
    }

    setIsChangingPassword(true);

    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(t('pages.settings.passwordChanged'), 'success');
    }, 1000);
  };

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    showToast(t('pages.settings.languageChanged'), 'success');
  };

  const getDepartmentLabel = (department?: string): string => {
    switch (department) {
      case 'ADMIN': return t('departments.admin');
      case 'OPERATION': return t('departments.operation');
      case 'GARAGE': return t('departments.garage');
      case 'MAINTENANCE': return t('departments.maintenance');
      default: return t('departments.user');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('pages.settings.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('pages.settings.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Section */}
        <GlassCard className="lg:col-span-1 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <User size={20} className="text-emerald-600" />
            </div>
            <h2 className="font-bold text-slate-800">{t('pages.settings.profileInfo')}</h2>
          </div>

          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <User size={40} className="text-white" />
            </div>

            {/* User Info */}
            <h3 className="text-xl font-bold text-slate-800 mb-1">{user?.fullName || t('departments.user')}</h3>
            <p className="text-sm text-slate-500 mb-2">@{user?.username}</p>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
              {getDepartmentLabel(user?.department)}
            </span>

            {/* Stats */}
            <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center">
                <p className="text-sm sm:text-2xl font-bold text-slate-800 truncate">{user?.role === 'SUPER_ADMIN' ? t('pages.settings.superAdmin') : t('pages.settings.standardUser')}</p>
                <p className="text-xs text-slate-500">{t('pages.settings.accountType')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-2xl font-bold text-emerald-600">{user?.isActive ? t('common.active') : t('common.inactive')}</p>
                <p className="text-xs text-slate-500">{t('common.status')}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Language Preference */}
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Globe size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{t('pages.settings.languagePreference')}</h2>
                <p className="text-xs text-slate-500">{t('pages.settings.languageDescription')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Arabic Option */}
              <button
                onClick={() => handleLanguageChange('ar')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  language === 'ar'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🇸🇦</span>
                  {language === 'ar' && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-start">العربية</p>
                <p className="text-xs text-slate-500 text-start">Arabic</p>
              </button>

              {/* English Option */}
              <button
                onClick={() => handleLanguageChange('en')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  language === 'en'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🇺🇸</span>
                  {language === 'en' && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="font-bold text-slate-800 text-start">English</p>
                <p className="text-xs text-slate-500 text-start">الإنجليزية</p>
              </button>
            </div>
          </GlassCard>

          {/* Password Change */}
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Lock size={20} className="text-rose-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{t('pages.settings.changePassword')}</h2>
                <p className="text-xs text-slate-500">{t('pages.settings.passwordDescription')}</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('pages.settings.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRTL ? 'left-4' : 'right-4'}`}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('pages.settings.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRTL ? 'left-4' : 'right-4'}`}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {t('pages.settings.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${isRTL ? 'left-4' : 'right-4'}`}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    {t('pages.settings.updatePassword')}
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}