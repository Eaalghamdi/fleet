interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
