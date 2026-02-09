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
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconStyles[trendType]} group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors`}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-slate-500">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-tight mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
