import { useState, useEffect } from 'react';
import type { InventoryItem } from '../../types';

interface InventoryFormProps {
  item?: InventoryItem;
  onSubmit: (data: Omit<InventoryItem, 'id'>) => void;
  onCancel: () => void;
}

const categoryOptions = ['سوائل', 'فرامل', 'فلاتر', 'إطارات', 'بطاريات', 'كهرباء', 'أخرى'];

export function InventoryForm({ item, onSubmit, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'أخرى',
    quantity: 0,
    minStock: 10,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minStock: item.minStock,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            اسم الصنف <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="مثال: زيت محرك 5W-30"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الفئة
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الكمية الحالية
          </label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Min Stock */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            الحد الأدنى للمخزون
          </label>
          <input
            type="number"
            min="0"
            value={formData.minStock}
            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <p className="text-xs text-slate-400 mt-1">سيتم تنبيهك عندما تنخفض الكمية عن هذا الحد</p>
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
          className="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
        >
          {item ? 'حفظ التغييرات' : 'إضافة الصنف'}
        </button>
      </div>
    </form>
  );
}
