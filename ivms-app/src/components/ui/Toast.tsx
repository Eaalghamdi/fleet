import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastType } from '../../types';

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2" dir="rtl">
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-bottom-5 duration-300 ${colors[toast.type]}`}
          >
            <Icon size={20} className={iconColors[toast.type]} />
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors mr-2"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
