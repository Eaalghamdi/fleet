import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { VehicleForm } from '../forms/VehicleForm';
import type { Vehicle } from '../../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle;
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
}

export function VehicleModal({ isOpen, onClose, vehicle, onSubmit }: VehicleModalProps) {
  const { t } = useTranslation();

  const handleSubmit = (data: Omit<Vehicle, 'id'>) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? t('modals.vehicle.editTitle') : t('modals.vehicle.addTitle')}
      size="lg"
    >
      <VehicleForm vehicle={vehicle} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
