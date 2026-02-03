interface LiveIndicatorProps {
  label?: string;
}

export function LiveIndicator({ label = 'بث مباشر للبيانات' }: LiveIndicatorProps) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
      {label}
    </span>
  );
}
