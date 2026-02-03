import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'button' | 'dropdown' | 'toggle';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LanguageSwitcher({
  variant = 'toggle',
  size = 'md',
  showLabel = false
}: LanguageSwitcherProps) {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  const sizeClasses = {
    sm: 'text-xs p-1.5',
    md: 'text-sm p-2',
    lg: 'text-base p-2.5',
  };

  // Simple toggle button
  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors ${sizeClasses[size]}`}
        title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <Languages size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-slate-500" />
        {showLabel && (
          <span className="font-medium text-slate-600">
            {language === 'ar' ? 'EN' : 'ع'}
          </span>
        )}
      </button>
    );
  }

  // Toggle style (AR/EN)
  if (variant === 'toggle') {
    return (
      <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
        <button
          onClick={() => setLanguage('ar')}
          className={`px-3 py-1.5 rounded-md transition-all font-bold text-xs ${
            language === 'ar'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ع
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-md transition-all font-bold text-xs ${
            language === 'en'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          EN
        </button>
      </div>
    );
  }

  // Dropdown style
  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors ${sizeClasses[size]}`}
      >
        <Languages size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="text-slate-500" />
        <span className="font-medium text-slate-600">
          {language === 'ar' ? 'العربية' : 'English'}
        </span>
      </button>
      <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-32">
        <button
          onClick={() => setLanguage('ar')}
          className={`w-full px-4 py-2 text-right text-sm hover:bg-slate-50 rounded-t-xl transition-colors ${
            language === 'ar' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600'
          }`}
        >
          العربية
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`w-full px-4 py-2 text-right text-sm hover:bg-slate-50 rounded-b-xl transition-colors ${
            language === 'en' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-600'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
}
