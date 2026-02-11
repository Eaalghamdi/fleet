import { useState } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';

interface Document {
  title: string;
  vehicle: string;
  expiry: string;
  status: string;
  days: number;
}

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSubmit: (document: Document) => void;
}

export function DocumentModal({ isOpen, onClose, document, onSubmit }: DocumentModalProps) {
  const { t } = useTranslation();
  const [expiryDate, setExpiryDate] = useState(document?.expiry || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (document && expiryDate) {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'valid';
      if (diffDays < 0) {
        status = 'expired';
      } else if (diffDays <= 30) {
        status = 'near-expiry';
      }

      onSubmit({
        ...document,
        expiry: expiryDate,
        days: diffDays,
        status,
      });
      onClose();
    }
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modals.document.title')}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Document Info */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{document.title}</h3>
            <p className="text-sm text-slate-500">{document.vehicle}</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">{t('modals.document.currentExpiryDate')}</p>
            <p className="text-sm font-bold text-slate-800">{document.expiry}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">{t('modals.document.status')}</p>
            <p className={`text-sm font-bold ${
              document.status === 'expired' ? 'text-rose-600' :
              document.status === 'near-expiry' ? 'text-amber-600' :
              'text-emerald-600'
            }`}>
              {document.status === 'expired' ? t('modals.document.expired') :
               document.status === 'near-expiry' ? t('modals.document.nearExpiry') :
               t('modals.document.valid')}
            </p>
          </div>
        </div>

        {/* New Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Calendar size={14} className="inline rtl:ml-1 ltr:mr-1" />
            {t('modals.document.newExpiryDate')}
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            required
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
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('modals.document.update')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
