import { MapPin, Clock, Car, CheckCircle, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface TripDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    destination: string;
    date: string;
    status: string;
    distance: string;
  } | null;
}

export function TripDetailsModal({ isOpen, onClose, trip }: TripDetailsModalProps) {
  const { t } = useTranslation();

  if (!trip) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.tripDetails.title', { id: trip.id })} size="sm">
      <div className="p-6 space-y-4">
        {/* Status Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-bold border border-emerald-100">
            <CheckCircle size={16} />
            {t('driver.modals.tripDetails.completed')}
          </span>
        </div>

        {/* Trip Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{t('driver.modals.tripDetails.destination')}</p>
              <p className="font-bold text-slate-800">{trip.destination}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('driver.modals.tripDetails.date')}</p>
                <p className="font-bold text-slate-800">{trip.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <Navigation size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{t('driver.modals.tripDetails.distance')}</p>
                <p className="font-bold text-slate-800">{trip.distance}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
              <Car size={18} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">{t('driver.modals.tripDetails.vehicle')}</p>
              <p className="font-bold text-slate-800">{t('driver.modals.tripDetails.sampleVehicle')}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-bold text-slate-800 mb-3">{t('driver.modals.tripDetails.tripProgress')}</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-600">{t('driver.modals.tripDetails.tripStarted', { time: '08:30 AM' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-600">{t('driver.modals.tripDetails.arrivedDestination', { time: '09:15 AM' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-600">{t('driver.modals.tripDetails.tripEnded', { time: '09:20 AM' })}</p>
            </div>
          </div>
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
