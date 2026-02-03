import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocumentType = 'vehicleForm' | 'insurance' | 'periodicInspection' | 'operatingLicense';

interface Document {
  titleKey: DocumentType;
  expiry: string;
  status: 'valid' | 'near-expiry' | 'expired';
  daysLeft: number;
}

const documents: Document[] = [
  {
    titleKey: 'vehicleForm',
    expiry: '2026-06-15',
    status: 'valid',
    daysLeft: 138,
  },
  {
    titleKey: 'insurance',
    expiry: '2026-08-20',
    status: 'valid',
    daysLeft: 204,
  },
  {
    titleKey: 'periodicInspection',
    expiry: '2026-02-28',
    status: 'near-expiry',
    daysLeft: 31,
  },
  {
    titleKey: 'operatingLicense',
    expiry: '2026-12-01',
    status: 'valid',
    daysLeft: 307,
  },
];

export function DocumentsModal({ isOpen, onClose }: DocumentsModalProps) {
  const { t } = useTranslation();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'expired':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-50',
          text: 'text-rose-600',
          border: 'border-rose-100',
          badge: 'bg-rose-600 text-white',
          badgeText: t('driver.modals.documents.expired'),
        };
      case 'near-expiry':
        return {
          icon: Clock,
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-100',
          badge: 'bg-amber-500 text-white',
          badgeText: t('driver.modals.documents.nearExpiry'),
        };
      default:
        return {
          icon: CheckCircle,
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-100',
          badge: 'bg-emerald-600 text-white',
          badgeText: t('driver.modals.documents.valid'),
        };
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.documents.title')} size="md">
      <div className="p-6 space-y-4">
        {/* Vehicle Info */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('driver.modals.documents.sampleVehicle')}</h3>
            <p className="text-sm text-slate-500">{t('driver.modals.documents.samplePlate')}</p>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          {documents.map((doc, idx) => {
            const style = getStatusStyle(doc.status);
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${style.border} ${style.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={style.text} />
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {t(`driver.modals.documents.${doc.titleKey}`)}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {t('driver.modals.documents.expiresOn')} {doc.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="text-left rtl:text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${style.badge}`}>
                      {style.badgeText}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {doc.daysLeft > 0
                        ? t('driver.modals.documents.daysRemaining', { days: doc.daysLeft })
                        : t('driver.modals.documents.isExpired')
                      }
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700">
            {t('driver.modals.documents.contactFleet')}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
        >
          {t('common.close')}
        </button>
      </div>
    </Modal>
  );
}
