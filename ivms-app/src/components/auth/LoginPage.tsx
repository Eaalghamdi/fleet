import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { LanguageSwitcher } from '../ui';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { direction } = useLanguage();

  const from = (location.state as LocationState)?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir={direction}>
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="toggle" />
      </div>

      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight">{t('common.appDescription')}</h1>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-5 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{t('auth.login')}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">
                {t('auth.username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder={t('auth.enterUsername')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ltr:pr-12 rtl:pl-12"
                  placeholder={t('auth.enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('auth.loggingIn')}
                </span>
              ) : (
                <>
                  <LogIn size={18} />
                  {t('auth.login')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Login Buttons */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-400 mb-3 text-center font-bold">{t('auth.quickLogin')}</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setUsername('admin'); setPassword('admin123'); }}
              className="px-3 py-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 text-xs font-bold rounded-xl transition-all"
            >
              {t('auth.systemAdmin')}
            </button>
            <button
              type="button"
              onClick={() => { setUsername('operation'); setPassword('operation123'); }}
              className="px-3 py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-bold rounded-xl transition-all"
            >
              {t('auth.operations')}
            </button>
            <button
              type="button"
              onClick={() => { setUsername('garage'); setPassword('garage123'); }}
              className="px-3 py-2.5 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-slate-600 hover:text-amber-700 text-xs font-bold rounded-xl transition-all"
            >
              {t('auth.garage')}
            </button>
            <button
              type="button"
              onClick={() => { setUsername('maintenance'); setPassword('maintenance123'); }}
              className="px-3 py-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-600 hover:text-purple-700 text-xs font-bold rounded-xl transition-all"
            >
              {t('auth.maintenance')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          {t('common.appDescription')}
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
