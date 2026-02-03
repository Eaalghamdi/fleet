import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export function Unauthorized() {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const navigate = useNavigate();
  const isRTL = direction === 'rtl';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('pages.unauthorized.title')}</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          {t('pages.unauthorized.description')}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          {t('pages.unauthorized.goBack')}
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
