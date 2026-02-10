import { useMemo, useState } from 'react';
import {
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  TrendingUp,
  Check,
  History,
  Wrench,
  Package,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatCard, GlassCard, Modal } from '../../components/ui';
import { useApp } from '../../contexts/AppContext';
import {
  FleetStatusChart,
  MaintenanceTypeChart,
  FleetUtilizationChart,
  InventoryStockChart,
} from '../../components/charts/AdminCharts';

// Types for request data with comprehensive details
interface CarRequest {
  id: string;
  type: string;
  requester: string;
  department: string;
  date: string;
  priority: string;
  // Additional details from operation
  departureLocation: string;
  destination: string;
  departureDatetime: string;
  returnDatetime: string;
  requestedCarType: 'sedan' | 'suv' | 'truck';
  description: string | null;
  isRental: boolean;
  rentalCompanyName: string | null;
  assignedCarPlate: string | null;
  createdBy: string;
  createdAt: string;
}

interface MaintenanceRequest {
  id: string;
  type: string;
  vehicle: string;
  description: string;
  cost: string;
  date: string;
  // Additional details from maintenance
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  maintenanceType: 'corrective' | 'preventive';
  priority: 'high' | 'medium' | 'low';
  status: string;
  estimatedDuration: string;
  requestedBy: string;
  notes: string | null;
  createdAt: string;
}

interface InventoryRequest {
  id: string;
  type: string;
  item: string;
  requestedBy: string;
  cost: string;
  date: string;
  // Additional details from inventory/garage
  partName: string;
  quantity: number;
  estimatedCost: number;
  vendor: string | null;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  reason: string;
  currentStock: number;
  minStock: number;
  createdAt: string;
}

interface AddVehicleRequest {
  id: string;
  type: string;
  plate: string;
  brand: string;
  requestedBy: string;
  date: string;
  // Additional details from garage
  model: string;
  year: number;
  carType: 'sedan' | 'suv' | 'truck';
  color: string | null;
  vin: string | null;
  fuelType: string;
  currentMileage: number | null;
  reason: string;
  createdAt: string;
}

type RequestType = CarRequest | MaintenanceRequest | InventoryRequest | AddVehicleRequest;

type TabType = 'carRequests' | 'maintenance' | 'inventory' | 'carInventory';

type ApprovedRequestType = 'carRequest' | 'maintenance' | 'inventory' | 'addVehicle';

interface ApprovedRequestItem {
  id: string;
  type: ApprovedRequestType;
  description: string;
  requester: string;
  approvedAt: string;
  approvedBy: string;
}

// Mock approved requests data
const mockApprovedRequests: ApprovedRequestItem[] = [
  { id: 'CR-098', type: 'carRequest', description: 'Vehicle for site visit', requester: 'Ahmed Mohammed', approvedAt: '2024-01-31 14:30', approvedBy: 'Admin' },
  { id: 'MR-045', type: 'maintenance', description: 'Oil change - ABC 1234', requester: 'Garage', approvedAt: '2024-01-30 10:15', approvedBy: 'Admin' },
  { id: 'PR-022', type: 'inventory', description: 'Brake pads (20 units)', requester: 'Maintenance', approvedAt: '2024-01-28 16:45', approvedBy: 'Admin' },
  { id: 'CI-015', type: 'addVehicle', description: 'Toyota Hilux - NEW 9876', requester: 'Operations', approvedAt: '2024-01-25 09:00', approvedBy: 'Admin' },
];

// Mock pending approvals data with comprehensive details
const mockPendingApprovals = {
  carRequests: [
    {
      id: 'CR-001',
      type: 'car_request',
      requester: 'Ahmed Mohammed',
      department: 'Operations',
      date: '2024-01-15',
      priority: 'high',
      departureLocation: 'Riyadh Main Office',
      destination: 'Jeddah Branch',
      departureDatetime: '2024-01-16T08:00:00',
      returnDatetime: '2024-01-18T18:00:00',
      requestedCarType: 'suv' as const,
      description: 'Client meeting and site inspection at Jeddah branch office',
      isRental: false,
      rentalCompanyName: null,
      assignedCarPlate: 'ABC 1234',
      createdBy: 'Ahmed Mohammed',
      createdAt: '2024-01-15T10:30:00',
    },
    {
      id: 'CR-002',
      type: 'car_request',
      requester: 'Saad Al-Ali',
      department: 'Operations',
      date: '2024-01-14',
      priority: 'medium',
      departureLocation: 'Dammam Office',
      destination: 'Al Khobar Industrial Area',
      departureDatetime: '2024-01-15T09:00:00',
      returnDatetime: '2024-01-15T17:00:00',
      requestedCarType: 'sedan' as const,
      description: 'Equipment delivery and vendor coordination',
      isRental: true,
      rentalCompanyName: 'Budget Rent a Car',
      assignedCarPlate: null,
      createdBy: 'Saad Al-Ali',
      createdAt: '2024-01-14T14:20:00',
    },
    {
      id: 'CR-003',
      type: 'car_request',
      requester: 'Mohammed Salem',
      department: 'Maintenance',
      date: '2024-01-13',
      priority: 'high',
      departureLocation: 'Maintenance Workshop',
      destination: 'Spare Parts Supplier - Industrial City',
      departureDatetime: '2024-01-14T07:30:00',
      returnDatetime: '2024-01-14T14:00:00',
      requestedCarType: 'truck' as const,
      description: 'Urgent pickup of engine parts for vehicle repair',
      isRental: false,
      rentalCompanyName: null,
      assignedCarPlate: 'TRK 5678',
      createdBy: 'Mohammed Salem',
      createdAt: '2024-01-13T16:45:00',
    },
  ],
  maintenance: [
    {
      id: 'MR-001',
      type: 'maintenance',
      vehicle: 'ABC 1234',
      description: 'Oil change and filter replacement',
      cost: '500 SAR',
      date: '2024-01-15',
      vehiclePlate: 'ABC 1234',
      vehicleBrand: 'Toyota',
      vehicleModel: 'Camry 2022',
      maintenanceType: 'preventive' as const,
      priority: 'medium' as const,
      status: 'pending_approval',
      estimatedDuration: '2 hours',
      requestedBy: 'Garage Team',
      notes: 'Vehicle has completed 10,000 km since last service. Recommend checking brake pads as well.',
      createdAt: '2024-01-15T08:00:00',
    },
    {
      id: 'MR-002',
      type: 'maintenance',
      vehicle: 'XYZ 5678',
      description: 'Full vehicle inspection and brake system repair',
      cost: '1200 SAR',
      date: '2024-01-14',
      vehiclePlate: 'XYZ 5678',
      vehicleBrand: 'Hyundai',
      vehicleModel: 'Sonata 2021',
      maintenanceType: 'corrective' as const,
      priority: 'high' as const,
      status: 'pending_approval',
      estimatedDuration: '4 hours',
      requestedBy: 'Driver Reported Issue',
      notes: 'Driver reported unusual brake noise and vibration. Safety priority - vehicle should not be used until repaired.',
      createdAt: '2024-01-14T11:30:00',
    },
  ],
  inventory: [
    {
      id: 'PR-001',
      type: 'purchase',
      item: 'Oil Filter (10)',
      requestedBy: 'Garage',
      cost: '800 SAR',
      date: '2024-01-15',
      partName: 'Oil Filter - Universal',
      quantity: 10,
      estimatedCost: 800,
      vendor: 'Auto Parts Wholesale Co.',
      category: 'Filters',
      urgency: 'medium' as const,
      reason: 'Regular restocking for scheduled maintenance. Current stock running low.',
      currentStock: 3,
      minStock: 10,
      createdAt: '2024-01-15T09:15:00',
    },
    {
      id: 'PR-002',
      type: 'purchase',
      item: 'Tires (4)',
      requestedBy: 'Maintenance',
      cost: '2400 SAR',
      date: '2024-01-14',
      partName: 'Michelin All-Season Tires 225/55R17',
      quantity: 4,
      estimatedCost: 2400,
      vendor: 'Tire Kingdom Saudi',
      category: 'Tires',
      urgency: 'high' as const,
      reason: 'Urgent replacement needed for vehicle XYZ 5678 - tires below safe tread depth.',
      currentStock: 0,
      minStock: 4,
      createdAt: '2024-01-14T13:00:00',
    },
  ],
  carInventory: [
    {
      id: 'CI-001',
      type: 'add_vehicle',
      plate: 'NEW 1234',
      brand: 'Toyota',
      requestedBy: 'Garage',
      date: '2024-01-15',
      model: 'Hilux',
      year: 2024,
      carType: 'truck' as const,
      color: 'White',
      vin: '1HGBH41JXMN109186',
      fuelType: 'Diesel',
      currentMileage: 0,
      reason: 'Fleet expansion to meet increased operational demand for cargo transport.',
      createdAt: '2024-01-15T10:00:00',
    },
    {
      id: 'CI-002',
      type: 'add_vehicle',
      plate: 'NEW 5678',
      brand: 'Hyundai',
      requestedBy: 'Admin',
      date: '2024-01-14',
      model: 'Sonata',
      year: 2024,
      carType: 'sedan' as const,
      color: 'Silver',
      vin: '5NPE24AF8FH123456',
      fuelType: 'Petrol',
      currentMileage: 150,
      reason: 'Executive vehicle for management team transportation.',
      createdAt: '2024-01-14T15:30:00',
    },
  ],
};

const tabs: { key: TabType; icon: typeof Car; color: string; bgColor: string }[] = [
  { key: 'carRequests', icon: Car, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { key: 'maintenance', icon: Wrench, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { key: 'inventory', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { key: 'carInventory', icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
];

export function AdminDashboard() {
  const { t } = useTranslation();
  const { vehicles, maintenance, inventory, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('carRequests');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(null);

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const pendingApprovals = mockPendingApprovals.carRequests.length +
                            mockPendingApprovals.maintenance.length +
                            mockPendingApprovals.inventory.length +
                            mockPendingApprovals.carInventory.length;
    const completedToday = 5;
    return { totalVehicles, activeVehicles, pendingApprovals, completedToday };
  }, [vehicles]);

  const currentRequests = mockPendingApprovals[activeTab];

  const getTabLabel = (key: TabType) => {
    const labels: Record<TabType, string> = {
      carRequests: t('dashboards.admin.carRequests'),
      maintenance: t('dashboards.admin.maintenanceRequests'),
      inventory: t('dashboards.admin.purchaseRequests'),
      carInventory: t('dashboards.admin.addVehicleRequests'),
    };
    return labels[key];
  };

  const getTypeKey = (tab: TabType): string => {
    const keys: Record<TabType, string> = {
      carRequests: 'request',
      maintenance: 'maintenanceRequest',
      inventory: 'purchaseRequest',
      carInventory: 'addRequest',
    };
    return keys[tab];
  };

  const handleRowClick = (request: RequestType) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleCheckboxChange = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === currentRequests.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(currentRequests.map(r => r.id)));
    }
  };

  const handleApprove = (id: string) => {
    showToast(t('dashboards.admin.approvedRequest', { type: t(`dashboards.admin.${getTypeKey(activeTab)}`), id }), 'success');
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    showToast(t('dashboards.admin.rejectedRequest', { type: t(`dashboards.admin.${getTypeKey(activeTab)}`), id }), 'warning');
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleBulkApprove = () => {
    if (selectedItems.size === 0) return;
    showToast(t('dashboards.admin.bulkApproved', { count: selectedItems.size }), 'success');
    setSelectedItems(new Set());
  };

  const handleBulkReject = () => {
    if (selectedItems.size === 0) return;
    showToast(t('dashboards.admin.bulkRejected', { count: selectedItems.size }), 'warning');
    setSelectedItems(new Set());
  };

  // Render table columns based on active tab
  const renderTableHeader = () => {
    switch (activeTab) {
      case 'carRequests':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requester')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.department')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.priority')}</th>
          </tr>
        );
      case 'maintenance':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('vehicles.vehicle')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.description')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('maintenance.cost')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
          </tr>
        );
      case 'inventory':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.item')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('requests.requestedBy')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('maintenance.cost')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
          </tr>
        );
      case 'carInventory':
        return (
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-3 px-4 text-start">
              <input
                type="checkbox"
                checked={selectedItems.size === currentRequests.length && currentRequests.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('vehicles.plateNumber')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.vehicleBrand')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('requests.requestedBy')}</th>
            <th className="py-3 px-4 text-start font-semibold">{t('common.date')}</th>
          </tr>
        );
    }
  };

  const renderTableRow = (request: RequestType) => {
    const isSelected = selectedItems.has(request.id);

    switch (activeTab) {
      case 'carRequests': {
        const req = request as CarRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.requester}</td>
            <td className="py-3 px-4 text-slate-600">{req.department}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
            <td className="py-3 px-4">
              <span className={`text-xs font-medium ${req.priority === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>{t(`priorities.${req.priority}`)}</span>
            </td>
          </tr>
        );
      }
      case 'maintenance': {
        const req = request as MaintenanceRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.vehicle}</td>
            <td className="py-3 px-4 text-slate-600">{req.description}</td>
            <td className="py-3 px-4 text-slate-600">{req.cost}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
          </tr>
        );
      }
      case 'inventory': {
        const req = request as InventoryRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.item}</td>
            <td className="py-3 px-4 text-slate-600">{req.requestedBy}</td>
            <td className="py-3 px-4 text-slate-600">{req.cost}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
          </tr>
        );
      }
      case 'carInventory': {
        const req = request as AddVehicleRequest;
        return (
          <tr
            key={req.id}
            onClick={() => handleRowClick(req)}
            className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(req.id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td className="py-3 px-4 font-medium text-slate-800">{req.id}</td>
            <td className="py-3 px-4 text-slate-600">{req.plate}</td>
            <td className="py-3 px-4 text-slate-600">{req.brand}</td>
            <td className="py-3 px-4 text-slate-600">{req.requestedBy}</td>
            <td className="py-3 px-4 text-slate-600">{req.date}</td>
          </tr>
        );
      }
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString();
  };

  const renderModalContent = () => {
    if (!selectedRequest) return null;

    switch (activeTab) {
      case 'carRequests': {
        const req = selectedRequest as CarRequest;
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{req.id}</p>
                <p className="text-sm text-slate-500">{t('dashboards.admin.carRequests')}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${req.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{t(`priorities.${req.priority}`)}</span>
            </div>

            {/* Requester Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.requester')}</p>
                <p className="text-sm font-medium text-slate-800">{req.requester}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.department')}</p>
                <p className="text-sm font-medium text-slate-800">{req.department}</p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-600 mb-3">{t('dashboards.admin.tripDetails')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.operation.departureLocation')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.departureLocation}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.operation.destination')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.destination}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.operation.departureDatetime')}</p>
                  <p className="text-sm font-medium text-slate-800">{formatDateTime(req.departureDatetime)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.operation.returnDatetime')}</p>
                  <p className="text-sm font-medium text-slate-800">{formatDateTime(req.returnDatetime)}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-600 mb-3">{t('dashboards.admin.vehicleDetails')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.operation.carType')}</p>
                  <p className="text-sm font-medium text-slate-800">{t(`dashboards.operation.${req.requestedCarType}`)}</p>
                </div>
                {req.assignedCarPlate && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.assignedVehicle')}</p>
                    <p className="text-sm font-medium text-slate-800">{req.assignedCarPlate}</p>
                  </div>
                )}
              </div>
              {req.isRental && req.rentalCompanyName && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <span className="text-sm text-amber-700">
                    {t('dashboards.operation.isRental')}: {req.rentalCompanyName}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {req.description && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">{t('common.description')}</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{req.description}</p>
              </div>
            )}

            {/* Audit Info */}
            <div className="border-t border-slate-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">{t('dashboards.operation.createdBy')}:</span>{' '}
                  <span className="font-medium text-slate-700">{req.createdBy}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('dashboards.operation.createdAt')}:</span>{' '}
                  <span className="font-medium text-slate-700">{formatDateTime(req.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'maintenance': {
        const req = selectedRequest as MaintenanceRequest;
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{req.id}</p>
                <p className="text-sm text-slate-500">{t('dashboards.admin.maintenanceRequests')}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${req.priority === 'high' ? 'bg-rose-100 text-rose-700' : req.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {t(`priorities.${req.priority}`)}
              </span>
            </div>

            {/* Vehicle Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('vehicles.plateNumber')}</p>
                <p className="text-sm font-medium text-slate-800">{req.vehiclePlate}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('vehicles.vehicle')}</p>
                <p className="text-sm font-medium text-slate-800">{req.vehicleBrand} {req.vehicleModel}</p>
              </div>
            </div>

            {/* Maintenance Details */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-600 mb-3">{t('dashboards.admin.maintenanceDetails')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('pages.maintenance.maintenanceType')}</p>
                  <p className="text-sm font-medium text-slate-800">{t(`maintenanceTypes.${req.maintenanceType}`)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('maintenance.cost')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.cost}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.estimatedDuration')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.estimatedDuration}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('requests.requestedBy')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.requestedBy}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">{t('common.description')}</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{req.description}</p>
            </div>

            {/* Notes */}
            {req.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs text-amber-600 uppercase tracking-wide font-semibold mb-2">{t('dashboards.admin.additionalNotes')}</p>
                <p className="text-sm text-amber-700">{req.notes}</p>
              </div>
            )}

            {/* Audit Info */}
            <div className="border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">{t('dashboards.operation.createdAt')}:</span>{' '}
              <span className="font-medium text-slate-700">{formatDateTime(req.createdAt)}</span>
            </div>
          </div>
        );
      }
      case 'inventory': {
        const req = selectedRequest as InventoryRequest;
        const stockStatus = req.currentStock <= req.minStock ? 'danger' : 'success';
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{req.id}</p>
                <p className="text-sm text-slate-500">{t('dashboards.admin.purchaseRequests')}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${req.urgency === 'high' ? 'bg-rose-100 text-rose-700' : req.urgency === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                {t(`priorities.${req.urgency}`)}
              </span>
            </div>

            {/* Part Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.partName')}</p>
                <p className="text-sm font-medium text-slate-800">{req.partName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.category')}</p>
                <p className="text-sm font-medium text-slate-800">{req.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.quantity')}</p>
                <p className="text-sm font-medium text-slate-800">{req.quantity}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.estimatedCost')}</p>
                <p className="text-sm font-medium text-slate-800">{req.estimatedCost} SAR</p>
              </div>
            </div>

            {/* Vendor & Stock Info */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-600 mb-3">{t('dashboards.admin.vendorAndStock')}</p>
              <div className="grid grid-cols-2 gap-4">
                {req.vendor && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.vendor')}</p>
                    <p className="text-sm font-medium text-slate-800">{req.vendor}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('requests.requestedBy')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.requestedBy}</p>
                </div>
              </div>

              {/* Stock Level Indicator */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{t('dashboards.admin.stockLevel')}</span>
                  <span className={`text-xs font-medium ${stockStatus === 'danger' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {req.currentStock} / {req.minStock} {t('dashboards.admin.minStock')}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stockStatus === 'danger' ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((req.currentStock / req.minStock) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">{t('dashboards.admin.reason')}</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{req.reason}</p>
            </div>

            {/* Audit Info */}
            <div className="border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">{t('dashboards.operation.createdAt')}:</span>{' '}
              <span className="font-medium text-slate-700">{formatDateTime(req.createdAt)}</span>
            </div>
          </div>
        );
      }
      case 'carInventory': {
        const req = selectedRequest as AddVehicleRequest;
        return (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{req.id}</p>
                <p className="text-sm text-slate-500">{t('dashboards.admin.addVehicleRequests')}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">{t('dashboards.admin.newVehicle')}</span>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('vehicles.plateNumber')}</p>
                <p className="text-sm font-medium text-slate-800">{req.plate}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.vehicleBrand')}</p>
                <p className="text-sm font-medium text-slate-800">{req.brand} {req.model}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.year')}</p>
                <p className="text-sm font-medium text-slate-800">{req.year}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.operation.carType')}</p>
                <p className="text-sm font-medium text-slate-800">{t(`dashboards.operation.${req.carType}`)}</p>
              </div>
              {req.color && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.color')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.color}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.fuelType')}</p>
                <p className="text-sm font-medium text-slate-800">{req.fuelType}</p>
              </div>
              {req.currentMileage !== null && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.mileage')}</p>
                  <p className="text-sm font-medium text-slate-800">{req.currentMileage} km</p>
                </div>
              )}
              {req.vin && (
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{t('dashboards.admin.vin')}</p>
                  <p className="text-sm font-medium text-slate-800 font-mono">{req.vin}</p>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">{t('dashboards.admin.reason')}</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{req.reason}</p>
            </div>

            {/* Requester & Audit Info */}
            <div className="border-t border-slate-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">{t('requests.requestedBy')}:</span>{' '}
                  <span className="font-medium text-slate-700">{req.requestedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('dashboards.operation.createdAt')}:</span>{' '}
                  <span className="font-medium text-slate-700">{formatDateTime(req.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('dashboards.admin.title')}</h1>
        <p className="text-slate-500 text-sm">{t('dashboards.admin.description')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboards.admin.totalVehicles')}
          value={stats.totalVehicles.toString()}
          icon={Car}
          trend={`${stats.activeVehicles} ${t('dashboards.admin.active')}`}
          trendType="success"
        />
        <StatCard
          title={t('dashboards.admin.pendingApprovals')}
          value={stats.pendingApprovals.toString()}
          icon={Clock}
          trend={t('dashboards.admin.needsReview')}
          trendType={stats.pendingApprovals > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title={t('dashboards.admin.requestsToday')}
          value={stats.completedToday.toString()}
          icon={FileText}
          trend={t('dashboards.admin.completed')}
          trendType="success"
        />
        <StatCard
          title={t('dashboards.admin.activeUsers')}
          value="12"
          icon={Users}
          trend={t('dashboards.admin.onlineNow')}
          trendType="info"
        />
      </div>

      {/* Fleet Analytics Charts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t('dashboards.admin.charts.fleetAnalytics')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t('dashboards.admin.charts.fleetStatus')}</h3>
            <FleetStatusChart vehicles={vehicles} />
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t('dashboards.admin.charts.maintenanceByType')}</h3>
            <MaintenanceTypeChart maintenance={maintenance} />
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t('dashboards.admin.charts.fleetUtilization')}</h3>
            <FleetUtilizationChart vehicles={vehicles} />
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">{t('dashboards.admin.charts.inventoryStock')}</h3>
            <InventoryStockChart inventory={inventory} />
          </GlassCard>
        </div>
      </div>

      {/* Pending Approvals Section with Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{t('dashboards.admin.pendingApprovalsSection')}</h2>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            {stats.pendingApprovals} {t('dashboards.admin.pending')}
          </span>
        </div>

        <GlassCard>
          {/* Tab Navigation */}
          <div className="border-b border-slate-100">
            <div className="flex">
              {tabs.map((tab) => {
                const count = mockPendingApprovals[tab.key].length;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSelectedItems(new Set());
                    }}
                    className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'text-emerald-600 border-b-2 border-emerald-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {getTabLabel(tab.key)}
                    {count > 0 && (
                      <span className="bg-slate-400 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-3 mx-6 mt-4 p-3 bg-blue-50 rounded-xl">
              <span className="text-sm text-blue-700 font-medium">
                {t('dashboards.admin.selectedCount', { count: selectedItems.size })}
              </span>
              <div className="flex gap-2 ms-auto">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <Check size={16} />
                  {t('dashboards.admin.approveSelected')}
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle size={16} />
                  {t('dashboards.admin.rejectSelected')}
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {renderTableHeader()}
              </thead>
              <tbody className="text-sm">
                {currentRequests.length > 0 ? (
                  currentRequests.map(renderTableRow)
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {t('dashboards.admin.noPendingRequests')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Recent Approved Requests */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <History size={20} className="text-slate-400" />
          <h3 className="font-bold text-slate-800">{t('dashboards.admin.recentApprovals')}</h3>
        </div>

        <GlassCard className="p-6">
          {mockApprovedRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestId')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requestType')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('common.description')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.requester')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.approvedAt')}</th>
                  <th className="py-3 px-4 text-start font-semibold">{t('dashboards.admin.approvedBy')}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {mockApprovedRequests.map((request) => {
                  const typeLabels: Record<ApprovedRequestType, string> = {
                    carRequest: t('dashboards.admin.carRequests'),
                    maintenance: t('dashboards.admin.maintenanceRequests'),
                    inventory: t('dashboards.admin.purchaseRequests'),
                    addVehicle: t('dashboards.admin.addVehicleRequests'),
                  };

                  return (
                    <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{request.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{typeLabels[request.type]}</td>
                      <td className="py-3 px-4 text-slate-600">{request.description}</td>
                      <td className="py-3 px-4 text-slate-600">{request.requester}</td>
                      <td className="py-3 px-4 text-slate-600">{request.approvedAt}</td>
                      <td className="py-3 px-4 text-slate-600">{request.approvedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            {t('dashboards.admin.noApprovedRequests')}
          </div>
          )}
        </GlassCard>
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRequest(null);
        }}
        title={t('dashboards.admin.requestDetails')}
        size="lg"
      >
        <div className="p-6">
          {renderModalContent()}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => selectedRequest && handleApprove(selectedRequest.id)}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              {t('dashboards.admin.approve')}
            </button>
            <button
              onClick={() => selectedRequest && handleReject(selectedRequest.id)}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              {t('dashboards.admin.reject')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}