interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${className} ${onClick ? 'w-full text-right' : ''}`}
    >
      {children}
    </Component>
  );
}
