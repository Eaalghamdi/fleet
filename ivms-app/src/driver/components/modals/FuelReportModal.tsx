import { useState } from 'react';
import { Fuel, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface FuelReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, station: string) => void;
}

export function FuelReportModal({ isOpen, onClose, onSubmit }: FuelReportModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(40);
  const [station, setStation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0 && station.trim()) {
      onSubmit(amount, station);
      setAmount(40);
      setStation('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.fuel.title')} size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Fuel Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <Fuel size={32} />
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('driver.modals.fuel.fuelAmount')}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAmount(Math.max(1, amount - 5))}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg transition-colors"
            >
              -5
            </button>
            <input
              type="number"
              min="1"
              max="200"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setAmount(Math.min(200, amount + 5))}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg transition-colors"
            >
              +5
            </button>
          </div>
        </div>

        {/* Quick Select */}
        <div className="flex gap-2">
          {[20, 40, 60, 80].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                amount === q
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {q} {t('common.liters')}
            </button>
          ))}
        </div>

        {/* Station Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin size={14} className="inline rtl:ml-1 ltr:mr-1" />
            {t('driver.modals.fuel.gasStation')}
          </label>
          <input
            type="text"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            placeholder={t('driver.modals.fuel.gasStationPlaceholder')}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            required
          />
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
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Fuel size={18} />
            {t('common.register')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
