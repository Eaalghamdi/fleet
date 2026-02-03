import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Camera } from 'lucide-react';
import type { CarRequest, CarType } from '../../types';
import { vehicleData } from '../../data';
import { useApp } from '../../contexts/AppContext';

interface CarRequestFormProps {
  request?: CarRequest;
  onSubmit: (data: Omit<CarRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'cancelledBy' | 'assignedBy' | 'approvedBy' | 'returnConditionNotes' | 'assignedCarPlate' | 'isRental' | 'rentalCompanyId' | 'rentalCompanyName'>) => void;
  onCancel: () => void;
}

export function CarRequestForm({ request, onSubmit, onCancel }: CarRequestFormProps) {
  const { t } = useTranslation();
  const { drivers } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carTypeOptions: CarType[] = ['sedan', 'suv', 'truck'];

  const [formData, setFormData] = useState({
    requestedCarType: 'sedan' as CarType,
    requestedCarId: null as string | null,
    driverId: null as string | null,
    departureLocation: '',
    destination: '',
    departureDatetime: '',
    returnDatetime: '',
    description: '' as string | null,
    images: [] as string[],
    createdBy: 'Current User',
  });

  // Get active drivers only
  const activeDrivers = drivers.filter(d => d.status === 'active');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (request) {
      setFormData({
        requestedCarType: request.requestedCarType,
        requestedCarId: request.requestedCarId,
        driverId: request.driverId,
        departureLocation: request.departureLocation,
        destination: request.destination,
        departureDatetime: request.departureDatetime,
        returnDatetime: request.returnDatetime,
        description: request.description,
        images: request.images,
        createdBy: request.createdBy,
      });
      setImagePreviews(request.images);
    }
  }, [request]);

  const availableVehicles = vehicleData.filter(v => v.status === 'active');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = imageFiles.length + newFiles.length;

    if (totalImages > 6) {
      alert(t('dashboards.operation.maxImages'));
      return;
    }

    const newPreviews: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (imagePreviews.length < 4) {
      alert(t('dashboards.operation.minImages'));
      return;
    }

    onSubmit({
      ...formData,
      images: imagePreviews,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Car Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.carType')} <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={formData.requestedCarType}
            onChange={(e) => setFormData({ ...formData, requestedCarType: e.target.value as CarType })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {carTypeOptions.map((type) => (
              <option key={type} value={type}>
                {t(`dashboards.operation.${type}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Specific Car (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.selectCar')}
          </label>
          <select
            value={formData.requestedCarId || ''}
            onChange={(e) => setFormData({ ...formData, requestedCarId: e.target.value || null })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">{t('dashboards.operation.anyAvailable')}</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} - {vehicle.plate}
              </option>
            ))}
          </select>
        </div>

        {/* Driver Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.selectDriver')} <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={formData.driverId || ''}
            onChange={(e) => setFormData({ ...formData, driverId: e.target.value || null })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">{t('dashboards.operation.chooseDriver')}</option>
            {activeDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} - {driver.nationalId}
              </option>
            ))}
          </select>
          {activeDrivers.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">{t('dashboards.operation.noDriversAvailable')}</p>
          )}
        </div>

        {/* Departure Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.departureLocation')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.departureLocation}
            onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="e.g., Riyadh HQ"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.destination')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="e.g., Jeddah Branch"
          />
        </div>

        {/* Departure DateTime */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.departureDatetime')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={formData.departureDatetime}
            onChange={(e) => setFormData({ ...formData, departureDatetime: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Return DateTime */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.returnDatetime')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={formData.returnDatetime}
            onChange={(e) => setFormData({ ...formData, returnDatetime: e.target.value })}
            min={formData.departureDatetime}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('common.description')}
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            placeholder={t('dashboards.operation.purpose')}
          />
        </div>

        {/* Images Upload */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('dashboards.operation.images')} <span className="text-rose-500">*</span>
            <span className="text-xs text-slate-400 font-normal ltr:ml-2 rtl:mr-2">
              ({imagePreviews.length}/6) - {t('dashboards.operation.minImages')}
            </span>
          </label>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {imagePreviews.length < 6 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                capture="environment"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <Upload size={24} className="text-slate-400" />
                  <Camera size={24} className="text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">{t('dashboards.operation.uploadImages')}</p>
                <p className="text-xs text-slate-400">
                  {6 - imagePreviews.length} {t('common.remaining')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30"
        >
          {request ? t('dashboards.operation.updateRequest') : t('dashboards.operation.submitRequest')}
        </button>
      </div>
    </form>
  );
}
