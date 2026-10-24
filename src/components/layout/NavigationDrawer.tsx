/**
 * FarmConnect Slide-Over Navigation Drawer
 * Contains full portal navigation links, role switcher, profile header, language & theme toggles.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';
import { useAppState } from '../../context/AppStateContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab, NavItem, Language } from '../../types';

export const NavigationDrawer: React.FC = () => {
  const { drawerOpen, setDrawerOpen, activeTab, setActiveTab, setScreenState } = useAppState();
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const menuSections: Array<{ title: string; items: Array<{ id: ActiveTab; labelKey: string; icon: string; badge?: string }> }> = [
    {
      title: 'Core Ecosystem',
      items: [
        { id: 'home', labelKey: 'home', icon: 'space_dashboard' },
        { id: 'products', labelKey: 'products', icon: 'eco' },
        { id: 'orders', labelKey: 'orders', icon: 'receipt_long' },
      ],
    },
    {
      title: 'Agri Marketplaces',
      items: [
        { id: 'worker_marketplace', labelKey: 'workerMarketplace', icon: 'groups', badge: 'Hot' },
        { id: 'equipment_marketplace', labelKey: 'equipmentMarketplace', icon: 'precision_manufacturing' },
        { id: 'livestock_marketplace', labelKey: 'livestockMarketplace', icon: 'pets' },
      ],
    },
    {
      title: 'Smart Agri Services',
      items: [
        { id: 'ai_assistant', labelKey: 'aiAssistant', icon: 'smart_toy', badge: 'AI' },
        { id: 'govt_schemes', labelKey: 'govtSchemes', icon: 'account_balance' },
        { id: 'weather', labelKey: 'weather', icon: 'partly_cloudy_day' },
        { id: 'crop_calendar', labelKey: 'cropCalendar', icon: 'calendar_month' },
        { id: 'knowledge_hub', labelKey: 'knowledgeHub', icon: 'menu_book' },
      ],
    },
    {
      title: 'Account & Settings',
      items: [
        { id: 'notifications', labelKey: 'notifications', icon: 'notifications' },
        { id: 'payments', labelKey: 'payments', icon: 'account_balance_wallet' },
        { id: 'settings', labelKey: 'settings', icon: 'settings' },
        { id: 'help', labelKey: 'help', icon: 'help' },
        { id: 'about', labelKey: 'about', icon: 'info' },
      ],
    },
  ];

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
    setScreenState('app_shell');
  };

  const handleSwitchRole = () => {
    setDrawerOpen(false);
    setScreenState('role_selection');
  };

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    setScreenState('login');
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-0 bottom-0 left-0 w-80 sm:w-96 glass-card-light dark:glass-card-dark border-r border-emerald-200/80 dark:border-emerald-700/60 shadow-2xl flex flex-col z-10"
          >
            {/* Header / User Profile */}
            <div className="p-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Icon name="agriculture" size={20} />
                  </div>
                  <span className="font-extrabold text-sm tracking-wide">FarmConnect</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white/80 transition-colors"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {/* Profile Card */}
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-bold text-lg flex items-center justify-center shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">{user?.name || 'Agri User'}</h3>
                  <p className="text-xs text-emerald-200/80 truncate">{user?.emailOrPhone || 'user@farmconnect.ag'}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="amber" size="sm" icon="verified">
                      {role ? `${role.toUpperCase()}` : 'No Role'}
                    </Badge>
                    <button
                      onClick={handleSwitchRole}
                      className="text-[10px] underline font-semibold text-amber-200 hover:text-white"
                    >
                      Switch Role
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions (Theme / Lang) */}
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/60 border-b border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between text-xs font-semibold px-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-emerald-400">{t('language')}:</span>
                {(['en', 'te', 'hi'] as Language[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] uppercase transition-colors ${
                      language === lang
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-slate-700 dark:text-emerald-200 hover:bg-emerald-200/50'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-xl bg-white dark:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 shadow-sm"
              >
                <Icon name={isDarkMode ? 'light_mode' : 'dark_mode'} size={18} />
              </button>
            </div>

            {/* Scrollable Navigation Menu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {menuSections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-emerald-500/80 px-2">
                    {sec.title}
                  </h4>
                  <div className="space-y-1">
                    {sec.items.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-md shadow-emerald-800/20'
                              : 'text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon name={item.icon} size={20} filled={isActive} />
                            <span>{t(item.labelKey)}</span>
                          </div>
                          {item.badge && (
                            <Badge variant={isActive ? 'amber' : 'emerald'} size="sm">
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer (Logout) */}
            <div className="p-4 border-t border-emerald-100 dark:border-emerald-800/40 bg-slate-50/50 dark:bg-emerald-950/80">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-2xl bg-red-50 dark:bg-rose-950/40 hover:bg-red-100 dark:hover:bg-rose-900/60 text-red-700 dark:text-rose-300 border border-red-200/60 dark:border-rose-800/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Icon name="logout" size={18} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
