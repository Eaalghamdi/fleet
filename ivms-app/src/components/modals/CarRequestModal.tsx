import { X, MapPin, Calendar, Car, User, Building2, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CarRequest } from '../../types';

interface CarRequestModalProps {
  request: CarRequest;
  onClose: () => void;
  onMarkInTransit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onEdit?: (request: CarRequest) => void;
}

export function CarRequestModal({ request, onClose, onMarkInTransit, onCancel, onEdit }: CarRequestModalProps) {
  const { t } = useTranslation();

  const getStatusStyle = (status: CarRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600';
      case 'assigned':
        return 'text-slate-600';
      case 'approved':
        return 'text-emerald-600';
      case 'rejected':
        return 'text-rose-600';
      case 'in_transit':
        return 'text-emerald-600';
      case 'returned':
        return 'text-emerald-600';
      case 'cancelled':
        return 'text-rose-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusText = (status: CarRequest['status']) => {
    switch (status) {
      case 'pending':
        return t('carRequestStatuses.pending');
      case 'assigned':
        return t('carRequestStatuses.assigned');
      case 'approved':
        return t('carRequestStatuses.approved');
      case 'rejected':
        return t('carRequestStatuses.rejected');
      case 'in_transit':
        return t('carRequestStatuses.inTransit');
      case 'returned':
        return t('carRequestStatuses.returned');
      case 'cancelled':
        return t('carRequestStatuses.cancelled');
      default:
        return status;
    }
  };

  const getStatusDescription = (status: CarRequest['status']) => {
    switch (status) {
      case 'pending':
        return t('dashboards.operation.awaitingAssignment');
      case 'assigned':
        return t('dashboards.operation.awaitingApproval');
      case 'approved':
        return t('dashboards.operation.approvedForDeparture');
      case 'in_transit':
        return t('dashboards.operation.activeTrips');
      case 'returned':
        return t('dashboards.operation.tripCompleted');
      case 'rejected':
        return t('dashboards.operation.requestWasRejected');
      case 'cancelled':
        return t('dashboards.operation.requestWasCancelled');
      default:
        return '';
    }
  };

  const getStatusIcon = (status: CarRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-amber-500" size={20} />;
      case 'assigned':
        return <AlertCircle className="text-blue-500" size={20} />;
      case 'approved':
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'in_transit':
        return <Car className="text-emerald-500" size={20} />;
      case 'returned':
        return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-rose-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-rose-500" size={20} />;
      default:
        return null;
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString();
  };

  const canEdit = request.status === 'pending' || request.status === 'assigned';
  const canMarkInTransit = request.status === 'approved';
  const canCancel = request.status === 'pending' || request.status === 'assigned';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t('dashboards.operation.requestDetails')}</h2>
            <p className="text-sm text-slate-500">{request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Status Card */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
            {getStatusIcon(request.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${getStatusStyle(request.status)}`}>{getStatusText(request.status)}</span>
              </div>
              <p className="text-sm text-slate-600">{getStatusDescription(request.status)}</p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.departureLocation')}</p>
                <p className="text-sm font-medium text-slate-800">{request.departureLocation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPin size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.destination')}</p>
                <p className="text-sm font-medium text-slate-800">{request.destination}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.departureDatetime')}</p>
                <p className="text-sm font-medium text-slate-800">{formatDateTime(request.departureDatetime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.returnDatetime')}</p>
                <p className="text-sm font-medium text-slate-800">{formatDateTime(request.returnDatetime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Car size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.carType')}</p>
                <p className="text-sm font-medium text-slate-800">{t(`dashboards.operation.${request.requestedCarType}`)}</p>
              </div>
            </div>

            {request.assignedCarPlate && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Car size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.vehicle')}</p>
                  <p className="text-sm font-medium text-slate-800">
                    {request.assignedCarPlate}
                    {request.isRental && (
                      <span className="text-xs text-amber-600 ltr:ml-2 rtl:mr-2">({t('dashboards.operation.isRental')})</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {request.isRental && request.rentalCompanyName && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Building2 size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">{t('dashboards.operation.rentalCompany')}</p>
                  <p className="text-sm font-medium text-slate-800">{request.rentalCompanyName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {request.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-slate-400" />
                <p className="text-xs text-slate-400 uppercase tracking-wide">{t('common.description')}</p>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{request.description}</p>
            </div>
          )}

          {/* Audit Info */}
          <div className="border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-slate-500">{t('dashboards.operation.createdBy')}:</span>
                <span className="font-medium text-slate-700">{request.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="text-slate-500">{t('dashboards.operation.createdAt')}:</span>
                <span className="font-medium text-slate-700">{formatDateTime(request.createdAt)}</span>
              </div>
              {request.assignedBy && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-slate-500">{t('dashboards.operation.assignedBy')}:</span>
                  <span className="font-medium text-slate-700">{request.assignedBy}</span>
                </div>
              )}
              {request.approvedBy && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-slate-500">{t('dashboards.operation.approvedBy')}:</span>
                  <span className="font-medium text-slate-700">{request.approvedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* Return Condition Notes */}
          {request.returnConditionNotes && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">{t('dashboards.operation.returnCondition')}</p>
              <p className="text-sm text-emerald-700">{request.returnConditionNotes}</p>
            </div>
          )}

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{t('dashboards.operation.images')}</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {request.images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(request)}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              {t('dashboards.operation.editRequest')}
            </button>
          )}
          {canMarkInTransit && onMarkInTransit && (
            <button
              onClick={() => onMarkInTransit(request.id)}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              {t('dashboards.operation.markAsInTransit')}
            </button>
          )}
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(request.id)}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors"
            >
              {t('dashboards.operation.cancelRequest')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
