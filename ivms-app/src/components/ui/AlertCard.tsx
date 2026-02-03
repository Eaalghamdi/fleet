import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface AlertCardProps {
  type: 'critical' | 'warning' | 'success';
  message: string;
  time: string;
  value?: string;
  valueLabel?: string;
  onClick?: () => void;
}

const alertStyles = {
  critical: 'bg-rose-50 border-rose-100',
  warning: 'bg-amber-50 border-amber-100',
  success: 'bg-emerald-50 border-emerald-100',
};

const iconStyles = {
  critical: 'text-rose-600',
  warning: 'text-amber-600',
  success: 'text-emerald-600',
};

const textStyles = {
  critical: 'text-rose-900',
  warning: 'text-amber-900',
  success: 'text-emerald-900',
};

const IconComponent = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  success: TrendingUp,
};

export function AlertCard({ type, message, time, value, valueLabel, onClick }: AlertCardProps) {
  const Icon = IconComponent[type];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border ${alertStyles[type]} transition-all hover:scale-[1.02] cursor-pointer`}
    >
      <div className="flex items-start gap-3">
        <Icon className={iconStyles[type]} size={20} />
        <div className="space-y-1 flex-1">
          <p className={`text-sm font-bold ${textStyles[type]}`}>{message}</p>
          {value ? (
            <div className="flex items-center justify-between">
              <p className={`text-xl font-black ${textStyles[type]}`}>
                {value} {valueLabel && <span className="text-xs font-normal opacity-70">{valueLabel}</span>}
              </p>
            </div>
          ) : null}
          <p className="text-[10px] opacity-70 flex items-center gap-1">
            <Clock size={10} />
            {time}
          </p>
        </div>
      </div>
    </div>
  );
}
