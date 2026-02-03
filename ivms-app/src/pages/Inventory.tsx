import { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  RefreshCcw,
  Plus,
  Search,
  ShoppingCart,
  LayoutGrid,
  List,
  CheckCircle2,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dropdown, ConfirmDialog, Modal } from '../components/ui';
import { InventoryModal } from '../components/modals/InventoryModal';
import { OrderModal } from '../components/modals/OrderModal';
import { useApp } from '../contexts/AppContext';
import type { InventoryItem } from '../types';

export function Inventory() {
  const { t } = useTranslation();
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, orderInventoryItem } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [orderingItem, setOrderingItem] = useState<InventoryItem | null>(null);

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    const categories = new Set(inventory.map(item => item.category));
    return Array.from(categories).sort();
  }, [inventory]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.includes(searchQuery) || item.id.includes(searchQuery) || item.category.includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'low' && item.quantity <= item.minStock) ||
        (stockFilter === 'inStock' && item.quantity > item.minStock);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [inventory, searchQuery, categoryFilter, stockFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).length;
    const totalValue = inventory.reduce((acc, item) => acc + item.quantity * 100, 0);
    return { totalItems, lowStockItems, totalValue };
  }, [inventory]);

  // Handlers
  const handleAdd = (data: Omit<InventoryItem, 'id'>) => {
    addInventoryItem(data);
    setIsAddModalOpen(false);
  };

  const handleEdit = (data: Omit<InventoryItem, 'id'>) => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, data);
      setEditingItem(null);
    }
  };

  const handleDelete = () => {
    if (deletingItem) {
      deleteInventoryItem(deletingItem.id);
      setDeletingItem(null);
    }
  };

  const handleOrder = (id: string, quantity: number) => {
    orderInventoryItem(id, quantity);
    setOrderingItem(null);
  };

  const getDropdownItems = (item: InventoryItem) => [
    {
      label: t('pages.inventory.viewDetails'),
      icon: <Eye size={16} />,
      onClick: () => setViewingItem(item),
    },
    {
      label: t('pages.inventory.edit'),
      icon: <Pencil size={16} />,
      onClick: () => setEditingItem(item),
    },
    {
      label: t('pages.inventory.orderSupply'),
      icon: <ShoppingCart size={16} />,
      onClick: () => setOrderingItem(item),
    },
    {
      label: t('pages.inventory.delete'),
      icon: <Trash2 size={16} />,
      onClick: () => setDeletingItem(item),
      variant: 'danger' as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{t('pages.inventory.title')}</h1>
          <p className="text-slate-500 text-xs sm:text-sm">{t('pages.inventory.description')} ({t('pages.inventory.itemCount', { count: inventory.length })})</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => inventory.length > 0 && setOrderingItem(inventory[0])}
            className="hidden sm:flex bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-slate-50"
          >
            <ShoppingCart size={18} /> {t('pages.inventory.purchaseOrder')}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none bg-slate-900 text-white px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> {t('pages.inventory.addItem')}
          </button>
        </div>
      </header>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('pages.inventory.totalItems'), value: stats.totalItems.toLocaleString(), icon: Package, color: 'blue' },
          { label: t('pages.inventory.itemsBelowMinimum'), value: stats.lowStockItems.toString(), icon: AlertTriangle, color: 'rose' },
          { label: t('pages.inventory.activeSupplyOrders'), value: '5', icon: RefreshCcw, color: 'amber' },
          { label: t('pages.inventory.inventoryValue'), value: `${(stats.totalValue / 1000).toFixed(0)}k`, icon: LayoutGrid, color: 'emerald' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              stat.color === 'rose' ? 'bg-rose-50 text-rose-600' :
              stat.color === 'amber' ? 'bg-amber-50 text-amber-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-xl font-black text-slate-800 mt-1">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                >
                  <List size={16}/>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                >
                  <LayoutGrid size={16}/>
                </button>
              </div>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">{t('pages.inventory.centralWarehouseList')}</h4>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={t('pages.inventory.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-10 pl-4 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter size={16} />
              <span>{t('common.filter')}:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[140px]"
              >
                <option value="all">{t('pages.inventory.allCategories')}</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-[140px]"
              >
                <option value="all">{t('pages.inventory.allStockLevels')}</option>
                <option value="inStock">{t('pages.inventory.inStock')}</option>
                <option value="low">{t('pages.inventory.lowStock')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="p-12 text-center">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">{t('pages.inventory.noItems')}</h3>
            <p className="text-sm text-slate-400 mb-4">
              {searchQuery ? t('pages.inventory.noSearchResults') : t('pages.inventory.startByAdding')}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800"
              >
                {t('pages.inventory.addItem')}
              </button>
            )}
          </div>
        )}

        {viewMode === 'list' && filteredItems.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-4">{t('pages.inventory.item')}</th>
                    <th className="px-8 py-4">{t('pages.inventory.barcodeSku')}</th>
                    <th className="px-8 py-4">{t('pages.inventory.category')}</th>
                    <th className="px-8 py-4">{t('pages.inventory.available')}</th>
                    <th className="px-8 py-4">{t('common.status')}</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      </td>
                      <td className="px-8 py-5 text-xs text-slate-500 font-mono tracking-tighter">{item.id}</td>
                      <td className="px-8 py-5 text-xs text-slate-500">{item.category}</td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{item.quantity} قطعة</span>
                          <span className="text-[10px] text-slate-400">الحد الأدنى: {item.minStock}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {item.quantity <= item.minStock ? (
                          <span className="flex items-center gap-1.5 text-rose-600 text-[10px] font-bold bg-rose-50 px-2 py-1 rounded-md border border-rose-100 w-fit">
                            <AlertTriangle size={12} /> منخفض جداً
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 w-fit">
                            <CheckCircle2 size={12} /> متوفر
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setOrderingItem(item)}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            طلب توريد
                          </button>
                          <Dropdown
                            trigger={<MoreVertical size={16} />}
                            items={getDropdownItems(item)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards for List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.quantity <= item.minStock ? (
                        <span className="flex items-center gap-1 text-rose-600 text-[10px] font-bold bg-rose-50 px-2 py-1 rounded-md border border-rose-100 shrink-0">
                          <AlertTriangle size={10} /> منخفض
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 shrink-0">
                          <CheckCircle2 size={10} /> متوفر
                        </span>
                      )}
                      <Dropdown
                        trigger={<MoreVertical size={16} />}
                        items={getDropdownItems(item)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{item.quantity}</p>
                        <p className="text-[10px] text-slate-400">الحد الأدنى: {item.minStock}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                    </div>
                    <button
                      onClick={() => setOrderingItem(item)}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      طلب توريد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : viewMode === 'grid' && filteredItems.length > 0 ? (
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${
                  item.quantity <= item.minStock ? 'border-rose-200' : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div
                    className={`p-2.5 sm:p-3 rounded-xl ${
                      item.quantity <= item.minStock ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <Package size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    {item.quantity <= item.minStock ? (
                      <span className="flex items-center gap-1 text-rose-600 text-[10px] font-bold bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                        <AlertTriangle size={10} /> منخفض
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <CheckCircle2 size={10} /> متوفر
                      </span>
                    )}
                    <Dropdown
                      trigger={<MoreVertical size={14} />}
                      items={getDropdownItems(item)}
                    />
                  </div>
                </div>
                <h3 className="text-slate-800 font-bold text-sm mb-1">{item.name}</h3>
                <p className="text-slate-500 text-xs mb-3">{item.category}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{item.quantity}</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs">الحد الأدنى: {item.minStock}</p>
                  </div>
                  <button
                    onClick={() => setOrderingItem(item)}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    طلب توريد
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Add Modal */}
      <InventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      {/* Edit Modal */}
      <InventoryModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem || undefined}
        onSubmit={handleEdit}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={!!orderingItem}
        onClose={() => setOrderingItem(null)}
        item={orderingItem}
        onSubmit={handleOrder}
      />

      {/* View Modal */}
      <Modal
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        title={t('pages.inventory.itemDetails')}
        size="md"
      >
        {viewingItem && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                viewingItem.quantity <= viewingItem.minStock ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <Package size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewingItem.name}</h3>
                <p className="text-sm text-slate-500">{viewingItem.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.inventory.itemNumber')}</p>
                <p className="text-sm font-mono text-slate-700">{viewingItem.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('common.status')}</p>
                {viewingItem.quantity <= viewingItem.minStock ? (
                  <span className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                    <AlertTriangle size={14} /> {t('pages.inventory.veryLow')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                    <CheckCircle2 size={14} /> {t('pages.inventory.inStock')}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.inventory.currentQuantity')}</p>
                <p className="text-2xl font-bold text-slate-800">{viewingItem.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{t('pages.inventory.minimum')}</p>
                <p className="text-2xl font-bold text-slate-800">{viewingItem.minStock}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setViewingItem(null);
                  setOrderingItem(viewingItem);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                {t('pages.inventory.orderSupply')}
              </button>
              <button
                onClick={() => {
                  setViewingItem(null);
                  setEditingItem(viewingItem);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                {t('pages.inventory.edit')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        title={t('pages.inventory.deleteItem')}
        message={t('pages.inventory.deleteConfirmation', { name: deletingItem?.name })}
        confirmText={t('pages.inventory.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
