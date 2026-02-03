import { useState, useEffect } from 'react';
import type { Vehicle } from '../../types';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
  onCancel: () => void;
}

const statusOptions: Vehicle['status'][] = ['نشط', 'صيانة', 'متوقف'];

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'نشط' as Vehicle['status'],
    driver: '',
    fuel: 100,
    mileage: 0,
    location: '',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        status: vehicle.status,
        driver: vehicle.driver,
        fuel: vehicle.fuel,
        mileage: vehicle.mileage,
        location: vehicle.location,
      });
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plate */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            رقم اللوحة <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.plate}
            onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="مثال: أ ب ج ١٢٣٤"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الشركة المصنعة <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="مثال: Toyota"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الموديل <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="مثال: Hilux"
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            سنة الصنع <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الحالة
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Vehicle['status'] })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Driver */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            السائق
          </label>
          <input
            type="text"
            value={formData.driver}
            onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="اسم السائق"
          />
        </div>

        {/* Fuel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            مستوى الوقود (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.fuel}
            onChange={(e) => setFormData({ ...formData, fuel: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            عداد المسافة (كم)
          </label>
          <input
            type="number"
            min="0"
            value={formData.mileage}
            onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الموقع الحالي
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="مثال: الرياض - حي الملز"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/30"
        >
          {vehicle ? 'حفظ التغييرات' : 'إضافة المركبة'}
        </button>
      </div>
    </form>
  );
}
