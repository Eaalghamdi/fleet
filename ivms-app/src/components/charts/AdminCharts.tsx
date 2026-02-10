import { useState, useMemo } from 'react';
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
  Sector,
} from 'recharts';
import type { Vehicle, MaintenanceRequest, InventoryItem } from '../../types';

// ─── Shared tooltip style ───────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: 'white',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  padding: '10px 14px',
  fontSize: '13px',
  lineHeight: '1.5',
};

// ─── Custom active shape for donut hover ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
    payload, value, percent,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#1e293b" fontSize={14} fontWeight={700}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748b" fontSize={12}>
        {value} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Fleet Status Donut
// ═══════════════════════════════════════════════════════════════════════════

interface FleetStatusChartProps {
  vehicles: Vehicle[];
}

const FLEET_COLORS = ['#22c55e', '#f59e0b', '#ef4444']; // green-500, amber-500, red-500

export function FleetStatusChart({ vehicles }: FleetStatusChartProps) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const active = vehicles.filter(v => v.status === 'active').length;
    const maint = vehicles.filter(v => v.status === 'maintenance').length;
    const inactive = vehicles.filter(v => v.status === 'inactive').length;
    return [
      { name: t('dashboards.admin.charts.active'), value: active },
      { name: t('dashboards.admin.charts.inMaintenance'), value: maint },
      { name: t('dashboards.admin.charts.inactive'), value: inactive },
    ];
  }, [vehicles, t]);

  const total = vehicles.length;

  // Use state for active pie segment
  const [hoveredIndex, setHoveredIndex] = usePieHover();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          {...{ activeIndex: hoveredIndex, activeShape: renderActiveShape } as any}
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(undefined)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={FLEET_COLORS[i]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
        {hoveredIndex === undefined && (
          <>
            <text x="50%" y="41%" textAnchor="middle" dominantBaseline="central" fill="#0f172a" fontSize={28} fontWeight={800}>{total}</text>
            <text x="50%" y="52%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize={11} fontWeight={500}>{t('dashboards.admin.charts.vehicles')}</text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Maintenance by Type Bar Chart
// ═══════════════════════════════════════════════════════════════════════════

interface MaintenanceTypeChartProps {
  maintenance: MaintenanceRequest[];
}

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
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={6} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc', radius: 8 }} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
        <Bar dataKey={correctiveLabel} fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={36} />
        <Bar dataKey={preventiveLabel} fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Fleet Utilization Donut
// ═══════════════════════════════════════════════════════════════════════════

interface FleetUtilizationChartProps {
  vehicles: Vehicle[];
}

const UTIL_COLORS = ['#6366f1', '#e2e8f0']; // indigo-500, slate-200

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

  const pct = vehicles.length > 0 ? Math.round((data[0].value / vehicles.length) * 100) : 0;
  const [hoveredIndex, setHoveredIndex] = usePieHover();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          {...{ activeIndex: hoveredIndex, activeShape: renderActiveShape } as any}
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(undefined)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={UTIL_COLORS[i]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
        {hoveredIndex === undefined && (
          <>
            <text x="50%" y="41%" textAnchor="middle" dominantBaseline="central" fill="#0f172a" fontSize={28} fontWeight={800}>{pct}%</text>
            <text x="50%" y="52%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize={11} fontWeight={500}>{t('dashboards.admin.charts.utilization')}</text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Inventory Stock Levels Bar Chart
// ═══════════════════════════════════════════════════════════════════════════

interface InventoryStockChartProps {
  inventory: InventoryItem[];
}

const STOCK_PALETTE = [
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
  '#22c55e', '#eab308', '#6366f1', '#ef4444',
];

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
      }));
  }, [inventory, t]);

  const stockLabel = t('dashboards.admin.charts.currentStock');
  const minLabel = t('dashboards.admin.charts.minStock');

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} barGap={3} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={45}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc', radius: 8 }} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
        <Bar dataKey={stockLabel} radius={[6, 6, 0, 0]} maxBarSize={30}>
          {data.map((_, i) => (
            <Cell key={i} fill={STOCK_PALETTE[i % STOCK_PALETTE.length]} />
          ))}
        </Bar>
        <Bar dataKey={minLabel} radius={[6, 6, 0, 0]} maxBarSize={30} opacity={0.25}>
          {data.map((_, i) => (
            <Cell key={`min-${i}`} fill={STOCK_PALETTE[i % STOCK_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Shared hook for pie hover ────────────────────────────────────────────

function usePieHover(): [number | undefined, (v: number | undefined) => void] {
  const [idx, setIdx] = useState<number | undefined>(undefined);
  return [idx, setIdx];
}
