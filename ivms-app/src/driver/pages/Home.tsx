import { useState } from 'react';
import { QrCode, Fuel, AlertTriangle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DriverHeader } from '../components/layout';
import { ActiveTripCard, ActionButton, ActivityItem } from '../components/ui';
import { useDriver } from '../contexts/DriverContext';
import {
  QRScannerModal,
  FuelReportModal,
  IssueReportModal,
  DocumentsModal,
  ConfirmEndTripModal,
} from '../components/modals';

export function Home() {
  const { driver, activeTrip, tasks, activities, endTrip, addFuelReport, addIssueReport, showToast } = useDriver();
  const { t } = useTranslation();

  // Modal states
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isEndTripModalOpen, setIsEndTripModalOpen] = useState(false);

  const handleNavigate = () => {
    if (activeTrip) {
      const destination = encodeURIComponent(activeTrip.destination);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  };

  const handleEndTrip = () => {
    setIsEndTripModalOpen(true);
  };

  const handleQRScanned = (code: string) => {
    showToast(t('driver.home.codeScanned', { code }), 'success');
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <DriverHeader driver={driver} taskCount={tasks.length} />

      {/* Active Trip */}
      {activeTrip && activeTrip.status === 'active' && (
        <ActiveTripCard trip={activeTrip} onNavigate={handleNavigate} onEndTrip={handleEndTrip} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          icon={QrCode}
          label={t('driver.home.scanStartCode')}
          color="emerald"
          onClick={() => setIsQRModalOpen(true)}
        />
        <ActionButton
          icon={Fuel}
          label={t('driver.home.fuelLog')}
          color="blue"
          onClick={() => setIsFuelModalOpen(true)}
        />
        <ActionButton
          icon={AlertTriangle}
          label={t('driver.home.issueReport')}
          color="red"
          onClick={() => setIsIssueModalOpen(true)}
        />
        <ActionButton
          icon={FileText}
          label={t('driver.home.vehicleDocuments')}
          color="amber"
          onClick={() => setIsDocsModalOpen(true)}
        />
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-800">{t('driver.home.recentActivity')}</h4>
          <button className="text-xs text-emerald-600 font-bold hover:underline">{t('common.viewAll')}</button>
        </div>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">{t('driver.home.noActivityYet')}</p>
            </div>
          ) : (
            activities.slice(0, 3).map((activity) => (
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
      </div>

      {/* Modals */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onScan={handleQRScanned}
      />

      <FuelReportModal
        isOpen={isFuelModalOpen}
        onClose={() => setIsFuelModalOpen(false)}
        onSubmit={addFuelReport}
      />

      <IssueReportModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSubmit={addIssueReport}
      />

      <DocumentsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {activeTrip && (
        <ConfirmEndTripModal
          isOpen={isEndTripModalOpen}
          onClose={() => setIsEndTripModalOpen(false)}
          onConfirm={endTrip}
          tripId={activeTrip.id}
        />
      )}
    </div>
  );
}
