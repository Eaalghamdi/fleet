import { Clock, MapPin, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ActiveTrip } from '../../types';

interface ActiveTripCardProps {
  trip: ActiveTrip;
  onNavigate?: () => void;
  onEndTrip?: () => void;
}

export function ActiveTripCard({ trip, onNavigate, onEndTrip }: ActiveTripCardProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-emerald-900 rounded-[32px] p-6 text-white shadow-2xl shadow-emerald-900/30">
      {/* Decorative blur */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-10 -translate-y-10 blur-2xl" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="px-3 py-1 bg-emerald-500/30 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {t('driver.activeTrip.activeTask')}
          </span>
          <span className="text-xs opacity-60 flex items-center gap-1">
            <Clock size={12} /> {t('driver.activeTrip.startedAgo', { time: '40 ' + t('common.minutes') })}
          </span>
        </div>

        {/* Trip Info */}
        <div>
          <h3 className="text-lg font-bold">
            {trip.vehicle} ({trip.vehiclePlate})
          </h3>
          <p className="text-sm opacity-80 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {trip.destination}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onNavigate}
            className="flex-1 py-3 bg-white text-emerald-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
          >
            <Navigation size={18} /> {t('driver.activeTrip.googleMaps')}
          </button>
          <button
            onClick={onEndTrip}
            className="flex-1 py-3 bg-emerald-800 text-white border border-emerald-700 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-colors"
          >
            {t('driver.activeTrip.endTrip')}
          </button>
        </div>
      </div>
    </div>
  );
}
