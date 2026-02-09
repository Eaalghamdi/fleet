import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { NotificationsPanel } from './NotificationsPanel';

export function Header() {
  const { notifications } = useApp();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="mb-6 lg:mb-10 flex items-center justify-end px-4 lg:px-10 pt-4 lg:pt-10">
      {/* Actions - Hidden on mobile (already in top nav) */}
      <div className="hidden lg:flex gap-3 items-center">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-emerald-600 hover:border-emerald-100 transition-all relative"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-rose-500 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          <NotificationsPanel
            isOpen={isNotificationsPanelOpen}
            onClose={() => setIsNotificationsPanelOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
