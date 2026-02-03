import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { InventoryForm } from '../forms/InventoryForm';
import type { InventoryItem } from '../../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem;
  onSubmit: (data: Omit<InventoryItem, 'id'>) => void;
}

export function InventoryModal({ isOpen, onClose, item, onSubmit }: InventoryModalProps) {
  const { t } = useTranslation();

  const handleSubmit = (data: Omit<InventoryItem, 'id'>) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? t('modals.inventory.editTitle') : t('modals.inventory.addTitle')}
      size="md"
    >
      <InventoryForm item={item} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
