import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
  onClick?: () => void;
}

const colorStyles = {
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    hover: 'hover:border-emerald-200',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    hover: 'hover:border-blue-200',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    hover: 'hover:border-amber-200',
  },
  red: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    hover: 'hover:border-rose-200',
  },
};

export function ActionButton({ icon: Icon, label, color, onClick }: ActionButtonProps) {
  const styles = colorStyles[color];

  return (
    <button
      onClick={onClick}
      className={`p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm ${styles.hover} transition-all flex flex-col items-center gap-3 group`}
    >
      <div className={`p-4 ${styles.bg} ${styles.text} rounded-2xl group-hover:scale-110 transition-transform`}>
        <Icon size={28} />
      </div>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </button>
  );
}
