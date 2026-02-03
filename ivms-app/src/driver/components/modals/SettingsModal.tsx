import { useState } from 'react';
import { Bell, Moon, Globe, Volume2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingToggleProps {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function SettingToggle({ icon: Icon, label, description, enabled, onToggle }: SettingToggleProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-slate-600">
          <Icon size={18} />
        </div>
        <div>
          <p className="font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${
          enabled ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            enabled
              ? (isRTL ? 'left-1' : 'right-1')
              : (isRTL ? 'right-1' : 'left-1')
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    darkMode: false,
    biometric: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.settings.title')} size="sm">
      <div className="p-6 space-y-4">
        {/* Notifications */}
        <SettingToggle
          icon={Bell}
          label={t('driver.modals.settings.notifications')}
          description={t('driver.modals.settings.notificationsDesc')}
          enabled={settings.notifications}
          onToggle={() => toggleSetting('notifications')}
        />

        {/* Sounds */}
        <SettingToggle
          icon={Volume2}
          label={t('driver.modals.settings.sounds')}
          description={t('driver.modals.settings.soundsDesc')}
          enabled={settings.sounds}
          onToggle={() => toggleSetting('sounds')}
        />

        {/* Dark Mode */}
        <SettingToggle
          icon={Moon}
          label={t('driver.modals.settings.darkMode')}
          description={t('driver.modals.settings.darkModeDesc')}
          enabled={settings.darkMode}
          onToggle={() => toggleSetting('darkMode')}
        />

        {/* Language */}
        <SettingToggle
          icon={Globe}
          label={t('driver.modals.settings.arabicLanguage')}
          description={t('driver.modals.settings.arabicLanguageDesc')}
          enabled={language === 'ar'}
          onToggle={handleLanguageToggle}
        />

        {/* Biometric */}
        <SettingToggle
          icon={Shield}
          label={t('driver.modals.settings.biometric')}
          description={t('driver.modals.settings.biometricDesc')}
          enabled={settings.biometric}
          onToggle={() => toggleSetting('biometric')}
        />

        {/* App Version */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">{t('driver.modals.settings.appVersion')} 1.0.0</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
        >
          {t('driver.modals.settings.saveSettings')}
        </button>
      </div>
    </Modal>
  );
}
