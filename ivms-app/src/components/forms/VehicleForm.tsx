import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Check } from 'lucide-react';
import type { Vehicle } from '../../types';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
  onCancel: () => void;
}

const statusOptions: Vehicle['status'][] = ['active', 'maintenance', 'inactive'];

const STEPS = [
  'forms.vehicle.steps.vehicleIdentification',
  'forms.vehicle.steps.statusAssignment',
  'forms.vehicle.steps.insuranceWarranty',
  'forms.vehicle.steps.mediaHistory',
] as const;

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [_imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    carId: '',
    plate: '',
    vin: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active' as Vehicle['status'],
    driver: '',
    fuel: 100,
    mileage: 0,
    location: '',
    insuranceIssueDate: '',
    insuranceExpiryDate: '',
    warrantyExpiryDate: '',
    registrationExpiryDate: '',
    nextMaintenanceDate: '',
    images: [] as string[],
    maintenanceHistory: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        carId: vehicle.carId || '',
        plate: vehicle.plate,
        vin: vehicle.vin || '',
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        status: vehicle.status,
        driver: vehicle.driver,
        fuel: vehicle.fuel,
        mileage: vehicle.mileage,
        location: vehicle.location,
        insuranceIssueDate: vehicle.insuranceIssueDate || '',
        insuranceExpiryDate: vehicle.insuranceExpiryDate || '',
        warrantyExpiryDate: vehicle.warrantyExpiryDate || '',
        registrationExpiryDate: vehicle.registrationExpiryDate || '',
        nextMaintenanceDate: vehicle.nextMaintenanceDate || '',
        images: vehicle.images || [],
        maintenanceHistory: vehicle.maintenanceHistory || '',
      });
      if (vehicle.images?.length) {
        setImagePreviews(vehicle.images);
      }
    }
  }, [vehicle]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.carId.trim()) errors.carId = 'required';
      if (!formData.plate.trim()) errors.plate = 'required';
      if (!formData.brand.trim()) errors.brand = 'required';
      if (!formData.model.trim()) errors.model = 'required';
      if (!formData.year || formData.year < 1990) errors.year = 'required';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStepErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImagePreviews((prev) => [...prev, result]);
        setFormData((prev) => ({ ...prev, images: [...prev.images, result] }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const inputClass = (field?: string) =>
    `w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
      field && stepErrors[field]
        ? 'border-rose-400 bg-rose-50/50'
        : 'border-slate-200'
    }`;

  const renderStepIndicator = () => (
    <div className="px-6 pt-6 pb-2">
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((stepKey, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;

          return (
            <div key={stepKey} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={`text-xs mt-1.5 text-center leading-tight max-w-[80px] ${
                    isActive || isCompleted
                      ? 'text-emerald-600 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {t(stepKey)}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 -mt-5 transition-colors duration-300 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Car ID */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.carId')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.carId}
          onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
          className={inputClass('carId')}
          placeholder={t('forms.vehicle.carIdPlaceholder')}
        />
        {stepErrors.carId && (
          <p className="text-xs text-rose-500 mt-1">{t('errors.validationError')}</p>
        )}
      </div>

      {/* Plate */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.plateNumber')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.plate}
          onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
          className={inputClass('plate')}
          placeholder={t('forms.vehicle.platePlaceholder')}
        />
        {stepErrors.plate && (
          <p className="text-xs text-rose-500 mt-1">{t('errors.validationError')}</p>
        )}
      </div>

      {/* VIN */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.vin')}
        </label>
        <input
          type="text"
          value={formData.vin}
          onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
          className={inputClass()}
          placeholder={t('forms.vehicle.vinPlaceholder')}
        />
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.manufacturer')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className={inputClass('brand')}
          placeholder={t('forms.vehicle.brandPlaceholder')}
        />
        {stepErrors.brand && (
          <p className="text-xs text-rose-500 mt-1">{t('errors.validationError')}</p>
        )}
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.model')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className={inputClass('model')}
          placeholder={t('forms.vehicle.modelPlaceholder')}
        />
        {stepErrors.model && (
          <p className="text-xs text-rose-500 mt-1">{t('errors.validationError')}</p>
        )}
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.year')} <span className="text-rose-500">*</span>
        </label>
        <input
          type="number"
          min="1990"
          max={new Date().getFullYear() + 1}
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          className={inputClass('year')}
        />
        {stepErrors.year && (
          <p className="text-xs text-rose-500 mt-1">{t('errors.validationError')}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('vehicles.status')}
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as Vehicle['status'] })
          }
          className={inputClass()}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {t(`vehicleStatuses.${status}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Mileage */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.mileage')}
        </label>
        <input
          type="number"
          min="0"
          value={formData.mileage}
          onChange={(e) =>
            setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })
          }
          className={inputClass()}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Insurance Issue Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.insuranceIssueDate')}
        </label>
        <input
          type="date"
          value={formData.insuranceIssueDate}
          onChange={(e) =>
            setFormData({ ...formData, insuranceIssueDate: e.target.value })
          }
          className={inputClass()}
        />
      </div>

      {/* Insurance Expiry Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.insuranceExpiryDate')}
        </label>
        <input
          type="date"
          value={formData.insuranceExpiryDate}
          onChange={(e) =>
            setFormData({ ...formData, insuranceExpiryDate: e.target.value })
          }
          className={inputClass()}
        />
      </div>

      {/* Warranty Expiry Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.warrantyExpiryDate')}
        </label>
        <input
          type="date"
          value={formData.warrantyExpiryDate}
          onChange={(e) =>
            setFormData({ ...formData, warrantyExpiryDate: e.target.value })
          }
          className={inputClass()}
        />
      </div>

      {/* Registration Expiry Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.registrationExpiryDate')}
        </label>
        <input
          type="date"
          value={formData.registrationExpiryDate}
          onChange={(e) =>
            setFormData({ ...formData, registrationExpiryDate: e.target.value })
          }
          className={inputClass()}
        />
      </div>

      {/* Next Maintenance Date */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.nextMaintenanceDate')}
        </label>
        <input
          type="date"
          value={formData.nextMaintenanceDate}
          onChange={(e) =>
            setFormData({ ...formData, nextMaintenanceDate: e.target.value })
          }
          className={inputClass()}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      {/* Car Images */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('forms.vehicle.carImages')}
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">{t('forms.vehicle.dragOrClick')}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-3">
            {imagePreviews.map((src, index) => (
              <div key={index} className="relative group rounded-xl overflow-hidden aspect-square">
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance History */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {t('forms.vehicle.maintenanceHistory')}
        </label>
        <textarea
          rows={4}
          value={formData.maintenanceHistory}
          onChange={(e) =>
            setFormData({ ...formData, maintenanceHistory: e.target.value })
          }
          className={inputClass()}
          placeholder={t('forms.vehicle.maintenanceHistoryPlaceholder')}
        />
      </div>
    </div>
  );

  const stepContent: Record<number, React.JSX.Element> = {
    1: renderStep1(),
    2: renderStep2(),
    3: renderStep3(),
    4: renderStep4(),
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderStepIndicator()}

      <div className="px-6 py-4 min-h-[280px]">{stepContent[currentStep]}</div>

      {/* Navigation */}
      <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-slate-100">
        {currentStep === 1 ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            {t('common.back')}
          </button>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30"
          >
            {t('common.next')}
          </button>
        ) : (
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30"
          >
            {vehicle ? t('forms.vehicle.saveChanges') : t('forms.vehicle.addVehicle')}
          </button>
        )}
      </div>
    </form>
  );
}
