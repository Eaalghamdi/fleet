import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Vehicle, MaintenanceRequest, InventoryItem } from '../../types';

// --- Fleet Status Chart (Donut) ---

interface FleetStatusChartProps {
  vehicles: Vehicle[];
}

const FLEET_STATUS_COLORS = ['#059669', '#f59e0b', '#f43f5e'];

export function FleetStatusChart({ vehicles }: FleetStatusChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const active = vehicles.filter(v => v.status === 'active').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    const inactive = vehicles.filter(v => v.status === 'inactive').length;
    return [
      { name: t('dashboards.admin.charts.active'), value: active },
      { name: t('dashboards.admin.charts.inMaintenance'), value: maintenance },
      { name: t('dashboards.admin.charts.inactive'), value: inactive },
    ];
  }, [vehicles, t]);

  const total = vehicles.length;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={FLEET_STATUS_COLORS[index]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px' }}
        />
        {/* Center label */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-800"
          style={{ fontSize: '28px', fontWeight: 800 }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="57%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-400"
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          {t('dashboards.admin.charts.vehicles')}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

// --- Maintenance by Type Chart (Bar) ---

interface MaintenanceTypeChartProps {
  maintenance: MaintenanceRequest[];
}

const MAINTENANCE_COLORS = { corrective: '#f43f5e', preventive: '#3b82f6' };

export function MaintenanceTypeChart({ maintenance }: MaintenanceTypeChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const byPriority: Record<string, { corrective: number; preventive: number }> = {
      high: { corrective: 0, preventive: 0 },
      medium: { corrective: 0, preventive: 0 },
      low: { corrective: 0, preventive: 0 },
    };
    maintenance.forEach(m => {
      if (byPriority[m.priority]) {
        byPriority[m.priority][m.type]++;
      }
    });
    return Object.entries(byPriority).map(([priority, counts]) => ({
      name: t(`priorities.${priority}`),
      [t('dashboards.admin.charts.corrective')]: counts.corrective,
      [t('dashboards.admin.charts.preventive')]: counts.preventive,
    }));
  }, [maintenance, t]);

  const correctiveLabel = t('dashboards.admin.charts.corrective');
  const preventiveLabel = t('dashboards.admin.charts.preventive');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar
          dataKey={correctiveLabel}
          fill={MAINTENANCE_COLORS.corrective}
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          dataKey={preventiveLabel}
          fill={MAINTENANCE_COLORS.preventive}
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Fleet Utilization Chart (Donut) ---

interface FleetUtilizationChartProps {
  vehicles: Vehicle[];
}

const UTILIZATION_COLORS = ['#059669', '#cbd5e1'];

export function FleetUtilizationChart({ vehicles }: FleetUtilizationChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const assigned = vehicles.filter(v => v.driver && v.driver.trim() !== '').length;
    const unassigned = vehicles.length - assigned;
    return [
      { name: t('dashboards.admin.charts.assigned'), value: assigned },
      { name: t('dashboards.admin.charts.unassigned'), value: unassigned },
    ];
  }, [vehicles, t]);

  const pct = vehicles.length > 0
    ? Math.round((data[0].value / vehicles.length) * 100)
    : 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={UTILIZATION_COLORS[index]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px' }}
        />
        {/* Center label showing utilization % */}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-800"
          style={{ fontSize: '28px', fontWeight: 800 }}
        >
          {pct}%
        </text>
        <text
          x="50%"
          y="57%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-400"
          style={{ fontSize: '11px', fontWeight: 500 }}
        >
          {t('dashboards.admin.charts.utilization')}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
}

// --- Inventory Stock Levels Chart (Bar) ---

interface InventoryStockChartProps {
  inventory: InventoryItem[];
}

export function InventoryStockChart({ inventory }: InventoryStockChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    return [...inventory]
      .sort((a, b) => (a.quantity - a.minStock) - (b.quantity - b.minStock))
      .slice(0, 8)
      .map(item => ({
        name: item.name.length > 14 ? item.name.slice(0, 12) + '...' : item.name,
        [t('dashboards.admin.charts.currentStock')]: item.quantity,
        [t('dashboards.admin.charts.minStock')]: item.minStock,
        isBelowMin: item.quantity < item.minStock,
      }));
  }, [inventory, t]);

  const stockLabel = t('dashboards.admin.charts.currentStock');
  const minLabel = t('dashboards.admin.charts.minStock');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar
          dataKey={stockLabel}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isBelowMin ? '#f43f5e' : '#059669'}
            />
          ))}
        </Bar>
        <Bar
          dataKey={minLabel}
          fill="#94a3b8"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
          opacity={0.4}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
