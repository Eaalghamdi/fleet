import type { BadgeType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  type?: BadgeType;
}

const badgeStyles: Record<BadgeType, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  danger: 'bg-rose-50 text-rose-500 border-rose-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  info: 'bg-slate-50 text-slate-600 border-slate-100',
};

export function Badge({ children, type = 'info' }: BadgeProps) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyles[type]}`}>
      {children}
    </span>
  );
}
