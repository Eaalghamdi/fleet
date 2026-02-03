import { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, description: string) => void;
}

export function IssueReportModal({ isOpen, onClose, onSubmit }: IssueReportModalProps) {
  const { t } = useTranslation();
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');

  const issueTypes = [
    { value: 'tire', label: t('driver.modals.issue.types.tires') },
    { value: 'engine', label: t('driver.modals.issue.types.engine') },
    { value: 'brakes', label: t('driver.modals.issue.types.brakes') },
    { value: 'electrical', label: t('driver.modals.issue.types.electrical') },
    { value: 'ac', label: t('driver.modals.issue.types.ac') },
    { value: 'other', label: t('driver.modals.issue.types.other') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (issueType && description.trim()) {
      const typeLabel = issueTypes.find(t => t.value === issueType)?.label || issueType;
      onSubmit(typeLabel, description);
      setIssueType('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('driver.modals.issue.title')} size="sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
            <AlertTriangle size={32} />
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('driver.modals.issue.issueType')}
          </label>
          <select
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            required
          >
            <option value="">{t('driver.modals.issue.selectIssueType')}</option>
            {issueTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('driver.modals.issue.problemDescription')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('driver.modals.issue.describeProblem')}
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            required
          />
        </div>

        {/* Info Note */}
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs text-amber-700">
            {t('driver.modals.issue.disclaimer')}
          </p>
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
            className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {t('driver.modals.issue.submitReport')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
