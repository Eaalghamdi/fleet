import { useState } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import type { InventoryItem } from '../../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSubmit: (id: string, quantity: number) => void;
}

export function OrderModal({ isOpen, onClose, item, onSubmit }: OrderModalProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item && quantity > 0) {
      onSubmit(item.id, quantity);
      setQuantity(10);
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modals.order.title')}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Item Info */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Package size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{item.name}</h3>
            <p className="text-sm text-slate-500">{item.category}</p>
          </div>
        </div>

        {/* Current Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">{t('modals.order.currentQuantity')}</p>
            <p className="text-xl font-bold text-slate-800">{item.quantity}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">{t('modals.order.minimum')}</p>
            <p className="text-xl font-bold text-slate-800">{item.minStock}</p>
          </div>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('modals.order.requestedQuantity')}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 5))}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg transition-colors"
            >
              -5
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 5)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg transition-colors"
            >
              +5
            </button>
          </div>
        </div>

        {/* Quick Select */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[10, 25, 50, 100].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuantity(q)}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                quantity === q
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            {t('modals.order.confirmOrder')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
