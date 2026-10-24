/**
 * FarmConnect Notification Bell Icon & Dropdown Panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markNotificationRead, clearAllNotifications, setActiveTab, setScreenState } = useAppState();
  const { t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-2xl bg-white/80 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/60 border border-emerald-100 dark:border-emerald-800/40 shadow-sm transition-all"
        aria-label="Notifications"
      >
        <Icon name="notifications" size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-[24px] glass-card-light dark:glass-card-dark border border-emerald-200/80 dark:border-emerald-700/50 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/30">
              <div className="flex items-center gap-2">
                <Icon name="notifications_active" className="text-emerald-600 dark:text-emerald-400" size={20} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-emerald-100">{t('notifications')}</h3>
                {unreadCount > 0 && <Badge variant="amber" size="sm">{unreadCount} New</Badge>}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                >
                  {t('clearAll')}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-emerald-100/60 dark:divide-emerald-800/40">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-emerald-400/60 text-xs">
                  <Icon name="notifications_off" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>{t('noNotifications')}</p>
                </div>
              ) : (
                notifications.map(item => (
                  <div
                    key={item.id}
                    onClick={() => markNotificationRead(item.id)}
                    className={`p-3.5 transition-all cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-900/40 ${
                      !item.read ? 'bg-emerald-50/70 dark:bg-emerald-950/60 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-emerald-100">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 dark:text-emerald-500 whitespace-nowrap">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-emerald-300/80 mt-1 line-clamp-2">{item.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-emerald-950/80 text-center border-t border-emerald-100 dark:border-emerald-800/40">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setScreenState('app_shell');
                  setActiveTab('notifications');
                }}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200"
              >
                {t('viewAll')} {t('notifications')} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
