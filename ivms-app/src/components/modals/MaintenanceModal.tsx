import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { MaintenanceForm } from '../forms/MaintenanceForm';
import type { MaintenanceRequest } from '../../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: MaintenanceRequest;
  onSubmit: (data: Omit<MaintenanceRequest, 'id'>) => void;
}

export function MaintenanceModal({ isOpen, onClose, maintenance, onSubmit }: MaintenanceModalProps) {
  const { t } = useTranslation();

  const handleSubmit = (data: Omit<MaintenanceRequest, 'id'>) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={maintenance ? t('modals.maintenance.editTitle') : t('modals.maintenance.addTitle')}
      size="lg"
    >
      <MaintenanceForm maintenance={maintenance} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
