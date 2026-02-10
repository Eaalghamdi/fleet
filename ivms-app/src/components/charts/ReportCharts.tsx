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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { Vehicle, MaintenanceRequest, InventoryItem, CarRequest, Driver } from '../../types';

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

function usePieHover(): [number | undefined, (v: number | undefined) => void] {
  const [idx, setIdx] = useState<number | undefined>(undefined);
  return [idx, setIdx];
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Vehicle Mileage Distribution
// ═══════════════════════════════════════════════════════════════════════════

const MILEAGE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function VehicleMileageChart({ vehicles }: { vehicles: Vehicle[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const ranges = [
      { name: '0-20K', min: 0, max: 20000 },
      { name: '20K-50K', min: 20000, max: 50000 },
      { name: '50K-80K', min: 50000, max: 80000 },
      { name: '80K-100K', min: 80000, max: 100000 },
      { name: '100K+', min: 100000, max: Infinity },
    ];
    return ranges.map(r => ({
      name: r.name,
      [t('pages.reports.charts.vehicles')]: vehicles.filter(v => v.mileage >= r.min && v.mileage < r.max).length,
    }));
  }, [vehicles, t]);

  const label = t('pages.reports.charts.vehicles');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc', radius: 8 }} />
        <Bar dataKey={label} radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, i) => (
            <Cell key={i} fill={MILEAGE_COLORS[i % MILEAGE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Fuel Level Distribution
// ═══════════════════════════════════════════════════════════════════════════

const FUEL_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#10b981'];

export function FuelLevelChart({ vehicles }: { vehicles: Vehicle[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const ranges = [
      { name: t('pages.reports.charts.critical'), min: 0, max: 20 },
      { name: t('pages.reports.charts.low'), min: 20, max: 50 },
      { name: t('pages.reports.charts.normal'), min: 50, max: 80 },
      { name: t('pages.reports.charts.full'), min: 80, max: 101 },
    ];
    return ranges.map(r => ({
      name: r.name,
      value: vehicles.filter(v => v.fuel >= r.min && v.fuel < r.max).length,
    }));
  }, [vehicles, t]);

  const [hoveredIndex, setHoveredIndex] = usePieHover();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          {...{ activeIndex: hoveredIndex, activeShape: renderActiveShape } as any}
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(undefined)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={FUEL_COLORS[i]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Car Request Status Distribution
// ═══════════════════════════════════════════════════════════════════════════

const REQUEST_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#6366f1', '#10b981', '#94a3b8'];

export function CarRequestStatusChart({ carRequests }: { carRequests: CarRequest[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const statuses: { key: CarRequest['status']; label: string }[] = [
      { key: 'pending', label: t('carRequestStatuses.pending') },
      { key: 'assigned', label: t('carRequestStatuses.assigned') },
      { key: 'approved', label: t('carRequestStatuses.approved') },
      { key: 'rejected', label: t('carRequestStatuses.rejected') },
      { key: 'in_transit', label: t('carRequestStatuses.inTransit') },
      { key: 'returned', label: t('carRequestStatuses.returned') },
      { key: 'cancelled', label: t('carRequestStatuses.cancelled') },
    ];
    return statuses
      .map(s => ({
        name: s.label,
        value: carRequests.filter(r => r.status === s.key).length,
      }))
      .filter(d => d.value > 0);
  }, [carRequests, t]);

  const [hoveredIndex, setHoveredIndex] = usePieHover();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          {...{ activeIndex: hoveredIndex, activeShape: renderActiveShape } as any}
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(undefined)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={REQUEST_COLORS[i % REQUEST_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Fleet Age Distribution
// ═══════════════════════════════════════════════════════════════════════════

const AGE_PALETTE = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#22c55e'];

export function FleetAgeChart({ vehicles }: { vehicles: Vehicle[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const yearCounts: Record<number, number> = {};
    vehicles.forEach(v => {
      yearCounts[v.year] = (yearCounts[v.year] || 0) + 1;
    });
    return Object.entries(yearCounts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, count]) => ({
        name: year,
        [t('pages.reports.charts.vehicles')]: count,
      }));
  }, [vehicles, t]);

  const label = t('pages.reports.charts.vehicles');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc', radius: 8 }} />
        <Bar dataKey={label} radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((_, i) => (
            <Cell key={i} fill={AGE_PALETTE[i % AGE_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Maintenance Status Trend (Area Chart)
// ═══════════════════════════════════════════════════════════════════════════

export function MaintenanceStatusChart({ maintenance }: { maintenance: MaintenanceRequest[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const statusCounts = [
      { name: t('statuses.pendingApproval'), value: maintenance.filter(m => m.status === 'pending_approval').length, fill: '#f59e0b' },
      { name: t('statuses.inProgress'), value: maintenance.filter(m => m.status === 'in_progress').length, fill: '#3b82f6' },
      { name: t('statuses.scheduled'), value: maintenance.filter(m => m.status === 'scheduled').length, fill: '#8b5cf6' },
      { name: t('statuses.completed'), value: maintenance.filter(m => m.status === 'completed').length, fill: '#22c55e' },
    ];
    return statusCounts;
  }, [maintenance, t]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc', radius: 8 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Inventory Category Distribution
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_COLORS = ['#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#22c55e', '#eab308', '#6366f1', '#ef4444'];

export function InventoryCategoryChart({ inventory }: { inventory: InventoryItem[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const cats: Record<string, number> = {};
    inventory.forEach(item => {
      cats[item.category] = (cats[item.category] || 0) + item.quantity;
    });
    return Object.entries(cats).map(([cat, qty]) => ({
      name: cat,
      [t('pages.reports.charts.quantity')]: qty,
    }));
  }, [inventory, t]);

  const label = t('pages.reports.charts.quantity');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="20%">
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
        <Bar dataKey={label} radius={[6, 6, 0, 0]} maxBarSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. Driver License Type Distribution
// ═══════════════════════════════════════════════════════════════════════════

const LICENSE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6'];

export function DriverLicenseChart({ drivers }: { drivers: Driver[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const types: { key: string; label: string }[] = [
      { key: 'private', label: t('pages.drivers.licenseTypes.private') },
      { key: 'public', label: t('pages.drivers.licenseTypes.public') },
      { key: 'heavy', label: t('pages.drivers.licenseTypes.heavy') },
      { key: 'motorcycle', label: t('pages.drivers.licenseTypes.motorcycle') },
    ];
    return types
      .map(typ => ({
        name: typ.label,
        value: drivers.filter(d => d.license.type === typ.key).length,
      }))
      .filter(d => d.value > 0);
  }, [drivers, t]);

  const [hoveredIndex, setHoveredIndex] = usePieHover();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          {...{ activeIndex: hoveredIndex, activeShape: renderActiveShape } as any}
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
          onMouseEnter={(_, index) => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(undefined)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={LICENSE_COLORS[i % LICENSE_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Fleet Brand Distribution
// ═══════════════════════════════════════════════════════════════════════════

const BRAND_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#ef4444'];

export function FleetBrandChart({ vehicles }: { vehicles: Vehicle[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const brands: Record<string, number> = {};
    vehicles.forEach(v => {
      brands[v.brand] = (brands[v.brand] || 0) + 1;
    });
    return Object.entries(brands)
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => ({
        name: brand,
        [t('pages.reports.charts.vehicles')]: count,
      }));
  }, [vehicles, t]);

  const label = t('pages.reports.charts.vehicles');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc', radius: 8 }} />
        <Bar dataKey={label} radius={[0, 6, 6, 0]} maxBarSize={24}>
          {data.map((_, i) => (
            <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. Monthly Fuel Consumption Trend (Area)
// ═══════════════════════════════════════════════════════════════════════════

export function FuelTrendChart({ fuelData }: { fuelData: { month: string; value: number }[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    return fuelData.map(d => ({
      name: d.month,
      [t('pages.reports.charts.consumption')]: d.value * 100,
    }));
  }, [fuelData, t]);

  const label = t('pages.reports.charts.consumption');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={label} stroke="#06b6d4" strokeWidth={2} fill="url(#fuelGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. Maintenance Priority Radar
// ═══════════════════════════════════════════════════════════════════════════

export function MaintenancePriorityRadar({ maintenance }: { maintenance: MaintenanceRequest[] }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const priorities = ['high', 'medium', 'low'] as const;
    return priorities.map(p => ({
      subject: t(`priorities.${p}`),
      [t('maintenanceTypes.corrective')]: maintenance.filter(m => m.priority === p && m.type === 'corrective').length,
      [t('maintenanceTypes.preventive')]: maintenance.filter(m => m.priority === p && m.type === 'preventive').length,
    }));
  }, [maintenance, t]);

  const correctiveLabel = t('maintenanceTypes.corrective');
  const preventiveLabel = t('maintenanceTypes.preventive');

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
        <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Radar name={correctiveLabel} dataKey={correctiveLabel} stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
        <Radar name={preventiveLabel} dataKey={preventiveLabel} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{value}</span>}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
