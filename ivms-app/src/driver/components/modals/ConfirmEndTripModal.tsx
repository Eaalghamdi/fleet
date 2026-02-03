import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface ConfirmEndTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tripId: string;
}

export function ConfirmEndTripModal({ isOpen, onClose, onConfirm, tripId }: ConfirmEndTripModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.endTrip.title')} size="sm">
      <div className="p-6 space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="font-bold text-slate-800 text-lg mb-2">
            {t('driver.modals.endTrip.confirmation')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('driver.modals.endTrip.description', { tripId })}
          </p>
        </div>

        {/* Trip Summary */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('driver.modals.endTrip.tripNumber')}</span>
            <span className="font-bold text-slate-800">{tripId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('driver.modals.endTrip.status')}</span>
            <span className="font-bold text-emerald-600">{t('driver.modals.endTrip.willComplete')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            {t('driver.modals.endTrip.confirmEnd')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
