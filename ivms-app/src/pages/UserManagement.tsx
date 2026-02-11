import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GlassCard, Modal, ConfirmDialog, Pagination } from '../components/ui';
import { useApp } from '../contexts/AppContext';

type Department = 'ADMIN' | 'OPERATION' | 'GARAGE' | 'MAINTENANCE';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

// Mock users data
const mockUsers: User[] = [
  { id: '1', username: 'admin', fullName: 'Ahmed Al-Rashid', email: 'admin@ivms.com', phone: '+966 50 123 4567', department: 'ADMIN', isActive: true, createdAt: '2024-01-01', lastLogin: '2024-02-01 09:30' },
  { id: '2', username: 'operations1', fullName: 'Mohammed Salem', email: 'operations@ivms.com', phone: '+966 50 234 5678', department: 'OPERATION', isActive: true, createdAt: '2024-01-05', lastLogin: '2024-02-01 08:15' },
  { id: '3', username: 'garage1', fullName: 'Saad Al-Ali', email: 'garage@ivms.com', phone: '+966 50 345 6789', department: 'GARAGE', isActive: true, createdAt: '2024-01-10', lastLogin: '2024-01-31 14:45' },
  { id: '4', username: 'maintenance1', fullName: 'Khalid Hassan', email: 'maintenance@ivms.com', phone: '+966 50 456 7890', department: 'MAINTENANCE', isActive: true, createdAt: '2024-01-15', lastLogin: '2024-01-30 11:20' },
  { id: '5', username: 'operations2', fullName: 'Fahad Al-Otaibi', email: 'fahad@ivms.com', phone: '+966 50 567 8901', department: 'OPERATION', isActive: false, createdAt: '2024-01-20', lastLogin: null },
  { id: '6', username: 'garage2', fullName: 'Omar Al-Zahrani', email: 'omar@ivms.com', phone: '+966 50 678 9012', department: 'GARAGE', isActive: true, createdAt: '2024-01-22', lastLogin: '2024-02-01 07:00' },
  { id: '7', username: 'maintenance2', fullName: 'Youssef Al-Harbi', email: 'youssef@ivms.com', phone: '+966 50 789 0123', department: 'MAINTENANCE', isActive: true, createdAt: '2024-01-25', lastLogin: '2024-01-31 16:30' },
  { id: '8', username: 'admin2', fullName: 'Ibrahim Al-Dosari', email: 'ibrahim@ivms.com', phone: '+966 50 890 1234', department: 'ADMIN', isActive: true, createdAt: '2024-01-28', lastLogin: '2024-02-01 10:15' },
  { id: '9', username: 'operations3', fullName: 'Abdullah Al-Mutairi', email: 'abdullah@ivms.com', phone: '+966 50 901 2345', department: 'OPERATION', isActive: true, createdAt: '2024-02-01', lastLogin: '2024-02-01 11:00' },
  { id: '10', username: 'garage3', fullName: 'Hassan Al-Ghamdi', email: 'hassan@ivms.com', phone: '+966 50 012 3456', department: 'GARAGE', isActive: false, createdAt: '2024-02-03', lastLogin: null },
  { id: '11', username: 'maintenance3', fullName: 'Faisal Al-Shehri', email: 'faisal@ivms.com', phone: '+966 50 111 2222', department: 'MAINTENANCE', isActive: true, createdAt: '2024-02-05', lastLogin: '2024-02-05 09:00' },
  { id: '12', username: 'operations4', fullName: 'Majed Al-Qahtani', email: 'majed@ivms.com', phone: '+966 50 222 3333', department: 'OPERATION', isActive: true, createdAt: '2024-02-07', lastLogin: '2024-02-07 14:20' },
  { id: '13', username: 'garage4', fullName: 'Turki Al-Ahmadi', email: 'turki@ivms.com', phone: '+966 50 333 4444', department: 'GARAGE', isActive: true, createdAt: '2024-02-10', lastLogin: '2024-02-10 08:45' },
  { id: '14', username: 'maintenance4', fullName: 'Nasser Al-Malki', email: 'nasser@ivms.com', phone: '+966 50 444 5555', department: 'MAINTENANCE', isActive: false, createdAt: '2024-02-12', lastLogin: '2024-02-12 13:30' },
  { id: '15', username: 'operations5', fullName: 'Bandar Al-Subaie', email: 'bandar@ivms.com', phone: '+966 50 555 6666', department: 'OPERATION', isActive: true, createdAt: '2024-02-15', lastLogin: '2024-02-15 10:00' },
  { id: '16', username: 'admin3', fullName: 'Sultan Al-Tamimi', email: 'sultan@ivms.com', phone: '+966 50 666 7777', department: 'ADMIN', isActive: true, createdAt: '2024-02-18', lastLogin: '2024-02-18 15:45' },
  { id: '17', username: 'garage5', fullName: 'Waleed Al-Dossary', email: 'waleed@ivms.com', phone: '+966 50 777 8888', department: 'GARAGE', isActive: true, createdAt: '2024-02-20', lastLogin: '2024-02-20 07:30' },
  { id: '18', username: 'maintenance5', fullName: 'Rakan Al-Harthy', email: 'rakan@ivms.com', phone: '+966 50 888 9999', department: 'MAINTENANCE', isActive: true, createdAt: '2024-02-22', lastLogin: '2024-02-22 12:00' },
];

interface UserFormData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  password: string;
  confirmPassword: string;
}

const initialFormData: UserFormData = {
  username: '',
  fullName: '',
  email: '',
  phone: '',
  department: 'OPERATION',
  password: '',
  confirmPassword: '',
};

export function UserManagement() {
  const { t } = useTranslation();
  const { showToast } = useApp();

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [users, searchQuery, departmentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      admins: users.filter(u => u.department === 'ADMIN').length,
      departments: new Set(users.map(u => u.department)).size,
    };
  }, [users]);

  const getDepartmentLabel = (department: Department): string => {
    const labels: Record<Department, string> = {
      ADMIN: t('departments.admin'),
      OPERATION: t('departments.operation'),
      GARAGE: t('departments.garage'),
      MAINTENANCE: t('departments.maintenance'),
    };
    return labels[department];
  };

  const getDepartmentColor = (department: Department): string => {
    const colors: Record<Department, string> = {
      ADMIN: 'text-rose-600',
      OPERATION: 'text-slate-600',
      GARAGE: 'text-emerald-600',
      MAINTENANCE: 'text-amber-600',
    };
    return colors[department];
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      department: user.department,
      password: '',
      confirmPassword: '',
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser && formData.password !== formData.confirmPassword) {
      showToast(t('pages.userManagement.passwordMismatch'), 'error');
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      showToast(t('pages.userManagement.passwordTooShort'), 'error');
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u =>
        u.id === editingUser.id
          ? { ...u, ...formData, password: undefined, confirmPassword: undefined }
          : u
      ));
      showToast(t('pages.userManagement.userUpdated'), 'success');
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: null,
      };
      setUsers(prev => [...prev, newUser]);
      showToast(t('pages.userManagement.userAdded'), 'success');
    }

    setModalOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      showToast(t('pages.userManagement.userDeleted'), 'success');
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = (user: User) => {
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, isActive: !u.isActive } : u
    ));
    showToast(
      user.isActive
        ? t('pages.userManagement.userDeactivated')
        : t('pages.userManagement.userActivated'),
      'success'
    );
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === paginatedUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  const handleBulkDelete = () => {
    setUsers(prev => prev.filter(u => !selectedUserIds.has(u.id)));
    showToast(t('pages.userManagement.usersDeleted', { count: selectedUserIds.size }), 'success');
    setSelectedUserIds(new Set());
  };

  const handleBulkActivate = () => {
    setUsers(prev => prev.map(u =>
      selectedUserIds.has(u.id) ? { ...u, isActive: true } : u
    ));
    showToast(t('pages.userManagement.usersActivated', { count: selectedUserIds.size }), 'success');
    setSelectedUserIds(new Set());
  };

  const handleBulkDeactivate = () => {
    setUsers(prev => prev.map(u =>
      selectedUserIds.has(u.id) ? { ...u, isActive: false } : u
    ));
    showToast(t('pages.userManagement.usersDeactivated', { count: selectedUserIds.size }), 'success');
    setSelectedUserIds(new Set());
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {t('pages.userManagement.title')}
          </h1>
          <p className="text-slate-500 text-sm">
            {t('pages.userManagement.description')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          <UserPlus size={18} />
          {t('pages.userManagement.addUser')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <GlassCard className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500">{t('pages.userManagement.totalUsers')}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <Users size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.active}</p>
              <p className="text-xs text-slate-500">{t('pages.userManagement.activeUsers')}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl">
              <Shield size={20} className="text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.admins}</p>
              <p className="text-xs text-slate-500">{t('pages.userManagement.adminUsers')}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-xl">
              <Building2 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{stats.departments}</p>
              <p className="text-xs text-slate-500">{t('pages.userManagement.departments')}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder={t('pages.userManagement.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-0 w-full sm:w-auto sm:min-w-[140px]"
              >
                <option value="all">{t('pages.userManagement.allDepartments')}</option>
                <option value="ADMIN">{t('departments.admin')}</option>
                <option value="OPERATION">{t('departments.operation')}</option>
                <option value="GARAGE">{t('departments.garage')}</option>
                <option value="MAINTENANCE">{t('departments.maintenance')}</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-w-0 w-full sm:w-auto sm:min-w-[140px]"
              >
                <option value="all">{t('pages.userManagement.allStatuses')}</option>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
          </div>
        </div>
        {/* Bulk Actions Bar */}
        {selectedUserIds.size > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {t('pages.userManagement.selectedCount', { count: selectedUserIds.size })}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkActivate}
                className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {t('pages.userManagement.activateSelected')}
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="px-3 py-1.5 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                {t('pages.userManagement.deactivateSelected')}
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                {t('pages.userManagement.deleteSelected')}
              </button>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full rtl:text-right ltr:text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && selectedUserIds.size === paginatedUsers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">{t('pages.userManagement.fullName')}</th>
                <th className="px-6 py-4">{t('pages.userManagement.username')}</th>
                <th className="px-6 py-4">{t('pages.userManagement.department')}</th>
                <th className="px-6 py-4">{t('pages.userManagement.contact')}</th>
                <th className="px-6 py-4">{t('common.status')}</th>
                <th className="px-6 py-4">{t('pages.userManagement.lastLogin')}</th>
                <th className="px-6 py-4">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-800">{user.fullName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${getDepartmentColor(user.department)}`}>
                        {getDepartmentLabel(user.department)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={14} />
                          <span className="text-xs">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={14} />
                          <span className="text-xs">{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {user.isActive ? t('common.active') : t('common.inactive')}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {user.lastLogin || t('pages.userManagement.neverLoggedIn')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(user); }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
                          title={t('common.details')}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(user); }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-500 hover:text-blue-700"
                          title={t('common.edit')}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(user); }}
                          className="p-2 hover:bg-rose-50 rounded-lg transition-colors text-rose-500 hover:text-rose-700"
                          title={t('common.delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Users size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">
                      {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                        ? t('pages.userManagement.noResults')
                        : t('pages.userManagement.noUsers')}
                    </p>
                    {!searchQuery && departmentFilter === 'all' && statusFilter === 'all' && (
                      <p className="text-slate-400 text-sm mt-1">
                        {t('pages.userManagement.startByAdding')}
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleViewDetails(user)}
                className={`p-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedUserIds.has(user.id) ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user.id)}
                      onChange={(e) => { e.stopPropagation(); handleSelectUser(user.id); }}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      user.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {user.isActive ? t('common.active') : t('common.inactive')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-1">{t('pages.userManagement.department')}</p>
                    <span className={`font-medium ${getDepartmentColor(user.department)}`}>
                      {getDepartmentLabel(user.department)}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">{t('pages.userManagement.lastLogin')}</p>
                    <p className="text-slate-700 font-medium">{user.lastLogin || t('pages.userManagement.neverLoggedIn')}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? t('pages.userManagement.noResults')
                  : t('pages.userManagement.noUsers')}
              </p>
            </div>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
          setFormData(initialFormData);
        }}
        title={editingUser ? t('pages.userManagement.editUser') : t('pages.userManagement.addUser')}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {t('pages.userManagement.fullName')}
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('pages.userManagement.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {t('pages.userManagement.username')}
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('pages.userManagement.usernamePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {t('common.email')}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('pages.userManagement.emailPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {t('common.phone')}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('pages.userManagement.phonePlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              {t('pages.userManagement.department')}
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value as Department }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ADMIN">{t('departments.admin')}</option>
              <option value="OPERATION">{t('departments.operation')}</option>
              <option value="GARAGE">{t('departments.garage')}</option>
              <option value="MAINTENANCE">{t('departments.maintenance')}</option>
            </select>
          </div>

          {!editingUser && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2.5 pe-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder={t('pages.userManagement.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {t('pages.userManagement.confirmPassword')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t('pages.userManagement.confirmPasswordPlaceholder')}
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingUser(null);
                setFormData(initialFormData);
              }}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              {editingUser ? (
                <>
                  <Edit2 size={16} />
                  {t('pages.userManagement.saveChanges')}
                </>
              ) : (
                <>
                  <Plus size={16} />
                  {t('pages.userManagement.addUser')}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUser(null);
        }}
        title={t('pages.userManagement.userDetails')}
        size="md"
      >
        {selectedUser && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                {selectedUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selectedUser.fullName}</h3>
                <p className="text-slate-500">@{selectedUser.username}</p>
                <span className={`text-sm font-medium ${getDepartmentColor(selectedUser.department)}`}>
                  {getDepartmentLabel(selectedUser.department)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('common.email')}</p>
                <p className="font-medium text-slate-800">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.phone')}</p>
                <p className="font-medium text-slate-800">{selectedUser.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('common.status')}</p>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedUser.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedUser.isActive ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('pages.userManagement.createdAt')}</p>
                <p className="font-medium text-slate-800">{selectedUser.createdAt}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500">{t('pages.userManagement.lastLogin')}</p>
                <p className="font-medium text-slate-800">
                  {selectedUser.lastLogin || t('pages.userManagement.neverLoggedIn')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleOpenEditModal(selectedUser);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                {t('common.edit')}
              </button>
              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  handleDeleteClick(selectedUser);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {t('common.delete')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('pages.userManagement.deleteUser')}
        message={t('pages.userManagement.deleteConfirmation', { name: userToDelete?.fullName })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
