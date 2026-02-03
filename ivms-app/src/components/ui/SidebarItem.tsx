import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon: Icon, label, active = false, collapsed = false, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group ${
        active
          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? label : undefined}
    >
      <Icon size={22} className={active ? 'text-white' : 'group-hover:text-emerald-400 transition-colors'} />
      {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
    </button>
  );
}
