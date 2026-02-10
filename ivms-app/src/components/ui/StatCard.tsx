import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'success' | 'danger' | 'warning' | 'info';
}

const iconStyles = {
  success: 'bg-emerald-50 text-emerald-600',
  danger: 'bg-rose-50 text-rose-500',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-slate-50 text-slate-600',
};

export function StatCard({ title, value, icon: Icon, trend, trendType = 'success' }: StatCardProps) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group overflow-hidden">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-xl ${iconStyles[trendType]} group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors`}>
          <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
        </div>
        {trend && (
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 truncate max-w-[50%] text-end">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-tight mb-1 truncate">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
