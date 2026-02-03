import { useState } from 'react';
import { User, Phone, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';
import type { Driver } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver;
  onSave: (updates: Partial<Driver>) => void;
}

export function EditProfileModal({ isOpen, onClose, driver, onSave }: EditProfileModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(driver.name);
  const [phone, setPhone] = useState(driver.phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onSave({ name, phone });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.editProfile.title')} size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-2xl">
            {name.charAt(0)}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User size={14} className="inline rtl:ml-1 ltr:mr-1" />
            {t('driver.modals.editProfile.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
          />
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Phone size={14} className="inline rtl:ml-1 ltr:mr-1" />
            {t('driver.modals.editProfile.phone')}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
            dir="ltr"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
