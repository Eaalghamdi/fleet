import { Calendar, Clock, Car, Package, Wrench, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../components/ui';
import { useDriver } from '../contexts/DriverContext';
import { useLanguage } from '../../contexts/LanguageContext';

const taskTypeIcons = {
  delivery: Package,
  pickup: Package,
  inspection: Eye,
  maintenance: Wrench,
};

const taskTypeColors = {
  delivery: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  pickup: 'bg-blue-50 text-blue-600 border-blue-100',
  inspection: 'bg-amber-50 text-amber-600 border-amber-100',
  maintenance: 'bg-rose-50 text-rose-600 border-rose-100',
};

export function Tasks() {
  const { tasks, activeTrip, startTrip, stats } = useDriver();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const taskTypeLabels = {
    delivery: t('driver.tasks.delivery'),
    pickup: t('driver.tasks.pickup'),
    inspection: t('driver.tasks.inspection'),
    maintenance: t('driver.tasks.maintenance'),
  };

  const handleStartTask = (taskId: string) => {
    if (!activeTrip) {
      startTrip(taskId);
    }
  };

  const formattedDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">{t('driver.tasks.scheduledTasks')}</h1>
        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
          <Calendar size={14} /> {t('driver.tasks.todayDate', { date: formattedDate })}
        </p>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-600">{tasks.length}</p>
          <p className="text-[10px] font-bold text-emerald-600 uppercase">{t('driver.tasks.scheduled')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-blue-600">{stats.inProgressToday}</p>
          <p className="text-[10px] font-bold text-blue-600 uppercase">{t('driver.tasks.inProgress')}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
          <p className="text-2xl font-black text-slate-600">{stats.completedToday}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">{t('driver.tasks.completed')}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">{t('driver.tasks.noScheduledTasks')}</p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const Icon = taskTypeIcons[task.type];
            return (
              <GlassCard key={task.id} className="hover:border-emerald-200 transition-colors">
                <div className="p-4 flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl border ${taskTypeColors[task.type]}`}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800">{task.title}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Car size={12} /> {task.vehicle}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${taskTypeColors[task.type]}`}
                      >
                        {taskTypeLabels[task.type]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {task.time}
                      </span>
                      {index === 0 && !activeTrip && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          {t('driver.tasks.startTask')}
                        </button>
                      )}
                      {activeTrip && (
                        <span className="text-xs text-slate-400">{t('driver.tasks.tripInProgress')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>
    </div>
  );
}
