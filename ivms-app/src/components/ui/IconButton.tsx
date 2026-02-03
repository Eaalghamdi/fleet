import type { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label?: string;
  color?: 'gray' | 'emerald' | 'rose' | 'amber' | 'slate';
  onClick?: () => void;
}

const colorStyles = {
  gray: 'hover:bg-gray-50 text-gray-600 hover:border-gray-100',
  emerald: 'hover:bg-emerald-50 text-emerald-600 hover:border-emerald-100',
  rose: 'hover:bg-rose-50 text-rose-600 hover:border-rose-100',
  amber: 'hover:bg-amber-50 text-amber-600 hover:border-amber-100',
  slate: 'hover:bg-slate-50 text-slate-600 hover:border-slate-100',
};

export function IconButton({ icon: Icon, label, color = 'gray', onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all border border-transparent flex items-center gap-2 ${colorStyles[color]}`}
    >
      <Icon size={18} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}
