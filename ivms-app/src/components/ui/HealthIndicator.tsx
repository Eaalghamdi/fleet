interface HealthIndicatorProps {
  value: number;
  label?: string;
}

export function HealthIndicator({ value, label = 'صحة المركبة' }: HealthIndicatorProps) {
  const getColor = (v: number) => {
    if (v > 80) return 'bg-emerald-500';
    if (v > 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(value)} transition-all duration-1000`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
