import { Bell, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Driver } from '../../types';

interface DriverHeaderProps {
  driver: Driver;
  taskCount: number;
}

export function DriverHeader({ driver, taskCount }: DriverHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-2xl border-2 border-white shadow-sm overflow-hidden">
          {driver.avatar ? (
            <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
              {driver.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('driver.home.greeting', { name: driver.name })}</h2>
          <p className="text-sm text-slate-500">
            {t('driver.home.scheduledTasks', { count: taskCount })}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 relative hover:bg-slate-50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
