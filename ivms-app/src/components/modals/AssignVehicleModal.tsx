import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Car, Building2, MapPin, Calendar, User, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { Vehicle } from '../../types';

interface CarRequestInfo {
  id: string;
  carType: string;
  departureLocation: string;
  destination: string;
  departureDateTime: string;
  returnDateTime: string;
  createdBy: string;
}

interface AssignVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CarRequestInfo | null;
  availableVehicles: Vehicle[];
  onAssignFleetVehicle: (requestId: string, vehicleId: string, vehiclePlate: string) => void;
  onAssignRentalCar: (requestId: string, rentalCompanyId: string, rentalCompanyName: string) => void;
}

// Mock rental companies - in production, this would come from the backend
const rentalCompanies = [
  { id: 'RC-001', name: 'Budget Rent a Car' },
  { id: 'RC-002', name: 'Hertz Saudi Arabia' },
  { id: 'RC-003', name: 'Avis Car Rental' },
  { id: 'RC-004', name: 'Enterprise Rent-A-Car' },
  { id: 'RC-005', name: 'Theeb Rent a Car' },
];

export function AssignVehicleModal({
  isOpen,
  onClose,
  request,
  availableVehicles,
  onAssignFleetVehicle,
  onAssignRentalCar,
}: AssignVehicleModalProps) {
  const { t } = useTranslation();
  const [assignmentType, setAssignmentType] = useState<'fleet' | 'rental' | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedRentalCompanyId, setSelectedRentalCompanyId] = useState<string>('');

  const handleClose = () => {
    setAssignmentType(null);
    setSelectedVehicleId('');
    setSelectedRentalCompanyId('');
    onClose();
  };

  const handleAssign = () => {
    if (!request) return;

    if (assignmentType === 'fleet' && selectedVehicleId) {
      const vehicle = availableVehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        onAssignFleetVehicle(request.id, vehicle.id, vehicle.plate);
        handleClose();
      }
    } else if (assignmentType === 'rental' && selectedRentalCompanyId) {
      const company = rentalCompanies.find(c => c.id === selectedRentalCompanyId);
      if (company) {
        onAssignRentalCar(request.id, company.id, company.name);
        handleClose();
      }
    }
  };

  const canAssign =
    (assignmentType === 'fleet' && selectedVehicleId) ||
    (assignmentType === 'rental' && selectedRentalCompanyId);

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('dashboards.garage.assignVehicle')}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Request Details */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Car size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{request.id}</p>
              <p className="text-sm text-slate-500">{t('dashboards.garage.carType')}: {request.carType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t('dashboards.garage.departureLocation')}</p>
                <p className="text-slate-700">{request.departureLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t('dashboards.garage.destination')}</p>
                <p className="text-slate-700">{request.destination}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t('dashboards.garage.departureTime')}</p>
                <p className="text-slate-700">{request.departureDateTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User size={16} className="text-purple-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{t('requests.requestedBy')}</p>
                <p className="text-slate-700">{request.createdBy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Type Selection */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">{t('dashboards.garage.selectAssignmentType')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Fleet Vehicle Option */}
            <button
              onClick={() => {
                setAssignmentType('fleet');
                setSelectedRentalCompanyId('');
              }}
              className={`p-4 rounded-xl border-2 text-start transition-all ${
                assignmentType === 'fleet'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${assignmentType === 'fleet' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  <Car size={20} className={assignmentType === 'fleet' ? 'text-emerald-600' : 'text-slate-500'} />
                </div>
                <div>
                  <p className={`font-semibold ${assignmentType === 'fleet' ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {t('dashboards.garage.assignFromFleet')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{t('dashboards.garage.assignFromFleetDesc')}</p>
              <p className="text-xs text-emerald-600 font-medium mt-2">
                {availableVehicles.length} {t('dashboards.garage.vehiclesAvailable')}
              </p>
            </button>

            {/* Rental Car Option */}
            <button
              onClick={() => {
                setAssignmentType('rental');
                setSelectedVehicleId('');
              }}
              className={`p-4 rounded-xl border-2 text-start transition-all ${
                assignmentType === 'rental'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${assignmentType === 'rental' ? 'bg-amber-100' : 'bg-slate-100'}`}>
                  <Building2 size={20} className={assignmentType === 'rental' ? 'text-amber-600' : 'text-slate-500'} />
                </div>
                <div>
                  <p className={`font-semibold ${assignmentType === 'rental' ? 'text-amber-700' : 'text-slate-700'}`}>
                    {t('dashboards.garage.assignRentalCar')}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{t('dashboards.garage.assignRentalCarDesc')}</p>
              <p className="text-xs text-amber-600 font-medium mt-2">
                {rentalCompanies.length} {t('dashboards.garage.rentalCompaniesAvailable')}
              </p>
            </button>
          </div>
        </div>

        {/* Fleet Vehicle Selection */}
        {assignmentType === 'fleet' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t('dashboards.garage.selectVehicle')}
            </label>
            {availableVehicles.length === 0 ? (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-center">
                <p className="text-sm text-rose-600">{t('dashboards.garage.noVehiclesAvailable')}</p>
                <p className="text-xs text-rose-500 mt-1">{t('dashboards.garage.considerRental')}</p>
              </div>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">{t('dashboards.garage.chooseVehicle')}</option>
                {availableVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Rental Company Selection */}
        {assignmentType === 'rental' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t('dashboards.garage.selectRentalCompany')}
            </label>
            <select
              value={selectedRentalCompanyId}
              onChange={(e) => setSelectedRentalCompanyId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="">{t('dashboards.garage.chooseRentalCompany')}</option>
              {rentalCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleAssign}
            disabled={!canAssign}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              canAssign
                ? assignmentType === 'rental'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={18} />
            {t('dashboards.garage.confirmAssignment')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
