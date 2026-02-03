import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui';
import { DocumentModal } from '../components/modals/DocumentModal';
import { useApp } from '../contexts/AppContext';

interface Document {
  title: string;
  vehicle: string;
  expiry: string;
  status: string;
  days: number;
}

const initialDocuments: Document[] = [
  {
    title: 'استمارة مركبة',
    vehicle: 'تويوتا هايلكس (أ ب ج 1234)',
    expiry: '2026-02-15',
    status: 'near-expiry',
    days: 22,
  },
  {
    title: 'تأمين شامل',
    vehicle: 'نيسان باترول (س ص ع 5678)',
    expiry: '2026-08-10',
    status: 'valid',
    days: 198,
  },
  {
    title: 'فحص دوري',
    vehicle: 'مرسيدس أكتروس (ح ط ك 9012)',
    expiry: '2026-01-20',
    status: 'expired',
    days: -4,
  },
  {
    title: 'رخصة تشغيل',
    vehicle: 'هيونداي إلنترا (ل م ن 3456)',
    expiry: '2026-05-01',
    status: 'valid',
    days: 97,
  },
  {
    title: 'شهادة فحص فني',
    vehicle: 'فورد F-150 (ق ر س 7890)',
    expiry: '2026-01-28',
    status: 'near-expiry',
    days: 4,
  },
  {
    title: 'تصريح نقل',
    vehicle: 'ايسوزو NPR (ع غ ف 2468)',
    expiry: '2026-03-15',
    status: 'valid',
    days: 50,
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'expired':
      return {
        border: 'border-rose-100',
        icon: 'bg-rose-50 text-rose-600',
        badge: 'bg-rose-600 text-white',
        badgeText: 'منتهي',
      };
    case 'near-expiry':
      return {
        border: 'border-amber-100',
        icon: 'bg-amber-50 text-amber-600',
        badge: 'bg-amber-500 text-white',
        badgeText: 'قرب الانتهاء',
      };
    default:
      return {
        border: 'border-slate-100',
        icon: 'bg-slate-50 text-slate-400',
        badge: '',
        badgeText: '',
      };
  }
};

export function Reports() {
  const { t } = useTranslation();
  const { showToast, addNotification } = useApp();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter documents by search term
  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter(doc =>
      doc.vehicle.toLowerCase().includes(term) ||
      doc.title.toLowerCase().includes(term)
    );
  }, [documents, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const valid = documents.filter(d => d.status === 'valid').length;
    const nearExpiry = documents.filter(d => d.status === 'near-expiry').length;
    const expired = documents.filter(d => d.status === 'expired').length;
    const total = documents.length;
    const compliance = total > 0 ? ((valid / total) * 100).toFixed(1) : 0;

    return { valid, nearExpiry, expired, compliance };
  }, [documents]);

  const handleDownloadReport = () => {
    const report = `
سجل الامتثال والتراخيص
======================

إحصائيات:
- تراخيص سارية: ${stats.valid}
- تجديد وشيك: ${stats.nearExpiry}
- منتهية الصلاحية: ${stats.expired}
- نسبة الامتثال: ${stats.compliance}%

المستندات:
${documents.map(doc => `
${doc.title}
  المركبة: ${doc.vehicle}
  تاريخ الانتهاء: ${doc.expiry}
  الحالة: ${doc.status === 'valid' ? 'ساري' : doc.status === 'near-expiry' ? 'قرب الانتهاء' : 'منتهي'}
  ${doc.days >= 0 ? `متبقي: ${doc.days} يوم` : `منتهي منذ: ${Math.abs(doc.days)} يوم`}
`).join('\n')}

تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}
    `.trim();

    const blob = new Blob(['\ufeff' + report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compliance-report.txt';
    link.click();
    showToast(t('pages.reports.complianceLogDownloaded'), 'success');
  };

  const handleUpdateDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleDocumentSubmit = (updatedDoc: Document) => {
    setDocuments(prev =>
      prev.map(d =>
        d.title === updatedDoc.title && d.vehicle === updatedDoc.vehicle
          ? updatedDoc
          : d
      )
    );
    showToast('تم تحديث المستند بنجاح', 'success');
    addNotification({
      title: 'تحديث مستند',
      message: `تم تحديث ${updatedDoc.title} للمركبة ${updatedDoc.vehicle}`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.reports.title')}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">{t('pages.reports.description')}</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="w-full sm:w-auto bg-slate-900 text-white px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Download size={18} /> {t('pages.reports.downloadComplianceLog')}
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Valid Licenses */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.reports.validLicenses')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.valid}</p>
        </GlassCard>

        {/* Near Expiry */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.reports.nearRenewal')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.nearExpiry}</p>
        </GlassCard>

        {/* Expired */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.reports.expired')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.expired}</p>
        </GlassCard>

        {/* Overall Compliance */}
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={18} />
            </div>
            <h5 className="text-xs sm:text-sm font-bold text-slate-800">{t('pages.reports.complianceRate')}</h5>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.compliance}%</p>
        </GlassCard>
      </div>

      {/* Documents Section */}
      <GlassCard className="rounded-2xl sm:rounded-3xl">
        {/* Section Header */}
        <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
          <h4 className="font-black text-slate-800 text-sm sm:text-base">{t('pages.reports.licensesAndDocuments')}</h4>
          <div className="relative w-full md:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t('pages.reports.vehicleNumber')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full md:w-48 transition-all"
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50/50">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">{t('pages.reports.noMatchingDocuments')}</p>
            </div>
          ) : (
            filteredDocuments.map((doc, idx) => {
              const style = getStatusStyle(doc.status);
              return (
                <div
                  key={idx}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all hover:shadow-md ${style.border}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl ${style.icon}`}>
                      <FileText size={20} />
                    </div>
                    {doc.status !== 'valid' && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md ${style.badge}`}>
                        {style.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <h5 className="font-bold text-slate-800 text-sm sm:text-base">{doc.title}</h5>
                  <p className="text-xs text-slate-500 mb-3 sm:mb-4 truncate">{doc.vehicle}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">{t('pages.reports.expiryDate')}</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">{doc.expiry}</span>
                    </div>
                    <div className="text-left rtl:text-right">
                      <p className={`text-[10px] sm:text-xs font-black ${doc.days < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                        {doc.days < 0 ? t('pages.reports.expiredAgo', { days: Math.abs(doc.days) }) : t('pages.reports.daysRemaining', { days: doc.days })}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleUpdateDocument(doc)}
                    className="w-full mt-3 sm:mt-4 py-2 sm:py-2.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                  >
                    {t('pages.reports.updateDocument')}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>

      {/* Document Modal */}
      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
        onSubmit={handleDocumentSubmit}
      />
    </div>
  );
}
