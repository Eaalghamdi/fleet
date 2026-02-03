interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
