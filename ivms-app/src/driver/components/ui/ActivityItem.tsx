import type { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
}

const colorStyles = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
};

export function ActivityItem({ icon: Icon, title, description, time, color }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className={`p-2.5 rounded-xl ${colorStyles[color]}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
        <p className="text-[11px] text-slate-500 truncate">{description}</p>
      </div>
      <span className="text-[10px] text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
