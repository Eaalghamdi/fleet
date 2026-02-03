import { useState } from 'react';
import { CheckCircle2, MapPin, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui';
import { useDriver } from '../contexts/DriverContext';
import { ActivityItem } from '../components/ui';
import { TripDetailsModal } from '../components/modals';

export function History() {
  const { tripHistory, activities, stats } = useDriver();
  const { t } = useTranslation();
  const [selectedTrip, setSelectedTrip] = useState<typeof tripHistory[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTripClick = (trip: typeof tripHistory[0]) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">{t('driver.history.tripHistory')}</h1>
        <p className="text-sm text-slate-500">{t('driver.history.viewAllTrips')}</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('driver.history.totalTrips')}</p>
          <p className="text-3xl font-black text-slate-800">{stats.totalTrips}</p>
          <p className="text-xs text-emerald-600 font-bold">+{tripHistory.length} {t('driver.history.thisMonth')}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('driver.history.totalDistance')}</p>
          <p className="text-3xl font-black text-slate-800">{stats.totalDistance.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{t('common.kilometers')}</p>
        </GlassCard>
      </div>

      {/* Recent Trips */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-800">{t('driver.history.recentTrips')}</h4>
        {tripHistory.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl">
            <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">{t('driver.history.noPreviousTrips')}</p>
          </div>
        ) : (
          tripHistory.map((trip) => (
            <GlassCard
              key={trip.id}
              className="hover:border-emerald-200 transition-colors cursor-pointer group"
              onClick={() => handleTripClick(trip)}
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{trip.id}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {trip.destination}
                    </p>
                  </div>
                </div>
                <div className="ltr:text-right rtl:text-left">
                  <p className="text-xs font-bold text-slate-600">{trip.distance}</p>
                  <p className="text-[10px] text-slate-400">{trip.date}</p>
                </div>
                <ChevronLeft size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors rtl:mr-2 ltr:ml-2 rtl:rotate-0 ltr:rotate-180" />
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Activity Timeline */}
      <div className="space-y-3">
        <h4 className="font-bold text-slate-800">{t('driver.history.allActivities')}</h4>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">{t('driver.history.noActivities')}</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              icon={activity.icon}
              title={activity.title}
              description={activity.description}
              time={activity.time}
              color={activity.color}
            />
          ))
        )}
      </div>

      {/* Trip Details Modal */}
      <TripDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={selectedTrip}
      />
    </div>
  );
}
