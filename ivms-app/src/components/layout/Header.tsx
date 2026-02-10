import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getVehicleExpiryAlerts, getDriverExpiryAlerts, countByStatus } from '../../utils/expiryUtils';

interface HeaderProps {
  onNavigateToAlerts?: () => void;
}

export function Header({ onNavigateToAlerts }: HeaderProps) {
  const { vehicles, drivers } = useApp();

  const alertCount = useMemo(() => {
    const vehicleAlerts = getVehicleExpiryAlerts(vehicles);
    const driverAlerts = getDriverExpiryAlerts(drivers);
    const allAlerts = [...vehicleAlerts, ...driverAlerts];
    const { total } = countByStatus(allAlerts);
    return total;
  }, [vehicles, drivers]);

  return (
    <header className="mb-6 lg:mb-10 flex items-center justify-end px-4 lg:px-10 pt-4 lg:pt-10">
      {/* Actions - Hidden on mobile (already in top nav) */}
      <div className="hidden lg:flex gap-3 items-center">
        {/* Alert Icon */}
        <button
          onClick={onNavigateToAlerts}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-amber-600 hover:border-amber-100 transition-all relative"
        >
          <AlertTriangle size={18} />
          {alertCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-amber-500 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}
