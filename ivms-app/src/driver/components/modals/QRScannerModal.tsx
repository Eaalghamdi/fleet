import { useState } from 'react';
import { QrCode, Camera, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      const mockCode = `VH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setScannedCode(mockCode);
      setIsScanning(false);
    }, 2000);
  };

  const handleConfirm = () => {
    if (scannedCode) {
      onScan(scannedCode);
      setScannedCode(null);
      onClose();
    }
  };

  const handleClose = () => {
    setScannedCode(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('driver.modals.qr.title')} size="sm">
      <div className="p-6 space-y-6">
        {/* Scanner Area */}
        <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden">
          {isScanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-500 rounded-xl animate-pulse relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 -translate-x-px -translate-y-px" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 translate-x-px -translate-y-px" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 -translate-x-px translate-y-px" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 translate-x-px translate-y-px" />
                {/* Scanning line */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 animate-[scan_2s_ease-in-out_infinite]" />
              </div>
              <p className="text-white text-sm mt-4">{t('driver.modals.qr.scanning')}</p>
            </div>
          ) : scannedCode ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/90">
              <CheckCircle size={64} className="text-emerald-400 mb-4" />
              <p className="text-white font-bold text-lg">{t('driver.modals.qr.success')}</p>
              <p className="text-emerald-300 text-sm mt-2 font-mono">{scannedCode}</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-400 text-sm">{t('driver.modals.qr.pressToScan')}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-slate-500">
          <p>{t('driver.modals.qr.instruction')}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          {scannedCode ? (
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {t('common.confirm')}
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <QrCode size={18} />
              {isScanning ? t('driver.modals.qr.scanning') : t('driver.modals.qr.startScan')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
