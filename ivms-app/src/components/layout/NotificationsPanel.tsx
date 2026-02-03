import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-slate-600" />
            <h3 className="font-bold text-slate-800">الإشعارات</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                title="قراءة الكل"
              >
                <CheckCheck size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-emerald-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                      notification.type === 'success' ? 'bg-emerald-500' :
                      notification.type === 'error' ? 'bg-rose-500' :
                      notification.type === 'warning' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-bold ${!notification.read ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <button
                            onClick={() => markNotificationRead(notification.id)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                          >
                            <Check size={12} /> تحديد كمقروء
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-[10px] text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1"
                        >
                          <Trash2 size={12} /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
