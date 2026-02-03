import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
}

export function MetricCard({ label, value, icon: Icon, iconColor = 'text-slate-500' }: MetricCardProps) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={14} className={iconColor} />}
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
