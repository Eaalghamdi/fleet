import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const typeColors = {
  danger: {
    icon: 'bg-rose-100 text-rose-600',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: 'bg-blue-100 text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger',
}: ConfirmDialogProps) {
  const colors = typeColors[type];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colors.icon}`}>
            <AlertTriangle size={32} />
          </div>
          <p className="text-slate-600 mb-6">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${colors.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
