/**
 * Notification Center Screen
 * Categorized real-time push feed for orders, weather warnings, price surges, and schemes.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAppState } from '../../context/AppStateContext';

type NotifCat = 'All' | 'Weather' | 'Market' | 'Schemes' | 'Orders' | 'Worker';

export const NotificationCenterScreen: React.FC = () => {
  const {
    notifications,
    unreadCount,
    toggleNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    setActiveTab,
  } = useAppState();
  const [selectedCat, setSelectedCat] = useState<NotifCat>('All');
  const [activeModalItem, setActiveModalItem] = useState<any>(null);

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNotificationRead(id);
  };

  const filteredNotifications = selectedCat === 'All'
    ? notifications
    : notifications.filter(n => n.category === selectedCat || n.type === selectedCat.toLowerCase());

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-emerald-100">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <Badge variant="rose" size="sm">{unreadCount} New</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-emerald-400 mt-0.5">
            Real-time push alerts for orders, weather warnings, price surges, and government schemes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={markAllNotificationsRead}>
            <Icon name="done_all" size={16} />
            Mark All Read
          </Button>
          <Button size="sm" variant="outline" onClick={clearAllNotifications} className="text-rose-600 border-rose-300">
            <Icon name="delete_sweep" size={16} />
            Clear
          </Button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-emerald-100 dark:border-emerald-800/40">
        {['All', 'Weather', 'Market', 'Schemes', 'Orders', 'Worker'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat as NotifCat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Icon name="notifications_off" size={48} className="mx-auto text-emerald-500 mb-2 opacity-60" />
            <p className="font-bold text-slate-700 dark:text-emerald-200">No Notifications</p>
            <p className="text-xs">You are all caught up! No active alerts in this category.</p>
          </Card>
        ) : (
          filteredNotifications.map((item) => (
            <motion.div key={item.id} layout>
              <Card
                onClick={() => setActiveModalItem(item)}
                className={`p-4 transition-all cursor-pointer hover:shadow-lg ${
                  !item.read
                    ? 'border-l-4 border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40'
                    : 'opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                      <Icon
                        name={
                          item.category === 'Weather' ? 'water_drop' :
                          item.category === 'Market' ? 'trending_up' :
                          item.category === 'Schemes' ? 'account_balance' :
                          item.category === 'Orders' ? 'local_shipping' : 'engineering'
                        }
                        size={20}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={item.priority === 'high' ? 'rose' : 'emerald'} size="sm">
                          {item.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-emerald-100">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-emerald-300 line-clamp-2">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleToggleRead(item.id, e)}
                    className="p-1 text-slate-400 hover:text-emerald-600"
                    title={item.read ? 'Mark Unread' : 'Mark Read'}
                  >
                    <Icon name={item.read ? 'radio_button_unchecked' : 'check_circle'} size={20} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant="emerald">{activeModalItem.category}</Badge>
                <button onClick={() => setActiveModalItem(null)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={24} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100">
                {activeModalItem.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-emerald-300 leading-relaxed">
                {activeModalItem.message}
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setActiveModalItem(null)}>
                  Close
                </Button>
                {activeModalItem.actionTab && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setActiveTab(activeModalItem.actionTab);
                      setActiveModalItem(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Icon name="open_in_new" size={16} />
                    Open Related Module
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
